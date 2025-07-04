from flask import Blueprint, request, jsonify
from datetime import datetime

# Update imports to match your project structure
from app.models import db
from app.entity.user import User
from app.entity.usertype import UserType

create_user_blueprint = Blueprint('create_user', __name__)

class CreateUserController:
    @staticmethod
    @create_user_blueprint.route('/api/users/create_user', methods=['POST'])
    def create_user():
        """Create a new user account"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract user data from request
            email = data.get('email')
            password = data.get('password', 'Password123')  # Default password if not provided
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            date_of_birth = data.get('date_of_birth') or data.get('dob')  # Support both field names
            contact_number = data.get('contact_number')
            gender = data.get('gender')
            region = data.get('region')
            user_type_id = data.get('user_type_id', 1)  # Default to 'Free' user (ID: 1)
            
            # For backward compatibility - convert user_profile name to user_type_id
            if 'user_profile' in data and 'user_type_id' not in data:
                user_profile_name = data.get('user_profile')
                user_type = UserType.queryUserTypeByName(user_profile_name)
                if user_type:
                    user_type_id = user_type.user_type_id
                else:
                    return jsonify({
                        'success': False,
                        'message': f'User profile "{user_profile_name}" not found'
                    }), 404
            
            # Call the updated createUserAccount method
            success, status_code, message, new_user = User.createUserAccount(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                date_of_birth=date_of_birth,
                contact_number=contact_number,
                gender=gender,
                region=region,
                user_type_id=user_type_id
            )
            
            if success and new_user:
                return jsonify({
                    'success': True,
                    'message': message,
                    'user': new_user.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error creating user: {str(e)}'
            }), 500

