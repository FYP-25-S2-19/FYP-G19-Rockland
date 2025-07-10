# app/entity/rock.py

from datetime import datetime
from typing import Optional, Tuple, List
from sqlalchemy import func
from app.models import db
from app.entity.comment_rock import CommentRock  # Required for join in get_top_commented_rocks()

class Rock(db.Model):
    __tablename__ = 'rock'

    rock_id = db.Column(db.Integer, primary_key=True)
    rock_name = db.Column(db.String(100), nullable=False)
    rock_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    hardness = db.Column(db.String(20), nullable=True)
    color = db.Column(db.String(100), nullable=True)
    rarity = db.Column(db.String(100), nullable=True)
    density = db.Column(db.String(50), nullable=True)
    common_location = db.Column(db.String(255), nullable=True)
    fun_fact = db.Column(db.Text, nullable=True)
    photo_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)

    # Relationships
    creator = db.relationship("User", backref="created_rocks")
    comments = db.relationship('CommentRock', backref='rock', cascade="all, delete-orphan")

    def to_dict(self, include_comment_count: bool = False) -> dict:
        data = {
            "rock_id": self.rock_id,
            "rock_name": self.rock_name,
            "rock_type": self.rock_type,
            "description": self.description,
            "hardness": self.hardness,
            "color": self.color,
            "rarity": self.rarity,
            "density": self.density,
            "common_location": self.common_location,
            "fun_fact": self.fun_fact,
            "photo_url": self.photo_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_comment_count:
            data["comment_count"] = len(self.comments)
        return data

    def total_comment_count(self) -> int:
        return len(self.comments)

    @classmethod
    def create_rock(cls, **kwargs) -> Tuple[bool, int, str, Optional['Rock']]:
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
        return cls.query.get(rock_id)

    @classmethod
    def get_all_rocks(cls) -> List['Rock']:
        return cls.query.order_by(cls.created_at.desc()).all()

    @classmethod
    def get_top_commented_rocks(cls, limit: int = 4) -> List['Rock']:
        return (
            cls.query
            .outerjoin(cls.comments)
            .group_by(cls.rock_id)
            .order_by(func.count(CommentRock.comment_rock_id).desc())
            .limit(limit)
            .all()
        )

    @classmethod
    def get_rocks_by_user(cls, user_id: int) -> List['Rock']:
        return cls.query.filter_by(user_id=user_id).order_by(cls.created_at.desc()).all()

    @classmethod
    def search_rocks(cls, filters: dict) -> List['Rock']:
        query = cls.query

        if "rock_name" in filters:
            query = query.filter(func.lower(cls.rock_name).like(f"%{filters['rock_name'].lower()}%"))

        if "rock_type" in filters and filters["rock_type"]:
            query = query.filter(cls.rock_type.in_(filters["rock_type"]))

        if "rarity" in filters and filters["rarity"]:
            query = query.filter(cls.rarity.in_(filters["rarity"]))

        if "common_location" in filters and filters["common_location"]:
            query = query.filter(cls.common_location.in_(filters["common_location"]))

        sort = filters.get("sort")
        if sort == "az":
            query = query.order_by(cls.rock_name.asc())
        elif sort == "za":
            query = query.order_by(cls.rock_name.desc())
        elif sort == "most_commented":
            query = query.outerjoin(cls.comments).group_by(cls.rock_id).order_by(func.count().desc())
        else:
            query = query.order_by(cls.created_at.desc())

        return query.all()

    @classmethod
    def update_rock(cls, rock_id: int, **kwargs) -> Tuple[bool, int, str, Optional['Rock']]:
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
