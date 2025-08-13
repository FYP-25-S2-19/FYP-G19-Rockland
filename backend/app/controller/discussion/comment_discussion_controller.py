# app/controller/comment_discussion_controller.py

from flask import Blueprint, request, jsonify
from app.entity.discussion_comment import DiscussionComment
from app.controller.authentication.permission_required import permission_required

comment_discussion_blueprint = Blueprint('comment_discussion', __name__)

@comment_discussion_blueprint.route('/api/discussions/<int:discussion_id>/comment', methods=['POST'])
@permission_required('has_premium_permission', 'has_expert_permission')
def add_comment(discussion_id, current_user):
    """
    Add a new comment to a discussion.
    Body:
      {
        "text": "Nice find!",
        "reply_to": <optional parent_comment_id>
      }
    """
    try:
        data = request.get_json() or {}
        text = data.get('text')
        reply_to = data.get('reply_to')

        if not text or not str(text).strip():
            return jsonify({"success": False, "message": "Comment text is required"}), 400

        success, status_code, message, comment_data = DiscussionComment.add_comment(
            discussion_id=discussion_id,
            user_id=current_user.user_id,
            text=str(text).strip(),
            reply_to=reply_to
        )

        if success:
            return jsonify({"success": True, "comment": comment_data}), status_code
        else:
            return jsonify({"success": False, "message": message}), status_code
    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500
