# controllers/view_rock_controller.py

#call rock id, comment, like, etc etc

from flask import Blueprint, jsonify
from app.entity.rock import Rock
from app.entity.comment_rock import CommentRock

view_rock_blueprint = Blueprint("view_rock", __name__)

@view_rock_blueprint.route("/api/viewrock/<int:rock_id>", methods=["GET"])
def get_rock_detail_with_comments(rock_id):
    rock = Rock.get_rock_by_id(rock_id)
    if not rock:
        return jsonify({"success": False, "message": "Rock not found"}), 404

    # Get top-level comments (excluding replies)
    comments = CommentRock.get_comments_by_rock(rock_id)

    return jsonify({
        "success": True,
        "rock": rock.to_dict(),
        "comments": [c.to_dict(include_replies=True) for c in comments],
        "total_comments": sum(
            1 + len(c.replies) for c in comments  # parent + replies
        )
    }), 200
