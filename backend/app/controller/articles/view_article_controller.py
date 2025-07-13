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
    @view_article_blueprint.route('/api/articles/view/<int:article_id>', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_article_detail_admin(article_id, **kwargs):
        """When admin click view, shows the detail of the article"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"👁️ Admin {current_user.email} is viewing article details {article_id}")
            
            # Use the entity method to get article details
            article_data, status_code, message = Article.getArticleById(article_id)
            
            if article_data is not None:
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
            print(f"Error in get_article_detail_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching article: {str(e)}'
            }), 500
    
    @staticmethod
    @view_article_blueprint.route('/api/articles/premium/view', methods=['GET'])
    @permission_required('has_freeuser_permission')
    def get_articles_premium(**kwargs):
        """Premium users can view articles"""
        try:
            # Access current premium user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Premium user authentication required'
                }), 401
            
            print(f"💎 Premium user {current_user.email} is viewing articles")
            
            # Use the entity method to get articles (entity handles premium logic)
            articles_data, status_code, message = Article.getArticlesForUser(current_user.user_id)
            
            if articles_data is not None:
                return jsonify({
                    'success': True,
                    'message': message,
                    'articles': articles_data,
                    'total_count': len(articles_data),
                    'user_type': 'Premium'
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in get_articles_premium controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching articles: {str(e)}'
            }), 500
    
    @staticmethod
    @view_article_blueprint.route('/api/articles/expert/view', methods=['GET'])
    @permission_required('has_expert_permission')
    def get_articles_expert(**kwargs):
        """Expert users can view articles"""
        try:
            # Access current expert user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Expert user authentication required'
                }), 401
            
            print(f"👑 Expert user {current_user.email} is viewing articles")
            
            # Use the entity method to get articles (entity handles expert logic)
            articles_data, status_code, message = Article.getArticlesForUser(current_user.user_id)
            
            if articles_data is not None:
                return jsonify({
                    'success': True,
                    'message': message,
                    'articles': articles_data,
                    'total_count': len(articles_data),
                    'user_type': 'Expert'
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in get_articles_expert controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching articles: {str(e)}'
            }), 500
    
    @staticmethod
    @view_article_blueprint.route('/api/articles/free/view', methods=['GET'])
    @permission_required('has_freeuser_permission')
    def get_articles_free(**kwargs):
        """Free users can view free articles (unlimited)"""
        try:
            # Access current free user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401
            
            print(f"🆓 Free user {current_user.email} is viewing articles")
            
            # Use the entity method to get articles (entity handles free user access to free articles only)
            articles_data, status_code, message = Article.getArticlesForUser(current_user.user_id)
            
            if articles_data is not None:
                return jsonify({
                    'success': True,
                    'message': message,
                    'articles': articles_data,
                    'total_count': len(articles_data),
                    'user_type': 'Free',
                    'note': 'Free articles only (unlimited access)'
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in get_articles_free controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching articles: {str(e)}'
            }), 500