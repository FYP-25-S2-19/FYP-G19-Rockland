# controller/leaderboard/leaderboard_controller.py
from flask import Blueprint, jsonify
from app.entity.user import User

leaderboard_blueprint = Blueprint('leaderboard', __name__)

@leaderboard_blueprint.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    users = User.query.order_by(User.total_points.desc()).limit(10).all()
    return jsonify({
        "success": True,
        "leaderboard": [
            {
                "user_id": u.user_id,
                "name": f"{u.first_name} {u.last_name}",
                "points": u.total_points or 0,
                "image": u.to_dict_with_signed_url()["profile_picture"]  # ✅ Signed URL
            }
            for u in users
        ]
    }), 200