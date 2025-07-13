from flask import Blueprint, jsonify
from app.entity.quiz import Quiz
from app.controller.authentication.permission_required import permission_required

view_quiz_blueprint = Blueprint('view_quiz', __name__)

@view_quiz_blueprint.route('/api/quizzes', methods=['GET'])
@permission_required('has_freeuser_permission')
def get_quizzes(current_user):
    quizzes = Quiz.query.all()
    return jsonify({
        "success": True,
        "quizzes": [q.to_dict_basic() for q in quizzes]
    }), 200

@view_quiz_blueprint.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
@permission_required('has_freeuser_permission')
def get_quiz_detail(quiz_id, current_user):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    return jsonify({
        "success": True,
        "quiz": quiz.to_dict_full()  # Assumes this method maps Quiz -> QuizQuestion -> QuizOption
    }), 200