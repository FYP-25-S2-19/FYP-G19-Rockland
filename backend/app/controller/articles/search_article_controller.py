from flask import Blueprint, request, jsonify

from app.models import db
from app.entity.article import Article
from app.controller.authentication.permission_required import permission_required

search_article_blueprint = Blueprint('search_article', __name__)

class SearchArticleController:
    
    @staticmethod
    @search_article_blueprint.route('/api/articles/search', methods=['GET'])
    @permission_required('has_freeuser_permission')  # Free users (covers both Free and Premium users)
    def search_articles(**kwargs):
        """Search articles by title or category - Free and Premium users only"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401
            
            # Get search parameters from query string
            search_term = request.args.get('title', '').strip()
            category_id = request.args.get('category_id')
            
            # Convert category_id to int if provided
            if category_id:
                try:
                    category_id = int(category_id)
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': 'Invalid category ID format'
                    }), 400
            
            user_type_name = current_user.user_type.name if current_user.user_type else 'Unknown'
            print(f"🔍 {user_type_name} user {current_user.email} is searching articles")
            print(f"Search parameters - Title: '{search_term}', Category ID: {category_id}")
            
            # Use the entity method to search articles (entity handles user type restrictions)
            articles_data, status_code, message = Article.searchArticles(
                user_id=current_user.user_id,
                search_term=search_term if search_term else None,
                category_id=category_id
            )
            
            if articles_data is not None:
                return jsonify({
                    'success': True,
                    'message': message,
                    'articles': articles_data,
                    'total_count': len(articles_data),
                    'user_type': user_type_name,
                    'search_parameters': {
                        'title': search_term if search_term else None,
                        'category_id': category_id
                    }
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in search_articles controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error searching articles: {str(e)}'
            }), 500
    
    @staticmethod
    @search_article_blueprint.route('/api/articles/search/premium', methods=['GET'])
    @permission_required('has_premium_permission')  # Premium users only
    def search_articles_premium(**kwargs):
        """Search articles by title or category - Premium users only (explicit endpoint)"""
        try:
            # Access current premium user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Premium user authentication required'
                }), 401
            
            # Get search parameters from query string
            search_term = request.args.get('title', '').strip()
            category_id = request.args.get('category_id')
            
            # Convert category_id to int if provided
            if category_id:
                try:
                    category_id = int(category_id)
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': 'Invalid category ID format'
                    }), 400
            
            print(f"🔍💎 Premium user {current_user.email} is searching articles")
            print(f"Search parameters - Title: '{search_term}', Category ID: {category_id}")
            
            # Use the entity method to search articles (entity handles premium user access)
            articles_data, status_code, message = Article.searchArticles(
                user_id=current_user.user_id,
                search_term=search_term if search_term else None,
                category_id=category_id
            )
            
            if articles_data is not None:
                return jsonify({
                    'success': True,
                    'message': message,
                    'articles': articles_data,
                    'total_count': len(articles_data),
                    'user_type': 'Premium',
                    'search_parameters': {
                        'title': search_term if search_term else None,
                        'category_id': category_id
                    },
                    'note': 'Premium users can search all articles (free + premium)'
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in search_articles_premium controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error searching articles: {str(e)}'
            }), 500