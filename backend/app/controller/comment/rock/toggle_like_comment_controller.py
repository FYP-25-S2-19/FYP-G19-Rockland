# app/controller/comment/rock/toggle_like_comment_controller.py

from flask import Blueprint, request, jsonify
from app.controller.authentication.permission_required import permission_required
from app.entity.like_comment_rock import LikeCommentRock

# Require user to be logged in (no special permission needed)
login_required = permission_required([])

# Define the blueprint
toggle_like_comment_blueprint = Blueprint("toggle_like_comment", __name__)

# Route: Toggle like/unlike for a comment
@toggle_like_comment_blueprint.route("/api/comments/<int:comment_rock_id>/like", methods=["POST"])
@login_required
def toggle_like_comment(current_user, comment_rock_id):
    try:
        success, status_code, message = LikeCommentRock.toggle_like(
            comment_rock_id=comment_rock_id,
            user_id=current_user.user_id
        )
        return jsonify({
            "success": success,
            "message": message
        }), status_code

    except Exception as e:
        print(f"Error toggling like: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
