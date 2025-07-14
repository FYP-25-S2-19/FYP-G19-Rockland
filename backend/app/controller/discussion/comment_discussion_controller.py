from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.discussion_comment import DiscussionComment
from app.controller.authentication.permission_required import permission_required

comment_discussion_blueprint = Blueprint('comment_discussion', __name__)

@comment_discussion_blueprint.route('/api/discussions/<int:discussion_id>/comment', methods=['POST'])
@permission_required('has_premium_permission', 'has_expert_permission')
def add_comment(discussion_id, current_user):
    data = request.get_json()
    text = data.get('text')
    reply_to = data.get('reply_to')

    if not text:
        return jsonify({"success": False, "message": "Comment text is required"}), 400

    comment = DiscussionComment(
        discussion_id=discussion_id,
        user_id=current_user.user_id,
        text=text,
        reply_to=reply_to
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify({"success": True, "comment": comment.to_dict()}), 201
