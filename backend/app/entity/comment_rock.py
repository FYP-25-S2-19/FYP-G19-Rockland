from datetime import datetime
from typing import Optional, Tuple, List
from app.models import db

class CommentRock(db.Model):
    __tablename__ = "comment_rock"

    comment_rock_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    rock_id = db.Column(db.Integer, db.ForeignKey("rock.rock_id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    parent_comment_rock_id = db.Column(db.Integer, db.ForeignKey("comment_rock.comment_rock_id"), nullable=True)
    like_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", backref="rock_comments")
    replies = db.relationship(
        "CommentRock",
        backref=db.backref("parent", remote_side=[comment_rock_id]),
        lazy="joined",
        cascade="all, delete-orphan"
    )

    def to_dict(self, include_replies=True):
        data = {
            "comment_rock_id": self.comment_rock_id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else "Unknown",
            "rock_id": self.rock_id,
            "content": self.content,
            "like_count": self.like_count,
            "created_at": self.created_at.isoformat(),
        }
        if include_replies:
            data["replies"] = [reply.to_dict(include_replies=False) for reply in self.replies]
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
    def get_parent_comments_by_rock(cls, rock_id: int) -> List["CommentRock"]:
        return cls.query.filter_by(rock_id=rock_id, parent_comment_rock_id=None)\
            .order_by(cls.created_at.desc()).all()

    @classmethod
    def get_comment_by_id(cls, comment_id: int) -> Optional['CommentRock']:
        return cls.query.get(comment_id)

    @classmethod
    def delete_comment(cls, comment_id: int) -> Tuple[bool, int, str]:
        try:
            comment = cls.query.get(comment_id)
            if not comment:
                return False, 404, "Comment not found"
            db.session.delete(comment)
            db.session.commit()
            return True, 200, "Comment deleted successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting comment: {e}")
            return False, 500, f"Error deleting comment: {str(e)}"
        


