from flask import Blueprint, request, jsonify
from app.entity.quiz import QuizResult
from app.entity.user import User
from app.controller.authentication.permission_required import permission_required
from app.utils.user_activity_tracking_engine import update_user_quiz_count
from app.utils.achievement_tracking_engine import check_and_award_thresholds
from app.models import db

create_quizattempt_blueprint = Blueprint('create_quizattempt', __name__)

@create_quizattempt_blueprint.route('/api/quizzes/<int:quiz_id>/submit', methods=['POST'])
@permission_required('has_premium_permission', 'has_freeuser_permission')
def submit_quiz(quiz_id, current_user):
    attempts_today = QuizResult.count_attempts_today(current_user.user_id)
    if current_user.user_type.name == "Free" and attempts_today >= 3:
        return jsonify({"success": False, "message": "Daily quiz limit reached for Free users"}), 403

    data = request.get_json()
    answers = data.get('answers', [])
    selected_ids = [a.get("selected_answer_id") for a in answers if a.get("selected_answer_id")]

    result, correct_count = QuizResult.submit_result(current_user.user_id, quiz_id, selected_ids)

    user = User.query.get(current_user.user_id)
    user.total_points += correct_count
    update_user_quiz_count(user.user_id)
    check_and_award_thresholds(user.user_id)
    db.session.commit()

    return jsonify({"success": True, "score": correct_count, "points_earned": correct_count}), 200
