# app/entity/discussion_comment.py
from datetime import datetime
from app.models import db

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

    def to_dict(self):
        return {
            'id': self.comment_id,
            'discussion_id': self.discussion_id,
            'user': self.user.first_name if self.user else 'Anonymous',
            'text': self.text,
            'replyTo': self.reply_to,
            'time': self.timestamp.isoformat()
        }

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
