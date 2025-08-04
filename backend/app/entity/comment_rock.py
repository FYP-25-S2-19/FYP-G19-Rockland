from datetime import datetime
from typing import Optional, Tuple, List
from app.models import db
from app.utils.gcs import generate_signed_url
from app.utils.placeholder import get_placeholder_profile_picture

class CommentRock(db.Model):
    __tablename__ = "comment_rock"

    comment_rock_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    rock_id = db.Column(db.Integer, db.ForeignKey("rock.rock_id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    parent_comment_rock_id = db.Column(db.Integer, db.ForeignKey("comment_rock.comment_rock_id"), nullable=True)
    like_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="rock_comments")
    replies = db.relationship(
        "CommentRock",
        backref=db.backref("parent", remote_side=[comment_rock_id]),
        lazy="joined",
        cascade="all, delete-orphan"
    )

    def to_dict(self, include_replies: bool = True, user_id: Optional[int] = None) -> dict:
        from app.entity.like_comment_rock import LikeCommentRock

        username = "Unknown"
        profile_picture = None

        if self.user:
            first = self.user.first_name or ""
            last = self.user.last_name or ""
            username = f"{first.strip()} {last.strip()}".strip()

            # Signed URL for profile picture (fallback to placeholder)
            profile_picture = generate_signed_url(
                self.user.profile_picture if self.user.profile_picture else get_placeholder_profile_picture(self.user.gender)
            )

        data = {
            "comment_rock_id": self.comment_rock_id,
            "user_id": self.user_id,
            "username": username,
            "rock_id": self.rock_id,
            "profile_picture": profile_picture,
            "content": self.content,
            "like_count": self.like_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        # Add like status
        if user_id is not None:
            try:
                is_liked = LikeCommentRock.has_liked(self.comment_rock_id, user_id)
                data["is_liked"] = is_liked
            except Exception as e:
                print(f"❌ Error checking like status for comment {self.comment_rock_id}: {e}")
                data["is_liked"] = False
        else:
            data["is_liked"] = False

        # Sort replies oldest-first
        if include_replies:
            sorted_replies = sorted(self.replies, key=lambda r: r.created_at)
            data["replies"] = [
                reply.to_dict(include_replies=False, user_id=user_id)
                for reply in sorted_replies
            ]

        return data

    @classmethod
    def create_comment(cls, **kwargs) -> Tuple[bool, int, str, Optional['CommentRock']]:
        try:
            comment = cls(**kwargs)
            db.session.add(comment)
            db.session.commit()
            return True, 201, "Comment created successfully", comment
        except Exception as e:
            db.session.rollback()
            print(f"Error creating comment: {e}")
            return False, 500, f"Error creating comment: {str(e)}", None

    @classmethod
    def get_comments_with_like_status(cls, rock_id: int, user_id: int) -> Tuple[bool, int, str, List[dict]]:
        try:
            parent_comments = (
                cls.query
                .filter_by(rock_id=rock_id, parent_comment_rock_id=None)
                .order_by(cls.created_at.asc())  # oldest → newest
                .all()
            )

            result = []
            for parent in parent_comments:
                parent_dict = parent.to_dict(include_replies=True, user_id=user_id)
                result.append(parent_dict)

            return True, 200, "Comments retrieved successfully", result
        except Exception as e:
            print("Error in get_comments_with_like_status:", e)
            return False, 500, str(e), []
        
    @classmethod
    def get_parent_comments_by_rock(cls, rock_id: int):
        try:
            parent_comments = cls.query.filter_by(rock_id=rock_id, parent_comment_rock_id=None).all()
            return parent_comments
        except Exception as e:
            print("❌ Failed to get parent comments:", e)
            return []
