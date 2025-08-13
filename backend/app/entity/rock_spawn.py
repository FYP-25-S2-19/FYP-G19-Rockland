# 📄 rock_spawn.py

from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from math import radians, sin, cos, sqrt, atan2
import random
import math

from app.models import db
from app.entity.user_rock_spawn import UserRockSpawn
from app.entity.rock import Rock
from app.entity.zone_profile import ZoneProfile


class RockSpawn(db.Model):
    __tablename__ = "rock_spawn"

    rock_spawn_id = db.Column(db.Integer, primary_key=True)
    rock_id = db.Column(db.Integer, db.ForeignKey("rock.rock_id"), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    location_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    rock = db.relationship("Rock", backref="spawns")

    # -------------------------------
    # Utility: Haversine distance (Python)
    # -------------------------------
    @staticmethod
    def haversine(lat1, lng1, lat2, lng2):
        """Calculate distance in meters between two coordinates."""
        R = 6371000  # Earth radius in meters
        d_lat = radians(lat2 - lat1)
        d_lng = radians(lng2 - lng1)
        a = sin(d_lat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return R * c

    # -------------------------------
    # Utility: Haversine (SQL expression)
    # -------------------------------
    @classmethod
    def _haversine_sql(cls, lat1, lng1, lat2, lng2):
        inner = (
            func.sin(func.radians(lat1)) * func.sin(func.radians(lat2)) +
            func.cos(func.radians(lat1)) * func.cos(func.radians(lat2)) *
            func.cos(func.radians(lng2) - func.radians(lng1))
        )
        inner = func.least(1.0, func.greatest(-1.0, inner))
        return func.acos(inner) * 6371000.0

    # -------------------------------
    # Serialization
    # -------------------------------
    def to_dict(self):
        return {
            "rock_spawn_id": self.rock_spawn_id,
            "rock_id": self.rock_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location_name": self.location_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.replace(tzinfo=timezone.utc).isoformat(),
            "rock": self.rock.to_dict()
        }

    # -------------------------------
    # Expiration logic based on rarity
    # -------------------------------
    @classmethod
    def generate_expiration(cls, rarity: str) -> datetime:
        now = datetime.utcnow()

        if rarity.lower() == "common":
            return now + timedelta(minutes=15)
        elif rarity.lower() == "rare":
            return now + timedelta(minutes=random.uniform(5, 7))
        elif rarity.lower() == "legendary":
            return now + timedelta(minutes=random.uniform(2, 4))
        return now + timedelta(minutes=5)

    # -------------------------------
    # Collect spawn (with 150m check)
    # -------------------------------
    @classmethod
    def collect_spawn(cls, user_id: int, rock_spawn_id: int, user_lat: float = None, user_lng: float = None):
        try:
            spawn = cls.query.get(rock_spawn_id)
            if not spawn:
                return False, 404, "Spawn not found", None

            if spawn.expires_at < datetime.utcnow():
                return False, 400, "Spawn expired", None

            if user_lat is not None and user_lng is not None:
                distance = cls.haversine(user_lat, user_lng, spawn.latitude, spawn.longitude)
                if distance > 150:
                    return False, 403, f"Too far to collect ({int(distance)}m away)", None

            if UserRockSpawn.has_already_collected(user_id, rock_spawn_id):
                return False, 409, "Already collected", None

            success, status, msg, new_entry = UserRockSpawn.create(user_id, rock_spawn_id)
            return success, status, msg, {
                "collected_at": new_entry.collected_at.isoformat()
            } if new_entry else None

        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}", None

    # -------------------------------
    # Helper: resolve zone robustly (bbox+pad, then nearest fallback)
    # -------------------------------
    @staticmethod
    def _resolve_zone(lat: float, lng: float, pad: float = 0.001):
        """
        Polygon-first zone resolution:
        1) Try exact polygon hit among bbox+pad candidates
        2) If none: return best bbox match
        3) Else: nearest zone center as last fallback
        """
        # Prefer the entity’s polygon-first resolver if present
        try:
            z, how = ZoneProfile.find_zone_for_point(lat, lng, pad=pad, use_fallback=True)
            if z:
                return z, how  # how in {"polygon","bbox","nearest"}
        except AttributeError:
            pass  # legacy code path below

        # Legacy fallback: bbox-first (but verify polygon containment if possible)
        try:
            zone = ZoneProfile.get_zone_by_coordinates(lat, lng, pad=pad)
        except TypeError:
            zone = ZoneProfile.get_zone_by_coordinates(lat, lng)
        if zone:
            try:
                # If polygon exists and actually contains the point, call it "polygon"
                if zone.contains(lat, lng):
                    return zone, "polygon"
            except Exception:
                pass
            return zone, "bbox"

        # Nearest center fallback
        center_lat = (ZoneProfile.lat_min + ZoneProfile.lat_max) / 2.0
        center_lng = (ZoneProfile.lng_min + ZoneProfile.lng_max) / 2.0
        dist_expr = func.sqrt(func.pow(center_lat - float(lat), 2) + func.pow(center_lng - float(lng), 2))
        nearest = ZoneProfile.query.filter(ZoneProfile.is_active.is_(True)).order_by(dist_expr.asc()).first()
        if nearest:
            return nearest, "nearest"
        return None, None


    # -------------------------------
    # Helper: fetch nearby, unexpired, uncollected spawns
    # -------------------------------
    @classmethod
    def fetch_nearby_uncollected(cls, user_id: int, lat: float, lng: float, radius_m: float = 1000):
        # 1) rough degrees per meter
        lat_deg = radius_m / 111_000.0
        # protect near poles; use cos(lat) scaling for longitude
        lng_scale = math.cos(math.radians(lat))
        if abs(lng_scale) < 0.3:  # safety
            lng_scale = 0.3
        lng_deg = radius_m / (111_000.0 * lng_scale)

        # 2) SQL bbox prefilter (fast, portable)
        candidates = (
            cls.query
            .join(Rock, Rock.rock_id == cls.rock_id)
            .filter(cls.expires_at > datetime.utcnow())
            .filter(cls.latitude.between(lat - lat_deg, lat + lat_deg))
            .filter(cls.longitude.between(lng - lng_deg, lng + lng_deg))
            .all()
        )

        # 3) Exact distance in Python
        in_radius = []
        for s in candidates:
            d = cls.haversine(lat, lng, s.latitude, s.longitude)
            if d <= radius_m:
                in_radius.append(s)

        

        if user_id is not None:
            collected_ids = {
                s.rock_spawn_id for s in UserRockSpawn.query.filter_by(user_id=user_id).all()
            }
        else:
            collected_ids = set()
        return [s.to_dict() for s in in_radius if s.rock_spawn_id not in collected_ids]

    # -------------------------------
    # NEW: Full flow for controller (recommended)
    # -------------------------------
    @classmethod
    def nearby_with_zone_and_autospawn(cls, user_id: int, lat: float, lng: float, radius_m: float = 1000):
        try:
            # before: pad=0.004 (more overlap)
            zone, how = cls._resolve_zone(lat, lng, pad=0.001)
            if not zone:
                return True, 200, {
                    "success": True,
                    "message": "No zone found for location",
                    "zone": None,
                    "spawns": [],
                    "spawn_count": 0,
                    "zone_match_method": None,
                }

            spawns = cls.fetch_nearby_uncollected(user_id, lat, lng, radius_m)
            if len(spawns) == 0:
                from app.utils.spawn_generator import generate_dynamic_spawn
                generate_dynamic_spawn(lat, lng, zone)
                spawns = cls.fetch_nearby_uncollected(user_id, lat, lng, radius_m)

            payload = {
                "success": True,
                "message": "Nearby spawns fetched",
                "zone": zone.to_dict(),
                "spawns": spawns,
                "spawn_count": len(spawns),
                "zone_match_method": how,   # keep this for debugging
            }
            return True, 200, payload

        except Exception as e:
            return False, 500, {
                "success": False,
                "message": f"Error: {str(e)}",
                "zone": None,
                "spawns": [],
                "spawn_count": 0,
                "zone_match_method": None,
            }

    # -------------------------------
    # ORIGINAL: Get nearby spawns (kept, but made zone lookup more forgiving)
    # -------------------------------
    @classmethod
    def get_nearby_spawns(cls, user_id: int, lat: float, lng: float, radius: float = 1000):
        try:
            def haversine_formula(lat1, lng1, lat2, lng2):
                inner = (
                    func.sin(func.radians(lat1)) * func.sin(func.radians(lat2)) +
                    func.cos(func.radians(lat1)) * func.cos(func.radians(lat2)) *
                    func.cos(func.radians(lng2) - func.radians(lng1))
                )
                inner = func.least(1.0, func.greatest(-1.0, inner))
                return func.acos(inner) * 6371000.0

            all_spawns = (
                cls.query
                .join(Rock, Rock.rock_id == cls.rock_id)
                .filter(cls.expires_at > datetime.utcnow())
                .filter(haversine_formula(lat, lng, cls.latitude, cls.longitude) <= radius)
                .all()
            )

            collected_ids = {s.rock_spawn_id for s in UserRockSpawn.query.filter_by(user_id=user_id).all()}
            result = [spawn.to_dict() for spawn in all_spawns if spawn.rock_spawn_id not in collected_ids]

            # NEW: polygon-first zone resolution (same as other path)
            zone, how = cls._resolve_zone(lat, lng, pad=0.001)
            zone_info = zone.to_dict() if zone else None

            return True, 200, "Nearby spawns fetched", {
                "zone": zone_info,
                "spawns": result,
                "zone_match_method": how,
            }

        except Exception as e:
            return False, 500, f"Error: {str(e)}", {}

    # -------------------------------
    # Delete expired spawns
    # -------------------------------
    @classmethod
    def delete_expired(cls):
        """Remove expired spawns from DB (used in cron or refresh)."""
        try:
            now = datetime.utcnow()
            deleted = cls.query.filter(cls.expires_at < now).delete()
            db.session.commit()
            return True, f"🧹 Deleted {deleted} expired spawns."
        except Exception as e:
            db.session.rollback()
            return False, f"Delete error: {str(e)}"

    @classmethod
    def refresh_at(cls, lat: float, lng: float, radius_m: float = 1000):
        """
        Resolve zone (polygon-first), trigger a dynamic spawn there (cooldown-aware),
        and return a payload similar to /nearby so the client can refresh UI right away.
        """
        try:
            # polygon-first + tighter pad to reduce bbox overlaps
            zone, how = cls._resolve_zone(lat, lng, pad=0.001)
            if not zone:
                return False, 404, {
                    "success": False,
                    "message": "No zone found for this location",
                    "zone": None,
                    "spawns": [],
                    "spawn_count": 0,
                    "zone_match_method": None,
                }

            # count live before (so we can report how many were added)
            now = datetime.utcnow()
            before_count = (
                cls.query
                .filter(cls.location_name == zone.zone_name, cls.expires_at > now)
                .count()
            )

            # cooldown-aware dynamic spawn near the provided point
            from app.utils.spawn_generator import generate_dynamic_spawn
            generate_dynamic_spawn(lat, lng, zone)

            # fetch nearby after spawning
            spawns = cls.fetch_nearby_uncollected(user_id=None, lat=lat, lng=lng, radius_m=radius_m)

            # count live after
            after_count = (
                cls.query
                .filter(cls.location_name == zone.zone_name, cls.expires_at > now)
                .count()
            )
            spawned_now = max(0, after_count - before_count)

            return True, 200, {
                "success": True,
                "message": f"Spawn refresh triggered in zone '{zone.zone_name}' (match: {how})",
                "zone": zone.to_dict(),
                "zone_match_method": how,
                "spawns": spawns,
                "spawn_count": len(spawns),
                "spawned_now": spawned_now,
            }
        except Exception as e:
            return False, 500, {
                "success": False,
                "message": f"Error refreshing spawns: {str(e)}",
                "zone": None,
                "spawns": [],
                "spawn_count": 0,
                "zone_match_method": None,
            }