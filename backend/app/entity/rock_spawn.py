from datetime import datetime, timedelta
from sqlalchemy import func
from app.models import db
from app.entity.user_rock_spawn import UserRockSpawn
from app.entity.rock import Rock

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

    def to_dict(self):
        return {
            "rock_spawn_id": self.rock_spawn_id,
            "rock_id": self.rock_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location_name": self.location_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }

    @classmethod
    def generate_expiration(cls, rarity: str) -> datetime:
        now = datetime.utcnow()
        if rarity == "Common":
            return now + timedelta(minutes=2 + (3 * db.func.random()))
        elif rarity == "Rare":
            return now + timedelta(minutes=1 + (2 * db.func.random()))
        elif rarity == "Legendary":
            return now + timedelta(seconds=30 + (90 * db.func.random()))
        return now + timedelta(minutes=3)

    @classmethod
    def collect_spawn(cls, user_id: int, rock_spawn_id: int):
        try:
            spawn = cls.query.get(rock_spawn_id)
            if not spawn:
                return False, 404, "Spawn not found", None

            if spawn.expires_at < datetime.utcnow():
                return False, 400, "Spawn expired", None

            if UserRockSpawn.has_already_collected(user_id, rock_spawn_id):
                return False, 409, "Already collected", None

            success, status, msg, new_entry = UserRockSpawn.create(user_id, rock_spawn_id)
            return success, status, msg, {"collected_at": new_entry.collected_at.isoformat()} if new_entry else None

        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}", None

    @classmethod
    def get_nearby_spawns(cls, user_id: int, lat: float, lng: float, radius: float = 1000):
        try:
            def haversine_formula(lat1, lng1, lat2, lng2):
                return func.acos(
                    func.sin(func.radians(lat1)) * func.sin(func.radians(lat2)) +
                    func.cos(func.radians(lat1)) * func.cos(func.radians(lat2)) *
                    func.cos(func.radians(lng2) - func.radians(lng1))
                ) * 6371000  # Earth radius

            all_spawns = (
                cls.query
                .join(Rock, Rock.rock_id == cls.rock_id)
                .filter(cls.expires_at > datetime.utcnow())
                .filter(
                    haversine_formula(lat, lng, cls.latitude, cls.longitude) <= radius
                )
                .all()
            )

            collected_ids = {
                s.rock_spawn_id for s in
                UserRockSpawn.query.filter_by(user_id=user_id).all()
            }

            result = []
            for spawn in all_spawns:
                if spawn.rock_spawn_id in collected_ids:
                    continue
                result.append({
                    "rock_spawn_id": spawn.rock_spawn_id,
                    "latitude": spawn.latitude,
                    "longitude": spawn.longitude,
                    "location_name": spawn.location_name,
                    "expires_at": spawn.expires_at.isoformat(),
                    "rock": spawn.rock.to_dict()
                })

            return True, 200, "Nearby spawns fetched", result

        except Exception as e:
            return False, 500, f"Error: {str(e)}", []
