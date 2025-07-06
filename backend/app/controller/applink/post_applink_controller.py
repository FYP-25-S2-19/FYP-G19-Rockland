from flask import Blueprint, request, jsonify

# Update imports to match your project structure
from app.models import db
from app.entity.applink import AppLink
from app.controller.authentication.permission_required import permission_required

post_applink_blueprint = Blueprint('post_applink', __name__)

class PostAppLinkController:
    
    @staticmethod
    @post_applink_blueprint.route('/api/applinks/create', methods=['POST'])
    @permission_required('has_admin_permission')  
    def create_applink(**kwargs):
        """Create a new AppLink"""
        try:
            # Access current user
            current_user = kwargs.get('current_user')
            user_id = current_user.user_id if current_user else None
            
            if current_user:
                print(f"🔗 User {current_user.email} is creating a new app link")
            
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            # Extract fields from request data
            name = data.get('name', '').strip()
            link_attached = data.get('link_attached', '').strip()
            
            # Basic validation
            if not name:
                return jsonify({
                    'success': False,
                    'message': 'App link name is required'
                }), 400
            
            # Use entity method to handle creation
            success, status_code, message, new_applink = AppLink.createAppLink(
                name=name,
                user_id=user_id,
                link_attached=link_attached if link_attached else None
            )
            
            if success and new_applink:
                return jsonify({
                    'success': True,
                    'message': message,
                    'applink': new_applink.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in create_applink controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating app link: {str(e)}'
            }), 500