from flask import Blueprint, request, jsonify

# Update imports to match your project structure
from app.models import db
from app.entity.discussion import Discussion
from app.controller.authentication.permission_required import permission_required

delete_discussion_blueprint = Blueprint('delete_discussion', __name__)

class DeleteDiscussionController:
    
    @staticmethod
    @delete_discussion_blueprint.route('/api/discussions/delete/<int:discussion_id>', methods=['DELETE'])
    @permission_required('has_admin_permission') 
    def delete_discussion(discussion_id, **kwargs):
        """Delete a discussion - only by admin"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"🔧 Admin {current_user.email} is deleting discussion {discussion_id}")
            
            # Use the entity method to delete discussion
            success, status_code, message, discussion_data = Discussion.deleteDiscussion(
                discussion_id=discussion_id,
                user_id=current_user.user_id
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'deleted_discussion': discussion_data
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in delete_discussion controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error deleting discussion: {str(e)}'
            }), 500