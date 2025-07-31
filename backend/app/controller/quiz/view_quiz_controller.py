from flask import Blueprint, jsonify
from app.entity.quiz import Quiz, QuizQuestion
from app.controller.authentication.permission_required import permission_required
from sqlalchemy import func

view_quiz_blueprint = Blueprint('view_quiz', __name__)

@view_quiz_blueprint.route('/api/quizzes', methods=['GET'])
@permission_required('has_premium_permission', 'has_freeuser_permission', 'has_expert_permission')
def get_quizzes(current_user):
    # Query quizzes along with question counts
    results = (
        Quiz.query
        .outerjoin(QuizQuestion, Quiz.quiz_id == QuizQuestion.quiz_id)
        .with_entities(
            Quiz,
            func.count(QuizQuestion.quiz_id).label('question_count')
        )
        .group_by(Quiz.quiz_id)
        .all()
    )

    quiz_list = []
    for quiz, question_count in results:
        quiz_data = quiz.to_dict_basic()
        quiz_data['question_count'] = question_count
        quiz_list.append(quiz_data)

    return jsonify({
        "success": True,
        "quizzes": quiz_list
    }), 200

@view_quiz_blueprint.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
@permission_required('has_premium_permission', 'has_freeuser_permission', 'has_expert_permission')
def get_quiz_by_id(current_user, quiz_id):
    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    return jsonify({
        "success": True,
        "quiz": quiz.to_dict_full()  # Make sure this method exists in your model
    }), 200
