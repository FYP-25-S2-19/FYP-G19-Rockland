# controller/achievements/create_achievement_controller.py
from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.achievement import AchievementsList
from app.controller.authentication.permission_required import permission_required

create_achievement_blueprint = Blueprint('create_achievement', __name__)

@create_achievement_blueprint.route('/api/achievements', methods=['POST'])
@permission_required('has_admin_permission')  # change to your admin permission function
def create_achievement(current_user):
    data = request.get_json()
    description = data.get('description')
    score = data.get('score', 0)

    if not description:
        return jsonify({'success': False, 'message': 'Description is required'}), 400

    new_achievement = AchievementsList(description=description, score=score)
    db.session.add(new_achievement)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Achievement created',
        'achievement': new_achievement.to_dict()
    }), 201
