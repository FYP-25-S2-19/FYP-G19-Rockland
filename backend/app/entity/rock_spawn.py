# 📄 rock_spawn.py

from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from math import radians, sin, cos, sqrt, atan2
import random

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
    # Utility: Haversine distance
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
            "rock": self.rock.to_dict()  # Assumes Rock.to_dict() includes name, rarity, etc.
        }

    # -------------------------------
    # Expiration logic based on rarity
    # -------------------------------
   
    @classmethod
    def generate_expiration(cls, rarity: str) -> datetime:
        now = datetime.utcnow()

        if rarity.lower() == "common":
            # Flat 15 minutes
            return now + timedelta(minutes=15)

        elif rarity.lower() == "rare":
            # Random between 5 and 7 minutes
            return now + timedelta(minutes=random.uniform(5, 7))

        elif rarity.lower() == "legendary":
            # Random between 2 and 4 minutes
            return now + timedelta(minutes=random.uniform(2, 4))

        # Default fallback (e.g., if rarity is missing or unknown)
        return now + timedelta(minutes=5)

    # -------------------------------
    # Collect spawn (with 150m check)
    # -------------------------------
    @classmethod
    def collect_spawn(cls, user_id: int, rock_spawn_id: int, user_lat: float = None, user_lng: float = None):
        """
        Collect a rock spawn if:
        - It exists
        - It hasn't expired
        - User hasn't collected it before
        - User is within 150m of the spawn (if coordinates provided)
        """
        try:
            spawn = cls.query.get(rock_spawn_id)
            if not spawn:
                return False, 404, "Spawn not found", None

            # Expiration check
            if spawn.expires_at < datetime.utcnow():
                return False, 400, "Spawn expired", None

            # Distance check (150m)
            if user_lat is not None and user_lng is not None:
                distance = cls.haversine(user_lat, user_lng, spawn.latitude, spawn.longitude)
                if distance > 150:
                    return False, 403, f"Too far to collect ({int(distance)}m away)", None

            # Already collected?
            if UserRockSpawn.has_already_collected(user_id, rock_spawn_id):
                return False, 409, "Already collected", None

            # Create user-rock spawn and add to collection
            success, status, msg, new_entry = UserRockSpawn.create(user_id, rock_spawn_id)
            return success, status, msg, {
                "collected_at": new_entry.collected_at.isoformat()
            } if new_entry else None

        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}", None

    # -------------------------------
    # Get nearby spawns (shared map)
    # -------------------------------
    @classmethod
    def get_nearby_spawns(cls, user_id: int, lat: float, lng: float, radius: float = 1000):
        """
        Fetch all valid (unexpired, uncollected) spawns within `radius` meters.
        Returns zone info + list of spawns.
        """
        try:
            def haversine_formula(lat1, lng1, lat2, lng2):
                return func.acos(
                    func.sin(func.radians(lat1)) * func.sin(func.radians(lat2)) +
                    func.cos(func.radians(lat1)) * func.cos(func.radians(lat2)) *
                    func.cos(func.radians(lng2) - func.radians(lng1))
                ) * 6371000  # Earth radius in meters

            # Query all spawns within radius
            all_spawns = (
                cls.query
                .join(Rock, Rock.rock_id == cls.rock_id)
                .filter(cls.expires_at > datetime.utcnow())
                .filter(haversine_formula(lat, lng, cls.latitude, cls.longitude) <= radius)
                .all()
            )

            # Exclude already collected by user
            collected_ids = {
                s.rock_spawn_id for s in
                UserRockSpawn.query.filter_by(user_id=user_id).all()
            }

            result = [
                spawn.to_dict() for spawn in all_spawns
                if spawn.rock_spawn_id not in collected_ids
            ]

            # Attach zone info
            zone = ZoneProfile.get_zone_by_coordinates(lat, lng)
            zone_info = zone.to_dict() if zone else None

            return True, 200, "Nearby spawns fetched", {
                "zone": zone_info,
                "spawns": result
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
