# app/controller/comment_like_controller.py

from flask import Blueprint, jsonify
from app.entity.discussion_comment import DiscussionComment
from app.controller.authentication.permission_required import permission_required

comment_like_blueprint = Blueprint('comment_like', __name__)

@comment_like_blueprint.route('/api/discussions/comments/<int:comment_id>/like', methods=['POST'])
@permission_required('has_premium_permission', 'has_expert_permission')
def like_comment(comment_id, current_user):
    success, status_code, message, data = DiscussionComment.toggle_like(comment_id, current_user)
    return jsonify({
        "success": success,
        "message": message,
        **({"data": data} if data else {})
    }), status_code

@comment_like_blueprint.route('/api/discussions/comments/<int:comment_id>/unlike', methods=['DELETE'])
@permission_required('has_premium_permission', 'has_expert_permission')
def unlike_comment(comment_id, current_user):
    success, status_code, message, data = DiscussionComment.toggle_like(comment_id, current_user)
    return jsonify({
        "success": success,
        "message": message,
        **({"data": data} if data else {})
    }), status_code
