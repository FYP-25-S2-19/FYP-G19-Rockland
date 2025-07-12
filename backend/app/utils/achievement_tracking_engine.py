# app/utils/achievement_engine.py
from app.models import db
from app.entity.user import User
from app.entity.achievement import AchievementsList, AchievementsRecord
from app.entity.user_activity import UserActivity

def award_if_not_earned(user_id: int, achievement_id: int):
    if AchievementsRecord.query.filter_by(user_id=user_id, achievement_id=achievement_id).first():
        return False

    achievement = AchievementsList.query.get(achievement_id)
    if not achievement:
        return False

    new_record = AchievementsRecord(user_id=user_id, achievement_id=achievement_id)
    db.session.add(new_record)

    user = User.query.get(user_id)
    user.total_points = (user.total_points or 0) + achievement.score

    db.session.commit()
    return True

def check_and_award_thresholds(user_id: int):
    awarded = []
    user = User.query.get(user_id)
    activity = UserActivity.query.filter_by(user_id=user_id).first()

    if not user or not activity:
        return awarded

    # 1. Quizzes
    if activity.quiz_count >= 1:
        if award_if_not_earned(user_id, 1):
            awarded.append("Completed First Quiz")

    if activity.quiz_count >= 5:
        if award_if_not_earned(user_id, 2):
            awarded.append("Completed 5 Quizzes")

    # 2. Discussions
    if activity.discussion_count >= 1:
        if award_if_not_earned(user_id, 3):
            awarded.append("Participated in First Discussion")

    if activity.discussion_count >= 10:
        if award_if_not_earned(user_id, 4):
            awarded.append("Participated in 10 Discussions")

    # 3. Points
    if (user.total_points or 0) >= 100:
        if award_if_not_earned(user_id, 5):
            awarded.append("Reached 100 Total Points")

    return awarded