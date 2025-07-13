from flask import Blueprint, jsonify
from app.controller.authentication.permission_required import permission_required
from app.entity.article import Article

get_article_by_id_blueprint = Blueprint("get_article_by_id", __name__)

class GetArticleByIdController:

    @staticmethod
    @get_article_by_id_blueprint.route('/api/articles/view/<int:article_id>', methods=['GET'])
    @permission_required([])  # Allow all authenticated users
    def get_article_by_id(article_id, current_user=None):
        try:
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401

            article_data, status_code, message = Article.getArticleByIdForUser(article_id, current_user.user_id)

            if article_data:
                return jsonify({
                    'success': True,
                    'message': message,
                    'article': article_data
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code

        except Exception as e:
            print(f"Error in get_article_by_id controller: {e}")
            return jsonify({
                'success': False,
                'message': f"Internal server error: {str(e)}"
            }), 500
