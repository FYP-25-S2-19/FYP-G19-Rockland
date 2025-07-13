from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.quiz import Quiz
from app.controller.authentication.permission_required import permission_required

manage_quiz_blueprint = Blueprint("manage_quiz", __name__)


@manage_quiz_blueprint.route("/api/quizzes", methods=["POST"])
@permission_required("has_expert_permission")
def create_quiz(current_user):
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")

    if not title:
        return jsonify({"success": False, "message": "Title is required"}), 400

    quiz = Quiz(
        title=title,
        description=description,
        created_by=current_user.user_id,
    )
    db.session.add(quiz)
    db.session.commit()

    return jsonify({"success": True, "quiz_id": quiz.quiz_id}), 201


@manage_quiz_blueprint.route("/api/quizzes/<int:quiz_id>", methods=["PUT"])
@permission_required("has_expert_permission")
def update_quiz(quiz_id, current_user):
    data = request.get_json()
    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    if quiz.created_by != current_user.user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    quiz.title = data.get("title", quiz.title)
    quiz.description = data.get("description", quiz.description)
    db.session.commit()

    return jsonify({"success": True, "message": "Quiz updated"}), 200


@manage_quiz_blueprint.route("/api/quizzes/<int:quiz_id>", methods=["DELETE"])
@permission_required("has_expert_permission")
def delete_quiz(quiz_id, current_user):
    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    if quiz.created_by != current_user.user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    db.session.delete(quiz)
    db.session.commit()

    return jsonify({"success": True, "message": "Quiz deleted"}), 200


@manage_quiz_blueprint.route("/api/quizzes/search", methods=["GET"])
@permission_required("has_expert_permission")
def search_quizzes(current_user):
    keyword = request.args.get("q", "").strip()
    query = Quiz.query

    if keyword:
        query = query.filter(Quiz.title.ilike(f"%{keyword}%"))

    results = query.all()

    return jsonify({
        "success": True,
        "quizzes": [q.to_dict_basic() for q in results]
    }), 200
