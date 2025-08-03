
from flask import Blueprint, jsonify, request
from app.entity.quiz import Quiz
from app.controller.authentication.permission_required import permission_required

view_quiz_blueprint = Blueprint('view_quiz', __name__)

@view_quiz_blueprint.route('/api/quizzes', methods=['GET'])
@permission_required('has_premium_permission', 'has_freeuser_permission', 'has_expert_permission')
def get_quizzes(current_user):
    interest_id = request.args.get('interest_id', type=int)
    try:
        if interest_id:
            quizzes = Quiz.get_filtered_by_interest(interest_id)
        else:
            user_interests = current_user.interests.all() if hasattr(current_user.interests, 'all') else []
            user_interest_ids = [i.interest_id for i in user_interests]
            quizzes = Quiz.get_sorted_by_user_interests(user_interest_ids)
        return jsonify({"success": True, "quizzes": [q.to_dict_basic() for q in quizzes]}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@view_quiz_blueprint.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
@permission_required('has_premium_permission', 'has_freeuser_permission', 'has_expert_permission')
def get_quiz_detail(quiz_id, current_user):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    return jsonify({"success": True, "quiz": quiz.to_dict_full()}), 200
