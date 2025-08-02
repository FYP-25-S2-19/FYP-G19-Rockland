# app/entity/rock.py

from datetime import datetime
from typing import Optional, Tuple, List
from sqlalchemy import func
from app.models import db
from app.entity.comment_rock import CommentRock  # Required for join in get_top_commented_rocks()
from app.utils.gcs import generate_signed_url, upload_file_to_gcs
from sqlalchemy import case
from sqlalchemy import or_
from io import BytesIO
from werkzeug.utils import secure_filename
from datetime import datetime
import base64
import re

class Rock(db.Model):
    __tablename__ = 'rock'

    rock_id = db.Column(db.Integer, primary_key=True)
    rock_name = db.Column(db.String(100), nullable=False)
    rock_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    hardness = db.Column(db.String(100), nullable=True)
    color = db.Column(db.String(100), nullable=True)
    composition = db.Column(db.Text, nullable=True)
    rarity = db.Column(db.String(30), nullable=True)
    density = db.Column(db.String(100), nullable=True)
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
            "composition": self.composition,
            "rarity": self.rarity,
            "density": self.density,
            "common_location": self.common_location,
            "fun_fact": self.fun_fact,
            "photo_url": self.photo_url,
            "signed_url": generate_signed_url(self.photo_url) if self.photo_url else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user_id": self.user_id,
        }
        if include_comment_count:
            data["comment_count"] = len(self.comments)
        return data

    def total_comment_count(self) -> int:
        return len(self.comments)
    
    @classmethod
    def clean_filename_from_title(cls, title: str) -> str:
        return re.sub(r"[^a-z0-9_]", "", title.strip().lower().replace(" ", "_"))

    @classmethod
    def create_rock(cls, **kwargs):
        try:
            rock_name = kwargs.get("rock_name", "").strip()
            if not rock_name:
                return False, 400, "Rock name is required", None

            cleaned_name = cls.clean_filename_from_title(rock_name)  # e.g. talc_carbonate

            # ✅ Check for duplicates by comparing cleaned name
            existing_rocks = cls.query.all()
            for rock in existing_rocks:
                existing_cleaned = cls.clean_filename_from_title(rock.rock_name)
                if existing_cleaned == cleaned_name:
                    return False, 400, f"Duplicate rock. A rock with similar name ('{rock.rock_name}') already exists.", None

            # ✅ Handle image upload
            photo_base64 = kwargs.get("photo")
            photo_url = None
            if photo_base64:
                if ',' in photo_base64:
                    photo_base64 = photo_base64.split(',')[1]  # Remove data:image/jpeg;base64,...

                photo_data = base64.b64decode(photo_base64)
                photo_file = BytesIO(photo_data)

                timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
                filename = secure_filename(f"{cleaned_name}_{timestamp}.jpg")
                photo_file.filename = filename

                blob_path = upload_file_to_gcs(
                    photo_file,
                    filename=filename,
                    folder="rock-image-display",  # GCS folder
                    custom_filename=f"{cleaned_name}_{timestamp}",
                    overwrite=True
                )
                photo_url = blob_path  # Just the blob path (signed URL is generated later)

            # ✅ Create rock in DB
            rock = cls(
                rock_name=rock_name,  # Original user input
                rock_type=kwargs.get("rock_type"),
                description=kwargs.get("description"),
                hardness=kwargs.get("hardness"),
                color=kwargs.get("color"),
                composition=kwargs.get("composition"),
                rarity=kwargs.get("rarity"),
                density=kwargs.get("density"),
                common_location=kwargs.get("common_location"),
                fun_fact=kwargs.get("fun_fact"),
                photo_url=photo_url,
                user_id=kwargs.get("user_id")
            )

            db.session.add(rock)
            db.session.commit()
            return True, 201, "Rock created successfully", rock

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating rock: {e}")
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
    def get_recent_rocks_by_user(cls, user_id: int, limit: int = 6) -> List['Rock']:
        try:
            return (
                cls.query
                .filter_by(user_id=user_id)
                .order_by(cls.created_at.desc())
                .limit(limit)
                .all()
            )
        except Exception as e:
            print(f"❌ Error fetching recent rocks: {e}")
            return []

    @classmethod
    def search_rocks(cls, filters: dict) -> List['Rock']:
        query = cls.query

        rock_name = filters.get("rock_name", "").strip()
        if rock_name:
            query = query.filter(func.lower(cls.rock_name).like(f"{rock_name.lower()}%"))

        if "rock_type" in filters and filters["rock_type"]:
            query = query.filter(cls.rock_type.in_(filters["rock_type"]))

        if "rarity" in filters and filters["rarity"]:
            query = query.filter(cls.rarity.in_(filters["rarity"]))

    # Location filter (using ilike for partial match on each)
        if filters.get("common_location"):
            location_filters = filters["common_location"]
            query = query.filter(
                or_(
                    *[cls.common_location.ilike(f"%{loc}%") for loc in location_filters]
                )
            )


        sort = filters.get("sort")
        if sort == "az":
            query = query.order_by(cls.rock_name.asc())
        elif sort == "za":
            query = query.order_by(cls.rock_name.desc())
        elif sort == "most_commented":
            query = query.outerjoin(cls.comments).group_by(cls.rock_id).order_by(func.count().desc())
        elif sort == "rarity":
            rarity_order = case(
                (func.lower(cls.rarity) == 'common', 1),
                (func.lower(cls.rarity) == 'rare', 2),
                (func.lower(cls.rarity) == 'legendary', 3),
                else_=4
            )
            query = query.order_by(rarity_order, cls.rock_name.asc())
        else:
            query = query.order_by(cls.created_at.desc())

        return query.all()

    @classmethod
    def update_rock(cls, rock_id: int, **kwargs):
        try:
            rock = cls.query.get(rock_id)
            if not rock:
                return False, 404, "Rock not found", None

            new_rock_name = kwargs.get("rock_name", rock.rock_name).strip()
            new_cleaned_name = cls.clean_filename_from_title(new_rock_name)
            current_cleaned_name = cls.clean_filename_from_title(rock.rock_name)

            # ✅ Check for duplicate if rock_name is changed
            if new_cleaned_name != current_cleaned_name:
                all_rocks = cls.query.all()
                for other in all_rocks:
                    if other.rock_id != rock.rock_id:
                        if cls.clean_filename_from_title(other.rock_name) == new_cleaned_name:
                            return False, 400, f"Duplicate rock name. '{other.rock_name}' already exists.", None

            # ✅ Handle new photo if provided (base64)
            photo_base64 = kwargs.get("photo")
            if photo_base64:
                from io import BytesIO
                import base64
                from werkzeug.utils import secure_filename
                from datetime import datetime
                from app.utils.gcs import upload_file_to_gcs

                if ',' in photo_base64:
                    photo_base64 = photo_base64.split(',')[1]
                photo_data = base64.b64decode(photo_base64)
                photo_file = BytesIO(photo_data)

                timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
                filename = secure_filename(f"{new_cleaned_name}_{timestamp}.jpg")
                photo_file.filename = filename

                blob_path = upload_file_to_gcs(
                    photo_file,
                    filename=filename,
                    folder="rocks",
                    custom_filename=f"{new_cleaned_name}_{timestamp}",
                    overwrite=True
                )
                rock.photo_url = blob_path

            # ✅ Update all fields
            for key, value in kwargs.items():
                if hasattr(rock, key) and value is not None:
                    setattr(rock, key, value)

            db.session.commit()
            return True, 200, "Rock updated successfully", rock

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error updating rock: {e}")
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

    @classmethod
    def get_filter_options(cls):
        types = db.session.query(cls.rock_type).distinct().all()
        rarities = db.session.query(cls.rarity).distinct().all()
        locations_raw = db.session.query(cls.common_location).filter(cls.common_location.isnot(None)).all()

        location_set = set()
        for loc in locations_raw:
            for part in loc[0].split(','):
                cleaned = part.strip()
                if cleaned:
                    location_set.add(cleaned)

        return {
            "types": sorted([t[0] for t in types if t[0]]),
            "rarities": sorted([r[0] for r in rarities if r[0]]),
            "locations": sorted(location_set),
        }

    @classmethod
    def getTotalRockCount(cls):
        """Get total count of all rocks"""
        try:
            total_rocks = cls.query.count()
            return total_rocks, 200, "Rock count fetched successfully"
        except Exception as e:
            print(f"Error fetching rock count: {e}")
            return 0, 500, f"Error: {str(e)}"

    @classmethod
    def getRockCountByType(cls):
        """Get rock count by type for category analysis"""
        try:
            from sqlalchemy import func
            rock_counts = db.session.query(
                cls.rock_type,
                func.count(cls.rock_id).label('count')
            ).group_by(cls.rock_type).all()
            
            return rock_counts, 200, "Rock type counts fetched successfully"
        except Exception as e:
            print(f"Error fetching rock type counts: {e}")
            return [], 500, f"Error: {str(e)}"
        
    @classmethod
    def getAllRocksForAdmin(cls):
        """Get all rocks for admin view - follows discussion pattern"""
        try:
            rocks = cls.query.order_by(cls.created_at.desc()).all()
            rocks_data = [rock.to_dict() for rock in rocks]
            return rocks_data, 200
        except Exception as e:
            print(f"Error fetching rocks for admin: {e}")
            return None, 500


    @classmethod
    def deleteRockById(cls, rock_id: int):
        """Delete rock by ID for admin - follows discussion pattern"""
        try:
            rock = cls.query.get(rock_id)
            if not rock:
                return False, 404, "Rock not found"

            db.session.delete(rock)
            db.session.commit()
            return True, 200, "Rock deleted successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting rock by ID: {e}")
            return False, 500, f"Error deleting rock: {str(e)}"