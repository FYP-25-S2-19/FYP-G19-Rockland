from datetime import datetime, date
from typing import Optional, Tuple, List
from app.models import db

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

    @classmethod
    def get_today_scan_count(cls, user_id: int) -> int:
        today = date.today()
        return cls.query.filter(
            cls.user_id == user_id,
            db.func.date(cls.scan_datetime) == today
        ).count()

    @classmethod
    def create_scan_record(cls, user_id: int, rock_name: str, rock_type: str,
                           rock_id: Optional[int] = None,
                           rarity: Optional[str] = None,
                           image_url: Optional[str] = None,
                           latitude: Optional[float] = None,
                           longitude: Optional[float] = None,
                           location_name: Optional[str] = None
                           ) -> Tuple[bool, int, str, Optional["RockScanHistory"]]:
        try:
            # Daily scan limit logic (5/day for free users)
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None

            if user.user_type and user.user_type.name == "Free":
                scan_count = cls.get_today_scan_count(user_id)
                if scan_count >= 5:
                    return False, 403, "Daily scan limit reached for Free users", None

            scan = cls(
                user_id=user_id,
                rock_id=rock_id,
                rock_name=rock_name,
                rock_type=rock_type,
                rarity=rarity,
                image_url=image_url,
                latitude=latitude,
                longitude=longitude,
                location_name=location_name
            )
            db.session.add(scan)
            db.session.commit()
            return True, 201, "Scan saved successfully", scan

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error saving scan record: {e}")
            return False, 500, f"Error saving scan: {str(e)}", None
