
from flask import Blueprint, jsonify
from app.entity.quiz import QuizResult
from app.controller.authentication.permission_required import permission_required

view_quizhistory_blueprint = Blueprint('view_quizhistory', __name__)

@view_quizhistory_blueprint.route('/api/quizhistory', methods=['GET'])
@permission_required('has_freeuser_permission', 'has_premium_permission')
def get_quiz_history(current_user):
    attempts = QuizResult.get_history_for_user(current_user.user_id)
    return jsonify({
        "success": True,
        "attempts": [
            {
                "title": a.quiz.title if a.quiz else "Unknown Quiz",
                "score": a.score,
                "total": a.quiz.total_points if a.quiz else 0,
                "points": a.points_earned,
                "date": a.completed_at.strftime('%Y-%m-%d') if a.completed_at else "N/A"
            }
            for a in attempts
        ]
    }), 200
