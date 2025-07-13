from flask import Blueprint, request, jsonify

# Update imports to match your project structure
from app.models import db
from app.entity.article import Article
from app.controller.authentication.permission_required import permission_required

view_article_blueprint = Blueprint('view_article', __name__)

class ViewArticleController:
    
    @staticmethod
    @view_article_blueprint.route('/api/articles/admin/all', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_all_articles_admin(**kwargs):
        """Fetch all articles for admin view"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"📋 Admin {current_user.email} is viewing all articles")
            
            # Use the entity method to get all articles
            articles_data, status_code = Article.getAllArticlesForAdmin()
            
            if articles_data is not None:
                return jsonify({
                    'success': True,
                    'message': 'Articles fetched successfully',
                    'articles': articles_data,
                    'total_count': len(articles_data)
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to fetch articles'
                }), status_code
                
        except Exception as e:
            print(f"Error in get_all_articles_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching articles: {str(e)}'
            }), 500

    @staticmethod
    @view_article_blueprint.route('/api/articles/public', methods=['GET'])
    def get_articles_public():
        """Get maximum 3 articles for public view (landing page) - no authentication required"""
        try:
            # Use the entity method to get articles for landing page
            articles_data, status_code, message = Article.getArticlesForLandingPage()
            
            if articles_data is not None:
                return jsonify({
                    'success': True,
                    'message': message,
                    'articles': articles_data,
                    'total_count': len(articles_data)
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message,
                    'articles': [],
                    'total_count': 0
                }), status_code
                
        except Exception as e:
            print(f"Error in get_articles_public controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching articles: {str(e)}',
                'articles': [],
                'total_count': 0
            }), 500
