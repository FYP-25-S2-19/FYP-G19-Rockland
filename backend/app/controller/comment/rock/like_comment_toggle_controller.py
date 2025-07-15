from flask import Blueprint, request, jsonify
from app.entity.comment_rock import CommentRock
from app.entity.like_comment_rock import LikeCommentRock
from app.controller.authentication.permission_required import permission_required

toggle_like_comment_blueprint = Blueprint("toggle_like_comment", __name__)

# 4. Toggle Like on Comment
@toggle_like_comment_blueprint.route("/api/comments/<int:comment_id>/like", methods=["POST"])
@permission_required([])
def toggle_like_comment(comment_id, **kwargs):
    current_user = kwargs.get("current_user")
    success, status, msg = LikeCommentRock.toggle_like(comment_id, current_user.user_id)
    return jsonify({"success": success, "message": msg}), status