# app/entity/discussion.py
from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import func
from app.models import db

# --- M2M: Discussion ↔ Interest
discussion_interest_association = db.Table(
    'discussion_interest',
    db.Column('discussion_id', db.Integer, db.ForeignKey('discussion.discussion_id'), primary_key=True),
    db.Column('interest_id', db.Integer, db.ForeignKey('interest.interest_id'), primary_key=True)
)

class Discussion(db.Model):
    __tablename__ = 'discussion'

    discussion_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # NEW: optional category for the thread (mirrors Article.categories_id)
    categories_id = db.Column(db.Integer, db.ForeignKey('categories.categories_id'), nullable=True)

    # Relationships
    user = db.relationship('User', backref='discussions')
    comments = db.relationship('DiscussionComment', backref='discussion', cascade='all, delete-orphan')
    category = db.relationship('Categories', backref='discussions')

    # NEW: interests tags (many-to-many)
    interests = db.relationship(
        'Interest',
        secondary=discussion_interest_association,
        backref=db.backref('tagged_discussions', lazy='dynamic'),
        lazy='joined'
    )

    def to_dict(self, current_user_id: Optional[int] = None) -> dict:
        return {
            'id': self.discussion_id,
            'user_id': self.user_id,
            'user': f"{self.user.first_name} {self.user.last_name}" if self.user else 'Unknown',
            'text': self.text,
            'timestamp': self.timestamp.isoformat(),
            'comment_count': len(self.comments) if self.comments else 0,
            'categories_id': self.categories_id,
            'category_title': self.category.title if self.category else None,
            'interests': [
                {
                    'interest_id': i.interest_id,
                    'title': i.title,
                    'categories_id': i.categories_id
                } for i in (self.interests or [])
            ]
        }

    # ===== Admin list (unchanged) =====
    @classmethod
    def getAllDiscussionsForAdmin(cls):
        try:
            discussions = cls.query.order_by(cls.timestamp.desc()).all()
            discussions_data = [d.to_dict() for d in discussions]
            return discussions_data, 200
        except Exception as e:
            print(f"Error in getAllDiscussionsForAdmin: {e}")
            return None, 500

    @classmethod
    def getDiscussionById(cls, discussion_id):
        try:
            d = cls.query.get(discussion_id)
            if d:
                return d.to_dict(), 200, "Discussion details fetched successfully"
            else:
                return None, 404, "Discussion not found"
        except Exception as e:
            print(f"Error in getDiscussionById: {e}")
            return None, 500, f"Error fetching discussion: {str(e)}"

    @classmethod
    def deleteDiscussion(cls, discussion_id, user_id):
        try:
            d = cls.query.get(discussion_id)
            if not d:
                return False, 404, "Discussion not found", None

            # Optional: allow author or admin to delete; if you already enforce elsewhere, keep simple
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None

            is_admin = user.user_type and user.user_type.name == "Admin"
            is_author = d.user_id == user.user_id
            if not (is_admin or is_author):
                return False, 403, "Not allowed to delete", None

            data = d.to_dict()
            db.session.delete(d)
            db.session.commit()
            return True, 200, "Discussion deleted successfully", data
        except Exception as e:
            db.session.rollback()
            print(f"Error in deleteDiscussion: {e}")
            return False, 500, f"Error deleting discussion: {str(e)}", None

    # ===== Create with category + interests =====
    @classmethod
    def createDiscussion(cls, user_id: int, text: str,
                         categories_id: Optional[int] = None,
                         interest_ids: Optional[List[int]] = None):
        try:
            if not text or not text.strip():
                return False, 400, "Discussion text is required", None
            text = text.strip()
            if len(text) < 10:
                return False, 400, "Discussion text must be at least 10 characters", None
            if len(text) > 2000:
                return False, 400, "Discussion text cannot exceed 2000 characters", None

            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None
            if user.status != "Active":
                return False, 403, "User account not active", None

            # Validate category if provided
            category = None
            if categories_id:
                from app.entity.categories import Categories
                category = Categories.query.get(categories_id)
                if not category:
                    return False, 404, f"Category with ID {categories_id} not found", None

            # Validate interests if provided
            interests = []
            if interest_ids:
                from app.entity.interest import Interest
                ids = list({int(x) for x in interest_ids if isinstance(x, (int, str)) and str(x).isdigit()})
                if ids:
                    interests = Interest.query.filter(Interest.interest_id.in_(ids)).all()
                if len(interests) != len(ids):
                    return False, 404, "One or more interest IDs not found", None

            d = cls(
                user_id=user_id,
                text=text,
                categories_id=categories_id if category else None,
            )
            if interests:
                d.interests = interests

            db.session.add(d)
            db.session.commit()
            return True, 201, "Discussion created successfully", d.to_dict()
        except Exception as e:
            db.session.rollback()
            print(f"Error in createDiscussion: {e}")
            return False, 500, f"Error creating discussion: {str(e)}", None

    # ===== Update tags (category + interests) =====
    @classmethod
    def updateDiscussionTags(cls, discussion_id: int, user_id: int,
                             categories_id: Optional[int] = None,
                             interest_ids: Optional[List[int]] = None):
        try:
            d = cls.query.get(discussion_id)
            if not d:
                return False, 404, "Discussion not found", None

            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None

            is_admin = user.user_type and user.user_type.name == "Admin"
            is_author = d.user_id == user.user_id
            if not (is_admin or is_author):
                return False, 403, "Not allowed to update", None

            # Category
            if categories_id is not None:
                if categories_id == 0 or categories_id == "0":
                    d.categories_id = None  # clear
                else:
                    from app.entity.categories import Categories
                    category = Categories.query.get(int(categories_id))
                    if not category:
                        return False, 404, f"Category with ID {categories_id} not found", None
                    d.categories_id = int(categories_id)

            # Interests
            if interest_ids is not None:
                if not interest_ids:
                    d.interests = []  # clear all
                else:
                    from app.entity.interest import Interest
                    ids = list({int(x) for x in interest_ids if str(x).isdigit()})
                    interests = Interest.query.filter(Interest.interest_id.in_(ids)).all()
                    if len(interests) != len(ids):
                        return False, 404, "One or more interest IDs not found", None
                    d.interests = interests

            db.session.commit()
            return True, 200, "Discussion tags updated", d.to_dict()
        except Exception as e:
            db.session.rollback()
            print(f"Error in updateDiscussionTags: {e}")
            return False, 500, f"Error updating tags: {str(e)}", None

    # ===== Search / Browse with filters =====
    @classmethod
    def searchDiscussions(cls,
                          user_id: int,
                          search_term: Optional[str] = None,
                          sort_by: str = "newest",
                          category_ids: Optional[List[int]] = None,
                          interest_ids: Optional[List[int]] = None):
        """
        Sort by: newest | oldest | most_commented | recommended
        - recommended: boost threads matching user's saved interests
        Filters:
        - category_ids: list[int]
        - interest_ids: list[int] (must match at least one)
        """
        try:
            from app.entity.user import User, user_interest_association
            from app.entity.interest import Interest

            user = User.queryUserById(user_id)
            if not user:
                return None, 404, "User not found"

            q = cls.query

            if search_term:
                q = q.filter(cls.text.ilike(f"%{search_term.strip()}%"))

            if category_ids:
                q = q.filter(cls.categories_id.in_(category_ids))

            if interest_ids:
                # join through association to require intersection
                q = (
                    q.join(discussion_interest_association, cls.discussion_id == discussion_interest_association.c.discussion_id)
                     .filter(discussion_interest_association.c.interest_id.in_(interest_ids))
                     .distinct()
                )

            # Sorting
            if sort_by == "oldest":
                q = q.order_by(cls.timestamp.asc())
            elif sort_by == "most_commented":
                from app.entity.discussion_comment import DiscussionComment  # assuming exists
                q = (
                    q.outerjoin(DiscussionComment)
                     .group_by(cls.discussion_id)
                     .order_by(func.count(DiscussionComment.comment_id).desc(), cls.timestamp.desc())
                )
            elif sort_by == "recommended":
                # Boost by overlap with user's interests
                # rank = (# matching interests) then newest
                # Build a subquery count of matches
                user_interest_ids = db.session.query(user_interest_association.c.interest_id)\
                    .filter(user_interest_association.c.user_id == user.user_id)

                match_count = func.count(discussion_interest_association.c.interest_id)
                q = (
                    q.outerjoin(
                        discussion_interest_association,
                        cls.discussion_id == discussion_interest_association.c.discussion_id
                    )
                    .filter(
                        (discussion_interest_association.c.interest_id == None) |
                        (discussion_interest_association.c.interest_id.in_(user_interest_ids))
                    )
                    .group_by(cls.discussion_id)
                    .order_by(match_count.desc(), cls.timestamp.desc())
                )
            else:
                q = q.order_by(cls.timestamp.desc())

            results = q.all()
            return [d.to_dict(user.user_id) for d in results], 200, "Search results returned"
        except Exception as e:
            print(f"Error in searchDiscussions: {e}")
            return None, 500, f"Internal error: {str(e)}"
