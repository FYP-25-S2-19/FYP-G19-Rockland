# controller/achievements/view_achievement_controller.py
from flask import Blueprint, jsonify
from app.entity.achievement import AchievementsRecord
from app.controller.authentication.permission_required import permission_required

view_achievement_blueprint = Blueprint('view_achievement', __name__)

@view_achievement_blueprint.route('/api/achievements', methods=['GET'])
@permission_required('has_premium_permission')
def view_achievements(current_user):
    records = AchievementsRecord.query.filter_by(user_id=current_user.user_id).all()
    return jsonify({
        "success": True,
        "achievements": [r.to_dict() for r in records]
    }), 200

@view_achievement_blueprint.route('/api/achievements/full', methods=['GET'])
@permission_required('has_premium_permission')
def view_all_achievements_with_status(current_user):
    from app.entity.achievement import AchievementsList, AchievementsRecord
    from app.entity.user_activity import UserActivity

    all_achievements = AchievementsList.query.all()
    earned_records = AchievementsRecord.query.filter_by(user_id=current_user.user_id).all()
    activity = UserActivity.query.filter_by(user_id=current_user.user_id).first()

    earned_map = {r.achievement_id: r for r in earned_records}
    progress_data = {
        'quiz_count': activity.quiz_count if activity else 0,
        'discussion_count': activity.discussion_count if activity else 0,
        'total_points': current_user.total_points or 0
    }

    result = []

    for a in all_achievements:
        record = earned_map.get(a.achievement_id)
        earned = record is not None

        # Estimate progress (hardcoded logic)
        progress = None
        if a.description.lower().startswith("complete your first quiz"):
            progress = min(progress_data['quiz_count'] / 1, 1.0)
        elif a.description.lower().startswith("complete 5 quizzes"):
            progress = min(progress_data['quiz_count'] / 5, 1.0)
        elif a.description.lower().startswith("participate in a discussion"):
            progress = min(progress_data['discussion_count'] / 1, 1.0)
        elif a.description.lower().startswith("participate in 10 discussions"):
            progress = min(progress_data['discussion_count'] / 10, 1.0)
        elif a.description.lower().startswith("reach 100 total points"):
            progress = min(progress_data['total_points'] / 100, 1.0)

        result.append({
            'id': a.achievement_id,
            'description': a.description,
            'score': a.score,
            'earned': earned,
            'date_achieved': record.date_achieved.strftime('%Y-%m-%d') if earned else None,
            'progress_percent': int(progress * 100) if progress is not None else None
        })

    return jsonify({
        'success': True,
        'achievements': result
    }), 200
