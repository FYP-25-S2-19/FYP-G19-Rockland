from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.discussion import Discussion
from app.controller.authentication.permission_required import permission_required

create_discussion_blueprint = Blueprint('create_discussion', __name__)

class CreateDiscussionController:
    
    @staticmethod
    @create_discussion_blueprint.route('/api/discussions/create', methods=['POST'])
    @permission_required('has_premium_permission')
    def create_discussion(**kwargs):
        """Create a new discussion - requires premium permission"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Premium authentication required'
                }), 401
            
            # Get request data
            data = request.get_json()
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            text = data.get('text', '').strip()
            
            # Validation
            if not text:
                return jsonify({
                    "success": False, 
                    "message": "Discussion text is required"
                }), 400
            
            if len(text) < 10:
                return jsonify({
                    "success": False, 
                    "message": "Discussion text must be at least 10 characters long"
                }), 400
            
            if len(text) > 2000:  # Set reasonable limit
                return jsonify({
                    "success": False, 
                    "message": "Discussion text cannot exceed 2000 characters"
                }), 400
            
            print(f"📝 User {current_user.email} is creating a discussion")
            
            # Use the entity method to create discussion
            success, status_code, message, discussion_data = Discussion.createDiscussion(
                user_id=current_user.user_id,
                text=text
            )
            
            if success:
                return jsonify({
                    "success": True,
                    "message": message,
                    "discussion": discussion_data
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "message": message
                }), status_code
            
        except Exception as e:
            db.session.rollback()
            print(f"Error in create_discussion controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating discussion: {str(e)}'
            }), 500