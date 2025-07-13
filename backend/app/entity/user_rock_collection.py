# app/entity/user_rock_collection.py

from datetime import datetime
from typing import Optional, Tuple, List
from app.models import db
from sqlalchemy import and_, or_
from app.entity.rock import Rock

class UserRockCollection(db.Model):
    __tablename__ = "user_rock_collection"

    collection_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    rock_id = db.Column(db.Integer, db.ForeignKey("rock.rock_id"), nullable=False)
    source = db.Column(db.String(20), nullable=False)  # 'scanned' or 'discovered'
    image_url = db.Column(db.String(255), nullable=True)
    collected_date = db.Column(db.DateTime, default=datetime.utcnow)

    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location_name = db.Column(db.String(255), nullable=True)

    #relationship
    rock = db.relationship("Rock", backref="collections", lazy=True)

    def to_dict(self) -> dict:
        return {
            "collection_id": self.collection_id,
            "user_id": self.user_id,
            "rock_id": self.rock_id,
            "source": self.source,
            "image_url": self.image_url,
            "collected_date": self.collected_date.isoformat() if self.collected_date else None,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location_name": self.location_name,
        }

    @classmethod
    def add_to_collection(cls, **kwargs) -> Tuple[bool, int, str, Optional["UserRockCollection"]]:
        try:
            new_entry = cls(**kwargs)
            db.session.add(new_entry)
            db.session.commit()
            return True, 201, "Rock added to collection", new_entry
        except Exception as e:
            db.session.rollback()
            print(f"Error adding to user collection: {e}")
            return False, 500, f"Error: {str(e)}", None

    @classmethod
    def get_user_collection(cls, user_id: int) -> List["UserRockCollection"]:
        return cls.query.filter_by(user_id=user_id).order_by(cls.collected_date.desc()).all()
    
    @classmethod
    def delete_from_collection(cls, collection_id: int, user_id: int) -> Tuple[bool, int, str]:
        try:
            entry = cls.query.filter_by(collection_id=collection_id, user_id=user_id).first()
            if not entry:
                return False, 404, "Rock not found in your collection"
            
            db.session.delete(entry)
            db.session.commit()
            return True, 200, "Rock removed from collection"
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting from user collection: {e}")
            return False, 500, f"Error: {str(e)}"
        
    @classmethod
    def filter_user_collection(cls, user_id: int, filters: dict) -> List["UserRockCollection"]:
        query = cls.query.filter_by(user_id=user_id)

        # Search by name, type, location
        search_text = filters.get("searchText")
        if search_text:
            search_text = f"%{search_text.lower()}%"
            query = query.filter(or_(
                db.func.lower(cls.location_name).like(search_text),
            ))

        # Filter by rarity
        rarities = filters.get("rarities")
        if rarities:
            query = query.filter(cls.rock.has(Rock.rarity.in_(rarities)))

        # Filter by location
        locations = filters.get("locations")
        if locations:
            query = query.filter(cls.location_name.in_(locations))

        # Filter by date
        start_date = filters.get("startDate")
        if start_date:
            query = query.filter(cls.collected_date >= start_date)
        end_date = filters.get("endDate")
        if end_date:
            query = query.filter(cls.collected_date <= end_date)

        # Filter by method (Scanned / Discovered)
        method = filters.get("method")
        if method and method != "All":
            query = query.filter(cls.source == method)

        # Sorting
        sort = filters.get("sortOption", "Most Recent")
        if sort == "Most Recent":
            query = query.order_by(cls.collected_date.desc())
        elif sort == "Earliest":
            query = query.order_by(cls.collected_date.asc())
        elif sort == "A-Z":
            query = query.join(Rock).order_by(Rock.name.asc())
        elif sort == "Z-A":
            query = query.join(Rock).order_by(Rock.name.desc())
        elif sort == "Rarity":
            query = query.join(Rock).order_by(
                db.case(
                    (Rock.rarity == "Legendary", 3),
                    (Rock.rarity == "Rare", 2),
                    (Rock.rarity == "Common", 1),
                    else_=0
                ).desc()
            )

        return query.all()