from datetime import datetime
from typing import Optional, Tuple, List
from sqlalchemy.orm import joinedload
from sqlalchemy import or_, case
from app.models import db
from app.entity.rock import Rock
from app.utils.gcs import generate_signed_url


class UserRockCollection(db.Model):
    __tablename__ = "user_rock_collection"

    collection_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    rock_id = db.Column(db.Integer, db.ForeignKey("rock.rock_id"), nullable=False)
    source = db.Column(db.String(20), nullable=False)  # 'scanned' or 'discovered'
    collected_date = db.Column(db.DateTime, default=datetime.utcnow)

    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location_name = db.Column(db.String(255), nullable=True)
    trade_id = db.Column(db.Integer, db.ForeignKey("trade_offer.trade_id"), nullable=True)

    photo_url = db.Column(db.Text, nullable=True)

    rock = db.relationship("Rock", backref="collections", lazy=True)

    @property
    def signed_url(self):
        # ✅ Prefer scanned image if available, fallback to default rock image
        if self.photo_url:
            return generate_signed_url(self.photo_url)
        return generate_signed_url(self.rock.photo_url) if self.rock and self.rock.photo_url else None

    def to_dict(self) -> dict:
        return {
            "collection_id": self.collection_id,
            "user_id": self.user_id,
            "rock_id": self.rock_id,
            "source": self.source,
            "rock_name": self.rock.rock_name if self.rock else None,
            "rock_type": self.rock.rock_type if self.rock else None,
            "rock_rarity": self.rock.rarity if self.rock else None,
            "rock_description": self.rock.description if self.rock else None, 
            "signed_url": self.signed_url,
            "collected_date": self.collected_date.isoformat() if self.collected_date else None,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location_name": self.location_name,
            "photo_url": self.photo_url
        }

    @classmethod
    def add_to_collection(cls, **kwargs) -> Tuple[bool, int, str, Optional["UserRockCollection"]]:
        try:
            exists = cls.query.filter_by(
                user_id=kwargs["user_id"],
                rock_id=kwargs["rock_id"],
                source=kwargs["source"]
            ).first()
            if exists:
                return True, 200, "Rock already in collection", exists
        
            new_entry = cls(**kwargs)
            db.session.add(new_entry)
            db.session.commit()
            return True, 201, "Rock added to collection", new_entry

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error adding to user collection: {e}")
            return False, 500, f"Error: {str(e)}", None

    @classmethod
    def get_user_collection(cls, user_id: int) -> List[dict]:
        collections = cls.query.options(joinedload(cls.rock))\
            .filter_by(user_id=user_id)\
            .order_by(cls.collected_date.desc())\
            .all()
        return [entry.to_dict() for entry in collections]

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
            print(f"❌ Error deleting from user collection: {e}")
            return False, 500, f"Error: {str(e)}"

    @classmethod
    def filter_user_collection(cls, user_id: int, filters: dict) -> List[dict]:
        query = cls.query.options(joinedload(cls.rock)).filter_by(user_id=user_id)

        search_text = filters.get("searchText")
        if search_text:
            search_text = f"%{search_text.lower()}%"
            query = query.filter(or_(
                db.func.lower(cls.location_name).like(search_text),
            ))

        rarities = filters.get("rarities")
        if rarities:
            query = query.filter(cls.rock.has(Rock.rarity.in_(rarities)))

        locations = filters.get("locations")
        if locations:
            query = query.filter(cls.location_name.in_(locations))

        start_date = filters.get("startDate")
        if start_date:
            query = query.filter(cls.collected_date >= start_date)

        end_date = filters.get("endDate")
        if end_date:
            query = query.filter(cls.collected_date <= end_date)

        method = filters.get("method")
        if method and method.lower() != "all":
            query = query.filter(cls.source == method.lower())

        sort = filters.get("sortOption", "Most Recent")
        if sort == "Most Recent":
            query = query.order_by(cls.collected_date.desc())
        elif sort == "Earliest":
            query = query.order_by(cls.collected_date.asc())
        elif sort == "A-Z":
            query = query.join(Rock).order_by(Rock.rock_name.asc())
        elif sort == "Z-A":
            query = query.join(Rock).order_by(Rock.rock_name.desc())
        elif sort == "Rarity":
            query = query.join(Rock).order_by(
                case(
                    (Rock.rarity == "Legendary", 3),
                    (Rock.rarity == "Rare", 2),
                    (Rock.rarity == "Common", 1),
                    else_=0
                ).desc()
            )

        return [entry.to_dict() for entry in query.all()]
