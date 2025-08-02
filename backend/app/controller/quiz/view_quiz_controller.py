from flask import Blueprint, jsonify, request
from app.entity.quiz import Quiz
from app.controller.authentication.permission_required import permission_required

view_quiz_blueprint = Blueprint('view_quiz', __name__)

@view_quiz_blueprint.route('/api/quizzes', methods=['GET'])
@permission_required('has_premium_permission', 'has_freeuser_permission', 'has_expert_permission')
def get_quizzes(current_user):
    interest_id = request.args.get('interest_id', type=int)

    if interest_id:
        # 🔍 Filter quizzes by query param
        quizzes = Quiz.query.filter_by(interest_id=interest_id).order_by(Quiz.quiz_id.desc()).all()
    else:
        # 🧠 Prioritize quizzes matching ANY of the user's interests
        try:
            user_interests = current_user.interests.all() if hasattr(current_user.interests, 'all') else []
            user_interest_ids = [i.interest_id for i in user_interests]

            all_quizzes = Quiz.query.order_by(Quiz.quiz_id.desc()).all()
            quizzes = sorted(
                all_quizzes,
                key=lambda q: 0 if q.interest_id in user_interest_ids else 1
            )
        except Exception as e:
            print(f"⚠️ Failed to prioritize by user interests: {e}")
            quizzes = Quiz.query.order_by(Quiz.quiz_id.desc()).all()

    return jsonify({
        "success": True,
        "quizzes": [q.to_dict_basic() for q in quizzes]
    }), 200

@view_quiz_blueprint.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
@permission_required('has_premium_permission', 'has_freeuser_permission', 'has_expert_permission')
def get_quiz_detail(quiz_id, current_user):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    return jsonify({
        "success": True,
        "quiz": quiz.to_dict_full()  # Assumes this method maps Quiz -> QuizQuestion -> QuizOption
    }), 200