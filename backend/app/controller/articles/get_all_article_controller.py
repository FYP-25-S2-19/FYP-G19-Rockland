from flask import Blueprint, jsonify
from app.entity.article import Article
from app.controller.authentication.permission_required import permission_required

get_all_articles_blueprint = Blueprint("get_all_articles", __name__)

@get_all_articles_blueprint.route("/api/articles/all", methods=["GET"])
@permission_required([])  # Authenticated users only
def get_all_articles(**kwargs):
    try:
        current_user = kwargs.get("current_user")
        if not current_user:
            return jsonify({
                "success": False,
                "message": "Authentication required"
            }), 401

        print(f"📄 {current_user.email} is loading article list")

        # Fetch all article previews (no full content shown)
        articles = Article.query_all_preview_only()
        return jsonify({
            "success": True,
            "articles": [a.to_preview_dict() for a in articles]
        }), 200

    except Exception as e:
        print("Error in get_all_articles:", e)
        return jsonify({
            "success": False,
            "message": f"Internal server error: {str(e)}"
        }), 500
