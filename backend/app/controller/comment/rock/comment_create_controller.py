from flask import Blueprint, request, jsonify
from app.entity.comment_rock import CommentRock
from app.entity.like_comment_rock import LikeCommentRock
from app.controller.authentication.permission_required import permission_required

create_comment_blueprint = Blueprint("create_comment", __name__)

@create_comment_blueprint.route("/api/comments/create", methods=["POST"])
@permission_required([])
def create_comment(**kwargs):
    current_user = kwargs.get("current_user")
    data = request.get_json()

    required = ["rock_id", "content"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "message": f"{field} is required"}), 400

    comment_data = {
        "user_id": current_user.user_id,
        "rock_id": data["rock_id"],
        "content": data["content"],
        "parent_comment_rock_id": data.get("parent_comment_rock_id")
    }

    success, status, msg, comment = CommentRock.create_comment(**comment_data)
    if success:
        return jsonify({"success": True, "message": msg, "comment": comment.to_dict()}), status