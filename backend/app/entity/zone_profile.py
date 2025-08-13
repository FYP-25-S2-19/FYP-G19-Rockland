# app/entity/zone_profile.py — FULL ENTITY (with controller-compat aliases)
from __future__ import annotations
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import func
from app.models import db


class ZoneProfile(db.Model):
    __tablename__ = "zone_profile"

    # ---- Identity & labels ----
    zone_id = db.Column(db.Integer, primary_key=True)
    zone_name = db.Column(db.String(100), nullable=False, unique=True)
    geological_name = db.Column(db.String(255), nullable=False)

    # ---- Spawn semantics ----
    rock_type = db.Column(db.String(100), nullable=False)
    key_rock = db.Column(db.String(100), nullable=False)
    

    # ---- Bounding box (auto-computed when polygon is set/updated) ----
    lat_min = db.Column(db.Float, nullable=False)
    lat_max = db.Column(db.Float, nullable=False)
    lng_min = db.Column(db.Float, nullable=False)
    lng_max = db.Column(db.Float, nullable=False)

    # ---- Polygon-first geometry ----
    polygon_geojson = db.Column(db.JSON, nullable=True)  # GeoJSON Polygon | MultiPolygon | Feature | FeatureCollection

    # ---- Admin flags ----
    priority = db.Column(db.Integer, nullable=False, default=0)  # higher = preferred
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    # ---- Spawn tuning ----
    density = db.Column(db.String(20), nullable=False, default="medium")
    spawn_cooldown_minutes = db.Column(db.Integer, nullable=False, default=15)
    max_spawn_count = db.Column(db.Integer, nullable=False, default=15)

    # ------------------------------------------------------------------
    # SERIALIZATION
    # ------------------------------------------------------------------
    def to_dict(self, include_polygon: bool = False) -> Dict[str, Any]:
        data = {
            "zone_id": self.zone_id,
            "zone_name": self.zone_name,
            "geological_name": self.geological_name,
            "rock_type": self.rock_type,
            "key_rock": self.key_rock,
            "lat_min": self.lat_min,
            "lat_max": self.lat_max,
            "lng_min": self.lng_min,
            "lng_max": self.lng_max,
            "priority": self.priority,
            "is_active": self.is_active,
            "density": self.density,
            "spawn_cooldown_minutes": self.spawn_cooldown_minutes,
            "max_spawn_count": self.max_spawn_count,
        }
        if include_polygon:
            data["polygon_geojson"] = self.polygon_geojson
        return data

    # ------------------------------------------------------------------
    # GEOMETRY HELPERS
    # ------------------------------------------------------------------
    @staticmethod
    def _normalize_geojson(geojson: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Accept Feature/FeatureCollection and return bare geometry (Polygon/MultiPolygon) where possible."""
        if not geojson:
            return None
        t = geojson.get("type")
        if t in ("Polygon", "MultiPolygon"):
            return geojson
        if t == "Feature":
            geom = geojson.get("geometry")
            if geom and geom.get("type") in ("Polygon", "MultiPolygon"):
                return geom
            return None
        if t == "FeatureCollection":
            feats = geojson.get("features") or []
            for f in feats:
                geom = (f or {}).get("geometry")
                if geom and geom.get("type") in ("Polygon", "MultiPolygon"):
                    return geom
            return None
        return None

    @staticmethod
    def _bbox_from_geojson(geojson: Dict[str, Any]) -> Optional[Tuple[float, float, float, float]]:
        geom = ZoneProfile._normalize_geojson(geojson)
        if not geom:
            return None
        coords: List[Tuple[float, float]] = []  # (lat, lng)
        gtype = geom.get("type")
        if gtype == "Polygon":
            rings: List[List[List[float]]] = geom.get("coordinates", [])
            for ring in rings:
                for lng, lat in ring:
                    coords.append((lat, lng))
        elif gtype == "MultiPolygon":
            polys: List[List[List[List[float]]]] = geom.get("coordinates", [])
            for poly in polys:
                for ring in poly:
                    for lng, lat in ring:
                        coords.append((lat, lng))
        else:
            return None
        if not coords:
            return None
        lats = [c[0] for c in coords]
        lngs = [c[1] for c in coords]
        return min(lats), max(lats), min(lngs), max(lngs)

    @staticmethod
    def _point_in_ring(point: Tuple[float, float], ring: List[List[float]]) -> bool:
        # Ray-casting algorithm (ring: [[lng, lat], ...])
        x, y = point[1], point[0]
        inside = False
        n = len(ring)
        for i in range(n):
            x1, y1 = ring[i][0], ring[i][1]
            x2, y2 = ring[(i + 1) % n][0], ring[(i + 1) % n][1]
            if ((y1 > y) != (y2 > y)) and (x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1):
                inside = not inside
        return inside

    @classmethod
    def _point_in_polygon(cls, lat: float, lng: float, polygon: Dict[str, Any]) -> bool:
        rings = polygon.get("coordinates", [])
        if not rings:
            return False
        outer = rings[0]
        if not cls._point_in_ring((lat, lng), outer):
            return False
        for hole in rings[1:]:
            if cls._point_in_ring((lat, lng), hole):
                return False
        return True

    @classmethod
    def _point_in_multipolygon(cls, lat: float, lng: float, multipolygon: Dict[str, Any]) -> bool:
        for polygon in multipolygon.get("coordinates", []):
            if not polygon:
                continue
            poly_obj = {"type": "Polygon", "coordinates": polygon}
            if cls._point_in_polygon(lat, lng, poly_obj):
                return True
        return False

    def contains(self, lat: float, lng: float) -> bool:
        if self.polygon_geojson:
            geom = self._normalize_geojson(self.polygon_geojson)
            if geom:
                gtype = geom.get("type")
                if gtype == "Polygon" and self._point_in_polygon(lat, lng, geom):
                    return True
                if gtype == "MultiPolygon" and self._point_in_multipolygon(lat, lng, geom):
                    return True
        return self.lat_min <= lat <= self.lat_max and self.lng_min <= lng <= self.lng_max

    # ------------------------------------------------------------------
    # RESOLVERS
    # ------------------------------------------------------------------
    @classmethod
    def _area_expr(cls):
        return (cls.lat_max - cls.lat_min) * (cls.lng_max - cls.lng_min)

    @classmethod
    def get_zone_by_coordinates(cls, lat: float, lng: float, pad: float = 0.0):
        lat = float(lat); lng = float(lng)
        return (
            cls.query
            .filter(cls.is_active.is_(True))
            .filter(
                cls.lat_min - pad <= lat,
                cls.lat_max + pad >= lat,
                cls.lng_min - pad <= lng,
                cls.lng_max + pad >= lng,
            )
            .order_by(cls.priority.desc(), cls._area_expr().asc())
            .first()
        )

    @classmethod
    def get_nearest_zone(cls, lat: float, lng: float):
        center_lat = (cls.lat_min + cls.lat_max) / 2.0
        center_lng = (cls.lng_min + cls.lng_max) / 2.0
        dist = func.sqrt(func.pow(center_lat - lat, 2) + func.pow(center_lng - lng, 2))
        return cls.query.filter(cls.is_active.is_(True)).order_by(dist.asc()).first()

    @classmethod
    def find_zone_for_point(
        cls, lat: float, lng: float, pad: float = 0.0, use_fallback: bool = True
    ) -> Tuple[Optional["ZoneProfile"], Optional[str]]:
        lat = float(lat); lng = float(lng)
        candidates: List[ZoneProfile] = (
            cls.query
            .filter(cls.is_active.is_(True))
            .filter(
                cls.lat_min - pad <= lat,
                cls.lat_max + pad >= lat,
                cls.lng_min - pad <= lng,
                cls.lng_max + pad >= lng,
            )
            .order_by(cls.priority.desc(), cls._area_expr().asc())
            .all()
        )
        poly_hits: List[ZoneProfile] = []
        for z in candidates:
            geom = z.polygon_geojson and cls._normalize_geojson(z.polygon_geojson)
            if not geom:
                continue
            gtype = geom.get("type")
            if (gtype == "Polygon" and cls._point_in_polygon(lat, lng, geom)) or \
               (gtype == "MultiPolygon" and cls._point_in_multipolygon(lat, lng, geom)):
                poly_hits.append(z)
        if poly_hits:
            return poly_hits[0], "polygon"
        if candidates:
            return candidates[0], "bbox"
        if use_fallback:
            nz = cls.get_nearest_zone(lat, lng)
            if nz:
                return nz, "nearest"
        return None, None

    # ------------------------------------------------------------------
    # CRUD (controllers are pass-through)
    # ------------------------------------------------------------------
    @classmethod
    def create_zone(cls, data: Dict[str, Any]):
        required = ["zone_name", "geological_name", "rock_type", "key_rock"]
        for f in required:
            if not data.get(f):
                return False, 400, f"{f} is required", None
        if cls.query.filter_by(zone_name=data["zone_name"]).first():
            return False, 400, "Zone name already exists", None

        # Polygon-first → auto bbox
        poly = data.get("polygon_geojson")
        if poly:
            bbox = cls._bbox_from_geojson(poly)
            if not bbox:
                return False, 400, "Invalid polygon_geojson", None
            data = {**data, "lat_min": bbox[0], "lat_max": bbox[1], "lng_min": bbox[2], "lng_max": bbox[3]}
        else:
            for f in ["lat_min", "lat_max", "lng_min", "lng_max"]:
                if data.get(f) is None:
                    return False, 400, f"{f} is required when polygon_geojson is missing", None
            if float(data["lat_min"]) >= float(data["lat_max"]) or float(data["lng_min"]) >= float(data["lng_max"]):
                return False, 400, "Invalid bbox: min must be less than max", None

        try:
            z = cls(**data)
            db.session.add(z)
            db.session.commit()
            return True, 201, "Zone created", z.to_dict(include_polygon=True)
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Create error: {str(e)}", None

    @classmethod
    def update_zone(cls, zone_id: int, data: Dict[str, Any]):
        z = cls.query.get(zone_id)
        if not z:
            return False, 404, "Zone not found", None

        # If polygon provided → recompute bbox
        if "polygon_geojson" in data and data["polygon_geojson"]:
            bbox = cls._bbox_from_geojson(data["polygon_geojson"])
            if not bbox:
                return False, 400, "Invalid polygon_geojson", None
            data = {**data, "lat_min": bbox[0], "lat_max": bbox[1], "lng_min": bbox[2], "lng_max": bbox[3]}

        # Validate bbox (either incoming or existing)
        lat_min = float(data.get("lat_min", z.lat_min))
        lat_max = float(data.get("lat_max", z.lat_max))
        lng_min = float(data.get("lng_min", z.lng_min))
        lng_max = float(data.get("lng_max", z.lng_max))
        if lat_min >= lat_max or lng_min >= lng_max:
            return False, 400, "Invalid bbox: min must be less than max", None

        try:
            for k, v in data.items():
                setattr(z, k, v)
            db.session.commit()
            return True, 200, "Zone updated", z.to_dict(include_polygon=True)
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Update error: {str(e)}", None

    @classmethod
    def set_active(cls, zone_id: int, value: bool, reason: str | None = None):
        try:
            z = cls.query.get(zone_id)
            if not z:
                return False, 404, "Zone not found", None
            z.is_active = bool(value)
            db.session.commit()
            return True, 200, ("Zone activated" if value else "Zone suspended"), z.to_dict()
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Update error: {str(e)}", None

    @classmethod
    def delete_zone(cls, zone_id: int):
        z = cls.query.get(zone_id)
        if not z:
            return False, 404, "Zone not found"
        try:
            db.session.delete(z)
            db.session.commit()
            return True, 200, "Zone deleted"
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Delete error: {str(e)}"

    # ------------------------------------------------------------------
    # ADMIN/PUBLIC QUERIES (primary)
    # ------------------------------------------------------------------
    @classmethod
    def list_admin(cls):
        try:
            zones = cls.query.order_by(cls.zone_id.desc()).all()
            return True, 200, "ok", [z.to_dict(include_polygon=True) for z in zones]
        except Exception as e:
            return False, 500, str(e), []

    @classmethod
    def list_public(cls):
        try:
            zones = (
                cls.query
                .filter(cls.is_active.is_(True))
                .order_by(cls.priority.desc(), cls.zone_id.desc())
                .all()
            )
            return True, 200, "ok", [z.to_dict(include_polygon=False) for z in zones]
        except Exception as e:
            return False, 500, str(e), []

    @classmethod
    def get_admin(cls, zone_id: int):
        z = cls.query.get(zone_id)
        if not z:
            return False, 404, "Zone not found", None
        return True, 200, "ok", z.to_dict(include_polygon=True)

    # ------------------------------------------------------------------
    # CONTROLLER-COMPAT ALIASES (so you don't have to change controllers)
    # ------------------------------------------------------------------
    @classmethod
    def getAllZonesForAdmin(cls):
        """Controller expects: (zones_list, status_code)"""
        ok, status, _msg, zones = cls.list_admin()
        return (zones if ok else None), status

    @classmethod
    def getZoneById(cls, zone_id: int):
        """Controller expects: (zone_dict|None, status, message)"""
        ok, status, msg, zone = cls.get_admin(zone_id)
        return (zone if ok else None), status, msg

    @classmethod
    def get_all_zones(cls):
        """Public list: controller expects (success, status, message, zones)"""
        return cls.list_public()
