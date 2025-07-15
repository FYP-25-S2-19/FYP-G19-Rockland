from flask import Blueprint, jsonify
from app.entity.comment_rock import CommentRock
from app.controller.authentication.permission_required import permission_required

get_comments_blueprint = Blueprint("get_comments_by_rock", __name__)

# 2. Get All Comments for Rock
@get_comments_blueprint.route("/api/comments/rock/<int:rock_id>", methods=["GET"])
@permission_required([])
def get_comments_by_rock(rock_id, **kwargs):
    print("🔥 Endpoint dipanggil: /api/comments/rock/<rock_id>")
    current_user = kwargs.get("current_user")
    try:
        success, status, msg, comments_data = CommentRock.get_comments_with_like_status(
            rock_id, current_user.user_id
        )

        print(f"📦 Final comments response for rock_id={rock_id}, user_id={current_user.user_id}:")
        for comment in comments_data:
            print(f"  ↪ comment_id={comment['comment_rock_id']}, is_liked={comment['is_liked']}")
            for reply in comment['replies']:
                print(f"     ↳ reply_id={reply['comment_rock_id']}, is_liked={reply['is_liked']}")

        return jsonify({
            "success": success,
            "message": msg,
            "comments": comments_data
        }), status
    except Exception as e:
        print("Error fetching comments:", e)
        return jsonify({"success": False, "message": str(e)}), 500
