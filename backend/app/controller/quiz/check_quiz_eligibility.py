from flask import Blueprint, request, jsonify
from app.entity.quiz import QuizResult
from app.controller.authentication.permission_required import permission_required

quiz_eligibility_blueprint = Blueprint('quiz_eligibility', __name__)

@quiz_eligibility_blueprint.route('/api/quizzes/<int:quiz_id>/check-eligibility', methods=['GET'])
@permission_required('has_freeuser_permission', 'has_premium_permission')
def check_quiz_eligibility(quiz_id, current_user):
    response = QuizResult.check_quiz_eligibility(
        user_id=current_user.user_id,
        quiz_id=quiz_id,
        user_type=current_user.user_type.name
    )
    return jsonify(response), response.get("status", 200)