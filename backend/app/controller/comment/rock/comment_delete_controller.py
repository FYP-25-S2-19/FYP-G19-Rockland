from flask import Blueprint, request, jsonify
from app.entity.comment_rock import CommentRock
from app.entity.like_comment_rock import LikeCommentRock
from app.controller.authentication.permission_required import permission_required


delete_comment_blueprint = Blueprint("delete_comment", __name__)

# 3. Delete Comment
@delete_comment_blueprint.route("/api/comments/<int:comment_id>/delete", methods=["DELETE"])
@permission_required([])
def delete_comment(comment_id, **kwargs):
    current_user = kwargs.get("current_user")
    comment = CommentRock.get_comment_by_id(comment_id)

    if not comment:
        return jsonify({"success": False, "message": "Comment not found"}), 404

    # Allow only comment owner or admin
    is_admin = current_user.user_type and current_user.user_type.name == "Admin"
    if comment.user_id != current_user.user_id and not is_admin:
        return jsonify({"success": False, "message": "Not authorized to delete this comment"}), 403

    success, status, msg = CommentRock.delete_comment(comment_id)
    return jsonify({"success": success, "message": msg}), status
