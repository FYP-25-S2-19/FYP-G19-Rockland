# controller/achievements/collect_achievement_controller.py
from flask import Blueprint, jsonify, request
from app.models import db
from app.entity.achievement import AchievementsList, AchievementsRecord
from app.entity.user import User
from app.controller.authentication.permission_required import permission_required

collect_achievement_blueprint = Blueprint('collect_achievement', __name__)

@collect_achievement_blueprint.route('/api/achievements/collect', methods=['POST'])
@permission_required('has_freeuser_permission')
def collect_achievement(current_user):
    data = request.get_json()
    achievement_id = data.get('achievement_id')

    if not achievement_id:
        return jsonify({'success': False, 'message': 'Missing achievement_id'}), 400

    exists = AchievementsRecord.query.filter_by(user_id=current_user.user_id, achievement_id=achievement_id).first()
    if exists:
        return jsonify({'success': False, 'message': 'Achievement already collected'}), 400

    achievement = AchievementsList.query.get(achievement_id)
    if not achievement:
        return jsonify({'success': False, 'message': 'Achievement not found'}), 404

    record = AchievementsRecord(
        user_id=current_user.user_id,
        achievement_id=achievement_id
    )
    db.session.add(record)

    current_user.total_points = (current_user.total_points or 0) + achievement.score
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Achievement "{achievement.description}" collected!',
        'score_awarded': achievement.score,
        'total_points': current_user.total_points
    }), 200
