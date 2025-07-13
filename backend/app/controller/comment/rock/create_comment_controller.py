# app/controller/comment/rock/create_comment_controller.py

from flask import Blueprint, request, jsonify
from app.entity.comment_rock import CommentRock
from app.controller.authentication.permission_required import permission_required

# 👇 Login required via JWT, no special permission needed
login_required = permission_required([])

# Blueprint setup
create_rock_comment_blueprint = Blueprint("create_rock_comment", __name__)

# Route definition with user auth
@create_rock_comment_blueprint.route('/api/rocks/<int:rock_id>/comments', methods=['POST'])
@login_required
def create_comment(current_user, rock_id):
    try:
        data = request.get_json()

        # Validate content
        content = data.get("content", "").strip()
        if not content:
            return jsonify({
                "success": False,
                "error": "Content cannot be empty"
            }), 400

        # Optional: parent comment for nested replies
        parent_id = data.get("parent_comment_rock_id")

        # Delegate logic to entity
        success, code, message, comment = CommentRock.create_comment(
            user_id=current_user.user_id,
            rock_id=rock_id,
            content=content,
            parent_comment_rock_id=parent_id
        )

        return jsonify({
            "success": success,
            "message": message,
            "comment": comment.to_dict() if comment else None
        }), code

    except Exception as e:
        print(f"Error creating rock comment: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
