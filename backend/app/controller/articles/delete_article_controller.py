from flask import Blueprint, request, jsonify

# Update imports to match your project structure
from app.models import db
from app.entity.article import Article
from app.controller.authentication.permission_required import permission_required

delete_article_blueprint = Blueprint('delete_article', __name__)

class DeleteArticleController:
    
    @staticmethod
    @delete_article_blueprint.route('/api/articles/delete/<int:article_id>', methods=['DELETE'])
    @permission_required('has_expert_permission')  # Expert users can delete their own articles
    def delete_article(article_id, **kwargs):
        """Delete an article - only by author or admin"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401
            
            print(f"🗑️ User {current_user.email} is attempting to delete article {article_id}")
            
            # Use the entity method to delete article
            success, status_code, message, article_data = Article.deleteArticle(
                article_id=article_id,
                user_id=current_user.user_id
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'deleted_article': article_data
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in delete_article controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error deleting article: {str(e)}'
            }), 500
    
    @staticmethod
    @delete_article_blueprint.route('/api/articles/admin-delete/<int:article_id>', methods=['DELETE'])
    @permission_required('has_admin_permission')  # Admin can delete any article
    def admin_delete_article(article_id, **kwargs):
        """Admin delete any article"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"🔧 Admin {current_user.email} is deleting article {article_id}")
            
            # Use the entity method to delete article (admin can delete any article)
            success, status_code, message, article_data = Article.deleteArticle(
                article_id=article_id,
                user_id=current_user.user_id  # Admin user_id for permission check
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'deleted_article': article_data
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in admin_delete_article controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error deleting article: {str(e)}'
            }), 500
    
