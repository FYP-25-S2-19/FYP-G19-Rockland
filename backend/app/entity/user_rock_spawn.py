from datetime import datetime
from app.models import db
from app.entity.user_rock_collection import UserRockCollection  # Optional if you want to auto-add to collection

"""
Entity: UserRockSpawn

This table tracks which users have collected which `RockSpawn` records.

Each RockSpawn is a shared/public spawn (visible to all users),
but this table creates a personal link between the user and the spawn,
ensuring:
- Each user can collect a given RockSpawn only once.
- Collected spawns are time-stamped (collected_at).
- This is used to prevent re-collecting and enable reward tracking.

Typical flow:
1. RockSpawn is generated on the map.
2. User taps 'Collect'.
3. A UserRockSpawn record is created.
4. A UserRockCollection entry is also saved (source = "Discovered").
"""

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

    @classmethod
    def create(cls, user_id: int, rock_spawn_id: int):
        try:
            new_entry = cls(user_id=user_id, rock_spawn_id=rock_spawn_id)
            db.session.add(new_entry)
            db.session.flush()  # Flush to get ID if needed before additional inserts

            # Optional: auto-add to UserRockCollection
            from app.entity.rock_spawn import RockSpawn
            spawn = RockSpawn.query.get(rock_spawn_id)
            if spawn:
                UserRockCollection.add_to_collection(
                    user_id=user_id,
                    rock_id=spawn.rock_id,
                    source="Discovered"
                )

            db.session.commit()
            return True, 201, "Rock spawn collected", new_entry
        except Exception as e:
            db.session.rollback()
            print(f"Error creating UserRockSpawn: {e}")
            return False, 500, f"Error: {str(e)}", None

    @classmethod
    def has_already_collected(cls, user_id: int, rock_spawn_id: int) -> bool:
        return cls.query.filter_by(user_id=user_id, rock_spawn_id=rock_spawn_id).first() is not None
