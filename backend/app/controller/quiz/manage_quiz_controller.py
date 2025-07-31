
from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.quiz import Quiz, QuizQuestion, QuizOption
from app.controller.authentication.permission_required import permission_required

manage_quiz_blueprint = Blueprint("manage_quiz", __name__)

# 1. Create Quiz
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
        user_id=current_user.user_id,
        total_points=0  # default to 0 initially
    )
    db.session.add(quiz)
    db.session.commit()

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

    # Update quiz metadata
    quiz.title = data.get("title", quiz.title)
    quiz.description = data.get("description", quiz.description)

    # Prepare for total points
    total_points = 0

    questions_data = data.get("questions", [])

    for q_data in questions_data:
        question_id = q_data.get("question_id")
        options_data = q_data.get("options", [])

        if question_id:
            # Update existing question
            question = QuizQuestion.query.filter_by(question_id=question_id, quiz_id=quiz_id).first()
            if question:
                question.question_text = q_data.get("question", question.question_text)
                question.points = q_data.get("points", question.points)
                total_points += question.points

                # Handle options: update existing, add new, remove missing
                existing_options = QuizOption.query.filter_by(question_id=question.question_id).all()
                existing_option_ids = {opt.option_id for opt in existing_options}
                updated_option_ids = set()

                for opt_data in options_data:
                    option_id = opt_data.get("option_id")
                    if option_id:
                        # Update existing option
                        option = QuizOption.query.filter_by(option_id=option_id, question_id=question.question_id).first()
                        if option:
                            option.option_text = opt_data.get("option_text", option.option_text)
                            option.is_correct = opt_data.get("is_correct", option.is_correct)
                            updated_option_ids.add(option.option_id)
                    else:
                        # New option
                        new_option = QuizOption(
                            question_id=question.question_id,
                            option_text=opt_data.get("option_text"),
                            is_correct=opt_data.get("is_correct", False),
                        )
                        db.session.add(new_option)
                        db.session.flush()  # Assign option_id

                # Delete options that were removed
                to_delete_ids = existing_option_ids - updated_option_ids
                if to_delete_ids:
                    QuizOption.query.filter(QuizOption.option_id.in_(to_delete_ids)).delete(synchronize_session='fetch')

        else:
            # New question
            new_question = QuizQuestion(
                quiz_id=quiz_id,
                question_text=q_data.get("question"),
                points=q_data.get("points", 1),
            )
            db.session.add(new_question)
            db.session.flush()  # Get question_id
            total_points += new_question.points

            # Add all options for the new question
            for opt_data in options_data:
                new_option = QuizOption(
                    question_id=new_question.question_id,
                    option_text=opt_data.get("option_text"),
                    is_correct=opt_data.get("is_correct", False),
                )
                db.session.add(new_option)

    quiz.total_points = total_points

    db.session.commit()

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

    db.session.delete(quiz)
    db.session.commit()

    return jsonify({"success": True, "message": "Quiz deleted"}), 200

# 4. Search Quizzes
@manage_quiz_blueprint.route("/api/quizzes/search", methods=["GET"])
@permission_required("has_expert_permission")
def search_quizzes(current_user):
    keyword = request.args.get("q", "").strip()
    query = Quiz.query.filter(Quiz.user_id == current_user.user_id)

    if keyword:
        query = query.filter(Quiz.title.ilike(f"%{keyword}%"))

    results = query.order_by(Quiz.quiz_id.desc()).all()

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

    q = QuizQuestion(quiz_id=quiz_id, question_text=question_text, points=points)
    db.session.add(q)
    db.session.flush()

    for idx, opt_text in enumerate(options):
        opt = QuizOption(
            question_id=q.question_id,
            option_text=opt_text,
            is_correct=(idx == correct_index)
        )
        db.session.add(opt)

    quiz.total_points = (quiz.total_points or 0) + points
    db.session.commit()
    return jsonify({"success": True, "question_id": q.question_id}), 201
