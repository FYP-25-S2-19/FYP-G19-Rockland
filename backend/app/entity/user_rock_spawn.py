from datetime import datetime
from app.models import db
from app.entity.user_rock_collection import UserRockCollection
from app.utils.geo import haversine


class UserRockSpawn(db.Model):
    __tablename__ = "user_rock_spawn"

    user_rock_spawn_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    rock_spawn_id = db.Column(db.Integer, db.ForeignKey("rock_spawn.rock_spawn_id"), nullable=False)
    collected_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    rock_spawn = db.relationship("RockSpawn", backref="collected_by_users")

    def to_dict(self):
        return {
            "user_rock_spawn_id": self.user_rock_spawn_id,
            "user_id": self.user_id,
            "rock_spawn_id": self.rock_spawn_id,
            "collected_at": self.collected_at.isoformat() if self.collected_at else None,
        }

    # ------------------------------------
    # Unified collection flow (validation + insert)
    # ------------------------------------
    @classmethod
    def collect_spawn_flow(cls, user_id: int, rock_spawn_id: int, user_lat: float, user_lng: float):
        """
        Full collection flow:
        - Validate spawn existence & expiration
        - Validate distance (150m)
        - Prevent duplicate collection
        - Insert UserRockSpawn + UserRockCollection with location info
        """
        from app.entity.rock_spawn import RockSpawn

        try:
            spawn = RockSpawn.query.get(rock_spawn_id)
            if not spawn:
                return False, 404, "Spawn not found", None

            # Expiration check
            if spawn.expires_at < datetime.utcnow():
                return False, 400, "Spawn expired", None

            # Distance check (150m)
            distance = haversine(user_lat, user_lng, spawn.latitude, spawn.longitude)
            if distance > 150:
                return False, 403, "Too far to collect this rock", None

            # Duplicate check
            if cls.has_already_collected(user_id, rock_spawn_id):
                return False, 409, "Already collected", None

            # Create UserRockSpawn record
            new_entry = cls(user_id=user_id, rock_spawn_id=rock_spawn_id)
            db.session.add(new_entry)
            db.session.flush()  # needed for auto IDs

            # Add to UserRockCollection with location details
            success, status, msg, _ = UserRockCollection.add_to_collection(
                user_id=user_id,
                rock_id=spawn.rock_id,
                source="discovered",
                latitude=spawn.latitude,
                longitude=spawn.longitude,
                location_name=spawn.location_name
            )

            if not success:
                db.session.rollback()
                return False, status, msg, None

            db.session.commit()
            return True, 200, "Rock collected", new_entry

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error in collect_spawn_flow: {e}")
            return False, 500, f"Error: {str(e)}", None

    @classmethod
    def has_already_collected(cls, user_id: int, rock_spawn_id: int) -> bool:
        """Check if the user already collected this spawn"""
        return cls.query.filter_by(user_id=user_id, rock_spawn_id=rock_spawn_id).first() is not None
