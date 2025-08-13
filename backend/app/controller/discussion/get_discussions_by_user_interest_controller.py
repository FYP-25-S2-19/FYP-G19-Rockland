# app/controller/discussion/get_discussions_by_user_interest_controller.py
from flask import Blueprint, request, jsonify
from app.entity.discussion import Discussion
from app.controller.authentication.permission_required import permission_required

get_discussions_by_user_interest_blueprint = Blueprint(
    'get_discussions_by_user_interest', __name__
)

@get_discussions_by_user_interest_blueprint.route(
    '/api/discussions/by-user-interest', methods=['GET']
)
@permission_required([])  # All logged-in users
def get_discussions_by_user_interest(**kwargs):
    try:
        current_user = kwargs.get("current_user")
        if not current_user:
            return jsonify({"success": False, "message": "Authentication required"}), 401

        sort_mode = request.args.get("sort", "interest-then-newest")

        # Gather preferred category IDs from user's interests
        preferred_category_ids = list(set(
            interest.categories_id for interest in current_user.interests
            if interest.categories_id is not None
        ))

        sort_by = {
            "interest-then-newest": "newest",
            "interest-only": "newest"
        }.get(sort_mode, "newest")

        discussions, status, message = Discussion.searchDiscussions(
            user_id=current_user.user_id,
            category_ids=preferred_category_ids,
            sort_by=sort_by
        )

        return jsonify({
            "success": True,
            "message": message,
            "discussions": discussions
        }), status
    except Exception as e:
        print(f"❌ Error in get_discussions_by_user_interest: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
