# app/entity/achievement.py
from datetime import datetime
from app.models import db

class AchievementsList(db.Model):
    __tablename__ = 'achievementslist'

    achievement_id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    score = db.Column(db.Integer, nullable=False, default=0)

    # Backref for all user records that have earned this achievement
    records = db.relationship('AchievementsRecord', backref='achievement', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.achievement_id,
            'description': self.description,
            'score': self.score
        }


class AchievementsRecord(db.Model):
    __tablename__ = 'achievementsrecord'

    record_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievementslist.achievement_id'), nullable=False)
    date_achieved = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User', backref='achievements_records')

    def to_dict(self):
        return {
            'record_id': self.record_id,
            'user_id': self.user_id,
            'achievement_id': self.achievement_id,
            'description': self.achievement.description if self.achievement else 'N/A',
            'score': self.achievement.score if self.achievement else 0,
            'date_achieved': self.date_achieved.strftime('%Y-%m-%d')
        }
