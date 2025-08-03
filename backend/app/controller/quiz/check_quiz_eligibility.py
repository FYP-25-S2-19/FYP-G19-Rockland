from flask import Blueprint, request, jsonify
from app.entity.quiz import QuizResult
from app.entity.user import User
from app.controller.authentication.permission_required import permission_required
from datetime import datetime

quiz_eligibility_blueprint = Blueprint('quiz_eligibility', __name__)

@quiz_eligibility_blueprint.route('/api/quizzes/<int:quiz_id>/check-eligibility', methods=['GET'])
@permission_required('has_freeuser_permission', 'has_premium_permission')
def check_quiz_eligibility(quiz_id, current_user):
    try:
        attempts_today = QuizResult.count_attempts_today(current_user.user_id)
        if current_user.user_type.name == "Free" and attempts_today >= 3:
            return jsonify({
                "eligible": False,
                "message": "You have reached the daily limit of 3 quizzes for Free users."
            }), 200

        return jsonify({
            "eligible": True,
            "message": "You are eligible to take this quiz."
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "An error occurred during eligibility check.",
            "details": str(e)
        }), 500
