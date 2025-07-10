from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.discussion import Discussion
from app.controller.authentication.permission_required import permission_required

create_discussion_blueprint = Blueprint('create_discussion', __name__)

@create_discussion_blueprint.route('/api/discussions/create', methods=['POST'])
@permission_required('has_freeuser_permission')
def create_discussion(current_user):
    data = request.get_json()
    text = data.get('text')

    if not text:
        return jsonify({"success": False, "message": "Text is required"}), 400

    new_discussion = Discussion(user_id=current_user.user_id, text=text)
    db.session.add(new_discussion)
    db.session.commit()

    return jsonify({"success": True, "discussion": new_discussion.to_dict()}), 201
