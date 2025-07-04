from flask import Blueprint, request, jsonify
from datetime import datetime

# Update imports to match your project structure
from app.models import db
from app.entity.usertype import UserType

create_usertype_blueprint = Blueprint('create_usertype', __name__)

class CreateUserTypeController:
    @staticmethod
    @create_usertype_blueprint.route('/api/usertypes/create_usertype', methods=['POST'])
    def create_usertype():
        """Create a new user type"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract usertype data from request
            name = data.get('name')
            description = data.get('description')
            has_admin_permission = data.get('has_admin_permission', False)
            has_freeuser_permission = data.get('has_freeuser_permission', False)
            has_premium_permission = data.get('has_premium_permission', False)
            has_expert_permission = data.get('has_expert_permission', False)
            
            # Use the entity method to create user type
            success, status_code, message, new_usertype = UserType.createUserType(
                name=name,
                description=description,
                has_admin_permission=has_admin_permission,
                has_freeuser_permission=has_freeuser_permission,
                has_premium_permission=has_premium_permission,
                has_expert_permission=has_expert_permission
            )
            
            if success and new_usertype:
                return jsonify({
                    'success': True,
                    'message': message,
                    'usertype': new_usertype.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error creating user type: {str(e)}'
            }), 500