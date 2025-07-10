# app/entity/discussion.py
from datetime import datetime
from app.models import db

class Discussion(db.Model):
    __tablename__ = 'discussion'

    discussion_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User', backref='discussions')
    comments = db.relationship('DiscussionComment', backref='discussion', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.discussion_id,
            'user': self.user.first_name if self.user else 'Unknown',
            'text': self.text,
            'timestamp': self.timestamp.isoformat(),
            'comment_count': len(self.comments)
        }
