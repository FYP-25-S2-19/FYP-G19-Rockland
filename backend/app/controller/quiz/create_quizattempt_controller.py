from flask import Blueprint, request, jsonify
from app.entity.quiz import QuizResult
from app.controller.authentication.permission_required import permission_required

create_quizattempt_blueprint = Blueprint('create_quizattempt', __name__)

@create_quizattempt_blueprint.route('/api/quizzes/<int:quiz_id>/submit', methods=['POST'])
@permission_required('has_premium_permission', 'has_freeuser_permission')
def submit_quiz(quiz_id, current_user):
    data = request.get_json()
    answers = data.get('answers', [])

    response = QuizResult.submit_quiz_attempt(
        user_id=current_user.user_id,
        quiz_id=quiz_id,
        selected_answers=answers,
        user_type=current_user.user_type.name
    )

    return jsonify(response), response.get("status", 200)
