
from flask import Blueprint, request, jsonify
from app.entity.quiz import Quiz
from app.controller.authentication.permission_required import permission_required

manage_quiz_blueprint = Blueprint("manage_quiz", __name__)

# 1. Create Quiz
@manage_quiz_blueprint.route("/api/quizzes", methods=["POST"])
@permission_required("has_expert_permission")
def create_quiz(current_user):
    data = request.get_json()
    if not data.get("title"):
        return jsonify({"success": False, "message": "Title is required"}), 400

    quiz = Quiz.create_quiz(data, current_user.user_id)
    return jsonify({"success": True, "quiz_id": quiz.quiz_id}), 201

# 2. Update Quiz
@manage_quiz_blueprint.route("/api/quizzes/<int:quiz_id>", methods=["PUT"])
@permission_required("has_expert_permission")
def update_quiz(quiz_id, current_user):
    data = request.get_json()
    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404
    if quiz.user_id != current_user.user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    quiz.update_quiz(data)
    return jsonify({"success": True, "message": "Quiz fully updated"}), 200

# 3. Delete Quiz
@manage_quiz_blueprint.route("/api/quizzes/<int:quiz_id>", methods=["DELETE"])
@permission_required("has_expert_permission")
def delete_quiz(quiz_id, current_user):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404
    if quiz.user_id != current_user.user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    quiz.delete_quiz()
    return jsonify({"success": True, "message": "Quiz deleted"}), 200

# 4. Search Quizzes
@manage_quiz_blueprint.route("/api/quizzes/search", methods=["GET"])
@permission_required("has_expert_permission")
def search_quizzes(current_user):
    keyword = request.args.get("q", "").strip()
    results = Quiz.search_quizzes_by_user(current_user.user_id, keyword)

    return jsonify({
        "success": True,
        "quizzes": [q.to_dict_basic() for q in results]
    }), 200

# 5. Add Question to Quiz
@manage_quiz_blueprint.route('/api/quizzes/<int:quiz_id>/questions', methods=['POST'])
@permission_required("has_expert_permission")
def add_question(quiz_id, current_user):
    data = request.get_json()
    question_text = data.get("question")
    options = data.get("options", [])
    correct_index = data.get("correctAnswerIndex")
    points = data.get("points", 1)

    if not question_text or not options or correct_index is None:
        return jsonify({"success": False, "message": "Missing question text, options, or correct answer index."}), 400

    quiz = Quiz.query.get(quiz_id)
    if not quiz or quiz.user_id != current_user.user_id:
        return jsonify({"success": False, "message": "Unauthorized or quiz not found"}), 403

    question_id = quiz.add_question(question_text, options, correct_index, points)
    return jsonify({"success": True, "question_id": question_id}), 201
