from flask import Blueprint, jsonify, request
from app.models import db
from app.entity.article import Article
from app.controller.authentication.permission_required import permission_required

get_articles_hybrid_blueprint = Blueprint('get_articles_hybrid', __name__)

@get_articles_hybrid_blueprint.route('/api/articles/feed-hybrid', methods=['GET'])
@permission_required([])  # All logged-in users
def get_articles_hybrid(**kwargs):
    try:
        current_user = kwargs.get("current_user")
        if not current_user:
            return jsonify({"success": False, "message": "Authentication required"}), 401

        # Step 1: Get user's preferred category IDs from their interests
        preferred_category_ids = list(set(
            interest.categories_id for interest in current_user.interests
            if interest.categories_id is not None
        ))

        # Step 2: Fetch articles that match user interest
        recommended_articles, _, _ = Article.searchArticles(
            user_id=current_user.user_id,
            category_ids=preferred_category_ids,
            sort_by="newest"
        )

        # Step 3: Fetch all articles, regardless of interest
        all_articles, _, _ = Article.getArticlesForUser(current_user.user_id)

        # Step 4: Filter out duplicates
        recommended_ids = {a["article_id"] for a in recommended_articles}
        non_recommended_articles = [
            a for a in all_articles if a["article_id"] not in recommended_ids
        ]

        # ✅ Step 5: Mark tags
        for a in recommended_articles:
            a["is_recommended"] = True
        for a in non_recommended_articles:
            a["is_recommended"] = False

        # ✅ Step 6: Combine final result
        final_articles = recommended_articles + non_recommended_articles

        return jsonify({
            "success": True,
            "message": "Hybrid article feed returned.",
            "articles": final_articles
        }), 200

    except Exception as e:
        print("❌ Error in get_articles_hybrid:", e)
        return jsonify({"success": False, "message": str(e)}), 500
