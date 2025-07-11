from flask import Blueprint, jsonify
from app.entity.discussion import Discussion
from app.entity.discussion_comment import DiscussionComment
from app.controller.authentication.permission_required import permission_required

view_discussion_blueprint = Blueprint('view_discussion', __name__)

@view_discussion_blueprint.route('/api/discussions', methods=['GET'])
@permission_required('has_premium_permission')
def get_discussions(current_user):
    discussions = Discussion.query.order_by(Discussion.timestamp.desc()).all()
    return jsonify({
        "success": True,
        "discussions": [d.to_dict() for d in discussions]
    }), 200

@view_discussion_blueprint.route('/api/discussions/<int:discussion_id>', methods=['GET'])
@permission_required('has_premium_permission')
def get_discussion_detail(discussion_id, current_user):
    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return jsonify({"success": False, "message": "Discussion not found"}), 404

    comments = DiscussionComment.query.filter_by(discussion_id=discussion_id).all()
    return jsonify({
        "success": True,
        "discussion": discussion.to_dict(),
        "comments": [c.to_dict() for c in comments]
    }), 200
