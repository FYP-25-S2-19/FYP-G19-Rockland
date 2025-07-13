"""
Entity: RockSpawn

This table defines rock spawn points on the map.

Each RockSpawn:
- Belongs to a specific rock (rock_id)
- Has a physical location (latitude, longitude)
- Has a display name (optional location_name)
- Is visible to all users
- Expires after a set duration based on rock rarity
- May appear based on regional geological distribution (not yet implemented)

The rock distribution logic (e.g., Bukit Timah = 90% igneous) will be handled
externally by a spawn generator function or service.

Spawn collection is tracked individually using the UserRockSpawn table.
Once the userrockspawn status is collected, rock marker will not be shown to the user.
"""


from datetime import datetime, timedelta
from app.models import db

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
        """
        Returns expiration datetime based on rarity:
        - Common: 2–5 min
        - Rare: 1–3 min
        - Legendary: 0.5–2 min
        """
        now = datetime.utcnow()
        if rarity == "Common":
            return now + timedelta(minutes=2 + (3 * db.func.random()))
        elif rarity == "Rare":
            return now + timedelta(minutes=1 + (2 * db.func.random()))
        elif rarity == "Legendary":
            return now + timedelta(seconds=30 + (90 * db.func.random()))
        return now + timedelta(minutes=3)
