# app/entity/user_activity.py
from app.models import db

class UserActivity(db.Model):
    __tablename__ = 'useractivity'

    activity_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), unique=True, nullable=False)
    quiz_count = db.Column(db.Integer, default=0)
    discussion_count = db.Column(db.Integer, default=0)

    user = db.relationship('User', backref='activity')
