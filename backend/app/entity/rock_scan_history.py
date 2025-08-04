from datetime import datetime, date
from typing import Optional, Tuple
from urllib.parse import urlparse
from app.models import db
from app.entity.zone_profile import ZoneProfile
from app.entity.rock import Rock
from app.entity.user_rock_collection import UserRockCollection


class RockScanHistory(db.Model):
    __tablename__ = "rock_scan_history"

    scan_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    rock_id = db.Column(db.Integer, db.ForeignKey("rock.rock_id"), nullable=True)
    rock_name = db.Column(db.String(100), nullable=False)
    rock_type = db.Column(db.String(100), nullable=False)
    rarity = db.Column(db.String(50), nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    scan_datetime = db.Column(db.DateTime, default=datetime.utcnow)

    # Optional location data
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location_name = db.Column(db.String(255), nullable=True)

    # ---------------- Serialization ----------------
    def to_dict(self) -> dict:
        return {
            "scan_id": self.scan_id,
            "user_id": self.user_id,
            "rock_id": self.rock_id,
            "rock_name": self.rock_name,
            "rock_type": self.rock_type,
            "rarity": self.rarity,
            "image_url": self.image_url,
            "scan_datetime": self.scan_datetime.isoformat() if self.scan_datetime else None,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location_name": self.location_name,
        }

    # ---------------- Utility Methods ----------------
    @classmethod
    def get_today_scan_count(cls, user_id: int) -> int:
        """Count scans performed today by this user."""
        today = date.today()
        return cls.query.filter(
            cls.user_id == user_id,
            db.func.date(cls.scan_datetime) == today
        ).count()
    
    @classmethod
    def check_user_scan_limit(cls, user_id: int):
        """
        Check if the user exceeded daily scan limit.
        Returns dict with: { limit_exceeded: bool, scan_count: int, limit: int or None }
        """
        from app.entity.user import User
        user = User.queryUserById(user_id)
        if not user:
            return {
                "success": False,
                "error": "User not found",
                "limit_exceeded": False,
                "scan_count": 0,
                "limit": None
            }

        # Get today's count
        scan_count = cls.get_today_scan_count(user_id)

        # Determine limit (only Free users have limit)
        limit = 5 if user.user_type and user.user_type.name == "Free" else None

        # Check exceeded
        limit_exceeded = limit is not None and scan_count >= limit

        return {
            "success": True,
            "limit_exceeded": limit_exceeded,
            "scan_count": scan_count,
            "limit": limit
        }

    @staticmethod
    def get_zone_name_by_coordinates(lat: float, lng: float) -> Optional[str]:
        """Return geological zone name if coordinates fall within a zone profile."""
        zone = ZoneProfile.query.filter(
            ZoneProfile.lat_min <= lat,
            ZoneProfile.lat_max >= lat,
            ZoneProfile.lng_min <= lng,
            ZoneProfile.lng_max >= lng
        ).first()
        return zone.geological_name if zone else None

    @staticmethod
    def extract_blob_path(signed_url: str) -> str:
        """Extract blob path from signed URL (strip bucket prefix)."""
        parsed = urlparse(signed_url)
        path_parts = parsed.path.lstrip("/").split("/", 1)
        return path_parts[1] if len(path_parts) > 1 else ""

    # ---------------- Core Methods ----------------
    @classmethod
    def create_scan_record(cls,
                           user_id: int,
                           rock_name: str,
                           rock_type: str,
                           rock_id: Optional[int] = None,
                           rarity: Optional[str] = None,
                           image_url: Optional[str] = None,
                           latitude: Optional[float] = None,
                           longitude: Optional[float] = None,
                           location_name: Optional[str] = None
                           ) -> Tuple[bool, int, str, Optional["RockScanHistory"]]:
        """
        Create and persist a new RockScanHistory record.
        Applies zone name fallback for location.
        """
        try:
            # Resolve zone name if available
            zone_name = None
            if latitude is not None and longitude is not None:
                zone_name = cls.get_zone_name_by_coordinates(latitude, longitude)

            # Prefer zone name over reverse geocode fallback
            final_location_name = zone_name if zone_name else location_name

            scan = cls(
                user_id=user_id,
                rock_id=rock_id,
                rock_name=rock_name,
                rock_type=rock_type,
                rarity=rarity,
                image_url=image_url,
                latitude=latitude,
                longitude=longitude,
                location_name=final_location_name
            )
            db.session.add(scan)
            db.session.commit()

            return True, 201, "Scan saved successfully", scan

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error saving scan record: {e}")
            return False, 500, f"Error saving scan: {str(e)}", None

    @classmethod
    def save_scan_and_add_to_collection(cls, user_id: int, data: dict):
        """
        Handle full scan flow:
        1. Enforce daily scan limit for Free users.
        2. Save scan record (zone name prioritized).
        3. Auto-add rock to UserRockCollection if matched in Rock table.
        """
        try:
            from app.entity.user import User

            # --- Validate input ---
            rock_name = data.get("rock_name", "").strip()
            rock_type = data.get("rock_type", "").strip()

            if not rock_name or not rock_type:
                return False, 400, "rock_name and rock_type are required", None

            rarity = data.get("rarity")
            image_url = data.get("image_url")
            latitude = data.get("latitude")
            longitude = data.get("longitude")
            location_name = data.get("location_name")

            # --- Check daily limit for Free users ---
            user = User.queryUserById(user_id)
            if user.user_type and user.user_type.name == "Free":
                scan_count = cls.get_today_scan_count(user_id)
                if scan_count >= 5:
                    # Return specific message for frontend to show upgrade modal
                    return False, 403, "limit_reached", None

            # --- Create scan record ---
            success, code, message, scan = cls.create_scan_record(
                user_id=user_id,
                rock_id=None,
                rock_name=rock_name,
                rock_type=rock_type,
                rarity=rarity,
                image_url=image_url,
                latitude=latitude,
                longitude=longitude,
                location_name=location_name
            )

            if not success or not scan:
                return False, code, message, None

            # --- Add to collection if rock exists ---
            rock = Rock.query.filter_by(rock_name=rock_name).first()
            if rock:
                blob_path = cls.extract_blob_path(image_url) if image_url else None
                success_add, code_add, message_add, collection_entry = UserRockCollection.add_to_collection(
                    user_id=user_id,
                    rock_id=rock.rock_id,
                    source="scanned",
                    latitude=latitude,
                    longitude=longitude,
                    location_name=scan.location_name,
                    photo_url=blob_path
                )

                # If duplicate or error in adding to collection
                if not success_add:
                    return False, code_add, message_add, None

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error in save_scan_and_add_to_collection: {e}")
            return False, 500, f"Error saving scan: {str(e)}", None
