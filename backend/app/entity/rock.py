# Libraries
from datetime import datetime
from typing import Optional, Tuple, List
from flask_sqlalchemy import SQLAlchemy

# Local dependencies
from app.models import db

class Rock(db.Model):
    __tablename__ = 'rock'

    rock_id = db.Column(db.Integer, primary_key=True)
    rock_name = db.Column(db.String(100), nullable=False)
    rock_type = db.Column(db.String(100), nullable=False)
    hardness = db.Column(db.Float, nullable=True)
    color = db.Column(db.String(100), nullable=True)
    rarity = db.Column(db.String(100), nullable=True)
    density = db.Column(db.Float, nullable=True)
    common_location = db.Column(db.String(255), nullable=True)
    fun_fact = db.Column(db.Text, nullable=True)
    photo_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        """Return a dictionary representation of the rock."""
        return {
            "rock_id": self.rock_id,
            "rock_name": self.rock_name,
            "rock_type": self.rock_type,
            "hardness": self.hardness,
            "color": self.color,
            "rarity": self.rarity,
            "density": self.density,
            "common_location": self.common_location,
            "fun_fact": self.fun_fact,
            "photo_url": self.photo_url,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    @classmethod
    def create_rock(cls, **kwargs) -> Tuple[bool, int, str, Optional['Rock']]:
        """Create a new rock entry."""
        try:
            rock = cls(**kwargs)
            db.session.add(rock)
            db.session.commit()
            return True, 201, "Rock created successfully", rock
        except Exception as e:
            db.session.rollback()
            print(f"Error creating rock: {e}")
            return False, 500, f"Error creating rock: {str(e)}", None

    @classmethod
    def get_rock_by_id(cls, rock_id: int) -> Optional['Rock']:
        """Get rock by ID."""
        return cls.query.get(rock_id)

    @classmethod
    def get_all_rocks(cls) -> List['Rock']:
        """Get all rock entries."""
        return cls.query.order_by(cls.created_at.desc()).all()

    @classmethod
    def update_rock(cls, rock_id: int, **kwargs) -> Tuple[bool, int, str, Optional['Rock']]:
        """Update rock information by ID."""
        try:
            rock = cls.query.get(rock_id)
            if not rock:
                return False, 404, "Rock not found", None

            for key, value in kwargs.items():
                if hasattr(rock, key) and value is not None:
                    setattr(rock, key, value)

            db.session.commit()
            return True, 200, "Rock updated successfully", rock
        except Exception as e:
            db.session.rollback()
            print(f"Error updating rock: {e}")
            return False, 500, f"Error updating rock: {str(e)}", None

    @classmethod
    def delete_rock(cls, rock_id: int) -> Tuple[bool, int, str]:
        """Delete rock by ID."""
        try:
            rock = cls.query.get(rock_id)
            if not rock:
                return False, 404, "Rock not found"

            db.session.delete(rock)
            db.session.commit()
            return True, 200, "Rock deleted successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting rock: {e}")
            return False, 500, f"Error deleting rock: {str(e)}"
