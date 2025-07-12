# app/utils/user_activity_tracking.py
from app.models import db
from app.entity.user_activity import UserActivity

def update_user_quiz_count(user_id: int):
    activity = UserActivity.query.filter_by(user_id=user_id).first()
    if not activity:
        activity = UserActivity(user_id=user_id, quiz_count=1)
        db.session.add(activity)
    else:
        activity.quiz_count += 1
    db.session.commit()

def update_user_discussion_count(user_id: int):
    activity = UserActivity.query.filter_by(user_id=user_id).first()
    if not activity:
        activity = UserActivity(user_id=user_id, discussion_count=1)
        db.session.add(activity)
    else:
        activity.discussion_count += 1
    db.session.commit()
