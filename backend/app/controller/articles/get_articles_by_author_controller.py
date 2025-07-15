from flask import Blueprint, jsonify
from app.entity.article import Article
from app.controller.authentication.permission_required import permission_required

get_articles_by_author_blueprint = Blueprint('get_articles_by_author', __name__)

class GetArticlesByAuthorController:

    @staticmethod
    @get_articles_by_author_blueprint.route('/api/articles/my_recent', methods=['GET'])
    @permission_required('has_expert_permission')
    def get_my_recent_articles(current_user=None):
        try:
            author_id = current_user.user_id
            articles, status_code, message = Article.getArticlesByAuthor(author_id=author_id, limit=6)

            if articles is None:
                return jsonify({
                    "success": False,
                    "message": message
                }), status_code

            return jsonify({
                "success": True,
                "message": message,
                "articles": articles
            }), status_code

        except Exception as e:
            print(f"❌ Error in get_my_recent_articles: {e}")
            return jsonify({
                "success": False,
                "message": f"Internal error: {str(e)}"
            }), 500
        
    @staticmethod
    @get_articles_by_author_blueprint.route('/api/articles/author/<int:author_id>', methods=['GET'])
    @permission_required('has_expert_permission')
    def get_articles_by_author(current_user=None, author_id=None):
        articles_data, status_code, message = Article.getAllArticlesByAuthor(author_id)
        if articles_data is not None:
            return jsonify({
                'success': True,
                'message': message,
                'articles': articles_data
            }), status_code
        else:
            return jsonify({
                'success': False,
                'message': message
            }), status_code
