from flask import Blueprint, jsonify
from app.entity.rock import Rock
from app.entity.comment_rock import CommentRock
from app.controller.authentication.permission_required import permission_required

view_rock_blueprint = Blueprint("view_rock", __name__)

@view_rock_blueprint.route("/api/viewrock/<int:rock_id>", methods=["GET"])
@permission_required([])  # Public for all logged in users
def get_rock_detail_with_comments(rock_id, **kwargs):
    current_user = kwargs.get("current_user")
    rock = Rock.get_rock_by_id(rock_id)

    if not rock:
        return jsonify({"success": False, "message": "Rock not found"}), 404

    comments = CommentRock.get_parent_comments_by_rock(rock_id)

    return jsonify({
        "success": True,
        "rock": rock.to_dict(),
        "comments": [
            c.to_dict(include_replies=True, user_id=current_user.user_id)
            for c in comments
        ],
        "total_comments": sum(1 + len(c.replies) for c in comments)
    }), 200
