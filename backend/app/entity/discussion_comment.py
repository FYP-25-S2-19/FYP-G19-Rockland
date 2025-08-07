# app/entity/discussion_comment.py

from datetime import datetime
from app.models import db

# ✅ Many-to-many table for likes
comment_likes = db.Table(
    'comment_like',
    db.Column('user_id', db.Integer, db.ForeignKey('user.user_id'), primary_key=True),
    db.Column('comment_id', db.Integer, db.ForeignKey('discussion_comment.comment_id'), primary_key=True)
)

class DiscussionComment(db.Model):
    __tablename__ = 'discussion_comment'

    comment_id = db.Column(db.Integer, primary_key=True)
    discussion_id = db.Column(db.Integer, db.ForeignKey('discussion.discussion_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    reply_to = db.Column(db.Integer, db.ForeignKey('discussion_comment.comment_id'), nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User')
    replies = db.relationship('DiscussionComment', remote_side=[comment_id])
    liked_by = db.relationship('User', secondary=comment_likes, backref='liked_comments')  # ✅

    def to_dict(self, current_user_id=None):
        return {
            'id': self.comment_id,
            'discussion_id': self.discussion_id,
            'user': self.user.first_name if self.user else 'Anonymous',
            'text': self.text,
            'replyTo': self.reply_to,
            'time': self.timestamp.isoformat(),
            'likes': self.get_like_count(),
            'liked_by_user': self.is_liked_by(current_user_id) if current_user_id else False
        }

    def get_like_count(self):
        return len(self.liked_by)

    def is_liked_by(self, user_id):
        return any(user.user_id == user_id for user in self.liked_by)

    @classmethod
    def add_comment(cls, discussion_id, user_id, text, reply_to=None):
        try:
            new_comment = cls(
                discussion_id=discussion_id,
                user_id=user_id,
                text=text,
                reply_to=reply_to,
                timestamp=datetime.utcnow()
            )
            db.session.add(new_comment)
            db.session.commit()
            return True, 201, "Comment posted successfully", new_comment.to_dict()
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Failed to post comment: {str(e)}", None

    @classmethod
    def toggle_like(cls, comment_id, user):
        try:
            comment = cls.query.get(comment_id)
            if not comment:
                return False, 404, "Comment not found", None

            if user in comment.liked_by:
                comment.liked_by.remove(user)
                db.session.commit()
                return True, 200, "Unliked comment", {
                    "liked": False,
                    "like_count": comment.get_like_count()
                }
            else:
                comment.liked_by.append(user)
                db.session.commit()
                return True, 200, "Liked comment", {
                    "liked": True,
                    "like_count": comment.get_like_count()
                }

        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error toggling comment like: {str(e)}", None
