from flask import Blueprint, jsonify
from app.entity.article_like import ArticleLike
from app.controller.authentication.permission_required import permission_required

unlike_article_blueprint = Blueprint('unlike_article', __name__)

class UnlikeArticleController:

    @staticmethod
    @unlike_article_blueprint.route('/api/articles/<int:article_id>/unlike', methods=['DELETE'])
    @permission_required([])  # Allow Free and Premium users
    def unlike_article(article_id, **kwargs):
        try:
            current_user = kwargs.get("current_user")
            if not current_user:
                return jsonify({
                    "success": False,
                    "message": "Authentication required"
                }), 401

            success, status_code, message = ArticleLike.unlikeArticle(
                user_id=current_user.user_id,
                article_id=article_id
            )

            return jsonify({
                "success": success,
                "message": message
            }), status_code

        except Exception as e:
            print(f"Error in unlike_article controller: {e}")
            return jsonify({
                "success": False,
                "message": f"Unexpected error: {str(e)}"
            }), 500