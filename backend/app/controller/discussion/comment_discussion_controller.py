from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.discussion_comment import DiscussionComment
from app.controller.authentication.permission_required import permission_required
from app.utils.user_activity_tracking_engine import update_user_discussion_count
from app.utils.achievement_tracking_engine import check_and_award_thresholds

comment_discussion_blueprint = Blueprint('comment_discussion', __name__)

@comment_discussion_blueprint.route('/api/discussions/<int:discussion_id>/comment', methods=['POST'])
@permission_required('has_freeuser_permission')
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
    
    # 🟢 Track discussion activity
    update_user_discussion_count(current_user.user_id)

    # 🟢 Evaluate achievements
    new_achievements = check_and_award_thresholds(current_user.user_id)
    if new_achievements:
        print("🏅 Achievements unlocked:", new_achievements)


    return jsonify({"success": True, "comment": comment.to_dict()}), 201

@permission_required('has_freeuser_permission')
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

    # 🟢 Track discussion activity
    update_user_discussion_count(current_user.user_id)

    # 🟢 Evaluate achievements
    new_achievements = check_and_award_thresholds(current_user.user_id)
    if new_achievements:
        print("🏅 Achievements unlocked:", new_achievements)

    return jsonify({"success": True, "comment": comment.to_dict()}), 201
