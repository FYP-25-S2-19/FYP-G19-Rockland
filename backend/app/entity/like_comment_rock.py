from datetime import datetime
from typing import Optional, Tuple
from app.models import db

class LikeCommentRock(db.Model):
    __tablename__ = 'likecommentrock'

    likecommentrock_id = db.Column(db.Integer, primary_key=True)
    comment_rock_id = db.Column(db.Integer, db.ForeignKey('comment_rock.comment_rock_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('comment_rock_id', 'user_id', name='unique_like_per_user'),
    )

    def to_dict(self):
        return {
            "likecommentrock_id": self.likecommentrock_id,
            "comment_rock_id": self.comment_rock_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    @classmethod
    def toggle_like(cls, comment_rock_id: int, user_id: int) -> Tuple[bool, int, str]:
        try:
            from app.entity.comment_rock import CommentRock
            comment = CommentRock.query.get(comment_rock_id)
            if not comment:
                return False, 404, "Comment not found"

            existing_like = cls.query.filter_by(comment_rock_id=comment_rock_id, user_id=user_id).first()
            if existing_like:
                db.session.delete(existing_like)
                comment.like_count = max(0, comment.like_count - 1)
                action = "unliked"
            else:
                db.session.add(cls(comment_rock_id=comment_rock_id, user_id=user_id))
                comment.like_count += 1
                action = "liked"

            db.session.commit()
            return True, 200, f"Comment {action} successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error toggling like: {e}")
            return False, 500, f"Error toggling like: {str(e)}"

    @classmethod 
    def has_liked(cls, comment_rock_id: int, user_id: int) -> bool:
        return cls.query.filter_by(comment_rock_id=comment_rock_id, user_id=user_id).first() is not None
