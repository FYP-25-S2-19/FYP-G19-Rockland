from flask import Blueprint, request, jsonify
from app.entity.article import Article
from app.controller.authentication.permission_required import permission_required

update_article_blueprint = Blueprint('update_article', __name__)

@update_article_blueprint.route('/api/articles/update/<int:article_id>', methods=['PUT'])
@permission_required([])  # Authenticated users
def update_article(article_id, **kwargs):
    try:
        current_user = kwargs.get("current_user")
        if not current_user:
            return jsonify({"success": False, "message": "Authentication required"}), 401

        title = request.form.get("title")
        content = request.form.get("content")
        categories_id = request.form.get("categories_id")
        is_free = request.form.get("is_free")
        is_free = is_free.lower() == "true" if is_free else None

        photo_file = request.files.get("photo")

        success, status, message, article = Article.updateArticle(
            article_id=article_id,
            user_id=current_user.user_id,
            title=title,
            content=content,
            categories_id=int(categories_id) if categories_id and categories_id.isdigit() else None,
            is_free=is_free,
            photo_file=photo_file
        )

        if success:
            return jsonify({"success": True, "message": message, "article": article.to_dict(current_user.user_id)}), status
        else:
            return jsonify({"success": False, "message": message}), status

    except Exception as e:
        print(f"❌ Error in update_article controller: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
