from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.quiz import QuizOption, QuizResult
from app.entity.user import User
from app.controller.authentication.permission_required import permission_required
from datetime import datetime, timedelta
from app.utils.user_activity_tracking_engine import update_user_quiz_count
from app.utils.achievement_tracking_engine import check_and_award_thresholds

create_quizattempt_blueprint = Blueprint('create_quizattempt', __name__)

@create_quizattempt_blueprint.route('/api/quizzes/<int:quiz_id>/submit', methods=['POST'])
@permission_required('has_freeuser_permission')
def submit_quiz(quiz_id, current_user):
    # Count today's attempts
    today = datetime.utcnow().date()
    attempts_today = QuizResult.query.filter_by(user_id=current_user.user_id)\
        .filter(QuizResult.completed_at >= datetime(today.year, today.month, today.day))\
        .count()

    # Enforce limit
    if current_user.user_type.name == "Free" and attempts_today >= 3:
        return jsonify({"success": False, "message": "Daily quiz limit reached for Free users"}), 403
    data = request.get_json()
    answers = data.get('answers')

    print("📩 Received answers:", answers)

    answers = data.get('answers')
    if not answers or not isinstance(answers, list) or len(answers) == 0:
        return jsonify({"success": False, "message": "No answers submitted."}), 200  # <-- Still allow 0 score

    correct_count = 0
    for ans in answers:
        selected_id = ans.get('selected_answer_id')
        print(f"🔍 Checking selected_answer_id: {selected_id}")
        option = QuizOption.query.get(selected_id)
        if option:
            print(f"✅ Option found: {option.option_text}, is_correct: {option.is_correct}")
            if option.is_correct:
                correct_count += 1
        else:
            print(f"❌ No QuizOption found for ID: {selected_id}")

    points = correct_count
    print(f"🎯 Correct count: {correct_count}, Points to award: {points}")

    result = QuizResult(
        user_id=current_user.user_id,
        quiz_id=quiz_id,
        score=correct_count,
        points_earned=points
    )
    db.session.add(result)

    user = User.query.get(current_user.user_id)
    user.total_points += points
    update_user_quiz_count(user.user_id)
    check_and_award_thresholds(user.user_id)
    db.session.commit()

    return jsonify({"success": True, "score": correct_count, "points_earned": points}), 200

@create_quizattempt_blueprint.route('/api/quizzes/<int:quiz_id>/check-eligibility', methods=['GET'])
@permission_required('has_freeuser_permission')
def check_quiz_eligibility(quiz_id, current_user):
    try:
        today = datetime.utcnow().date()
        attempts_today = QuizResult.query.filter_by(user_id=current_user.user_id)\
            .filter(QuizResult.completed_at >= datetime(today.year, today.month, today.day))\
            .count()

        print(f"📅 Attempts today for user {current_user.user_id}: {attempts_today}")

        if current_user.user_type.name == "Free" and attempts_today >= 3:
            print("❌ Daily quiz limit reached for Free user.")
            return jsonify({
                "eligible": False,
                "message": "You have reached the daily limit of 3 quizzes for Free users."
            }), 200

        print("✅ User is eligible for quiz.")
        return jsonify({
            "eligible": True,
            "message": "You are eligible to take this quiz."
        }), 200

    except Exception as e:
        print(f"💥 Error in check_quiz_eligibility: {e}")
        return jsonify({
            "success": False,
            "message": "An error occurred during eligibility check.",
            "details": str(e)
        }), 500
