from flask import Blueprint, request, jsonify
from app.entity.article import Article
from app.controller.authentication.permission_required import permission_required

get_articles_by_user_interest_blueprint = Blueprint('get_articles_by_user_interest', __name__)

@get_articles_by_user_interest_blueprint.route('/api/articles/by-user-interest', methods=['GET'])
@permission_required([])  # All logged-in users
def get_articles_by_user_interest(**kwargs):
    try:
        current_user = kwargs.get("current_user")
        if not current_user:
            return jsonify({"success": False, "message": "Authentication required"}), 401

        sort_mode = request.args.get("sort", "interest-then-likes")

        preferred_category_ids = list(set(
            interest.categories_id for interest in current_user.interests
            if interest.categories_id is not None
        ))

        # Use existing searchArticles method
        sort_by = {
            "interest-then-likes": "most_liked",
            "interest-only": "newest"
        }.get(sort_mode, "newest")

        articles, status, message = Article.searchArticles(
            user_id=current_user.user_id,
            category_ids=preferred_category_ids,
            sort_by=sort_by
        )

        return jsonify({
            "success": True,
            "message": message,
            "articles": articles
        }), status
    except Exception as e:
        print(f"❌ Error in get_articles_by_user_interest: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
