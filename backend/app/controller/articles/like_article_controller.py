from flask import Blueprint, request, jsonify

# Update imports to match your project structure
from app.models import db
from app.entity.article_like import ArticleLike
from app.controller.authentication.permission_required import permission_required

like_article_blueprint = Blueprint('like_article', __name__)

class LikeArticleController:
    
    @staticmethod
    @like_article_blueprint.route('/api/articles/<int:article_id>/like', methods=['POST'])
    @permission_required([])  # Free users (covers both Free and Premium users)
    def like_article(article_id, **kwargs):
        """Like an article - Premium and Free users only"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401
            
            user_type_name = current_user.user_type.name if current_user.user_type else 'Unknown'
            print(f"❤️ {user_type_name} user {current_user.email} is liking article {article_id}")
            
            # Use the entity method to like article (entity handles user type restrictions)
            success, status_code, message, like_data = ArticleLike.likeArticle(
                user_id=current_user.user_id,
                article_id=article_id
            )
            
            if success and like_data:
                return jsonify({
                    'success': True,
                    'message': message,
                    'like': like_data.to_dict(),
                    'user_type': user_type_name
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in like_article controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error liking article: {str(e)}'
            }), 500
    
    @staticmethod
    @like_article_blueprint.route('/api/articles/<int:article_id>/like/check', methods=['GET'])
    @permission_required([])  # Free users (covers both Free and Premium users)
    def check_article_like(article_id, **kwargs):
        """Check if user has already liked an article"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401
            
            user_type_name = current_user.user_type.name if current_user.user_type else 'Unknown'
            print(f"🔍 {user_type_name} user {current_user.email} is checking like status for article {article_id}")
            
            # Use the entity method to check like status
            has_liked, status_code, message, like_data = ArticleLike.checkUserLike(
                user_id=current_user.user_id,
                article_id=article_id
            )
            
            return jsonify({
                'success': True,
                'message': message,
                'has_liked': has_liked,
                'like_data': like_data.to_dict() if like_data else None,
                'user_type': user_type_name
            }), status_code
                
        except Exception as e:
            print(f"Error in check_article_like controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error checking like status: {str(e)}'
            }), 500
    
    @staticmethod
    @like_article_blueprint.route('/api/articles/<int:article_id>/likes', methods=['GET'])
    @permission_required([]) 
    def get_article_likes(article_id, **kwargs):
        """Get all likes for a specific article"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401
            
            user_type_name = current_user.user_type.name if current_user.user_type else 'Unknown'
            print(f"📊 {user_type_name} user {current_user.email} is viewing likes for article {article_id}")
            
            # Use the entity method to get article likes
            likes_data, status_code, message = ArticleLike.getArticleLikes(article_id)
            
            if likes_data is not None:
                return jsonify({
                    'success': True,
                    'message': message,
                    'likes': likes_data,
                    'total_likes': len(likes_data),
                    'user_type': user_type_name
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in get_article_likes controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching article likes: {str(e)}'
            }), 500