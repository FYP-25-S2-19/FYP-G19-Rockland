# Libraries
from flask import Blueprint, request, jsonify

# Local Dependencies - adjusted for your project structure
from app.models import db
from app.entity.user import User
from app.entity.token import Token

login_blueprint = Blueprint("login", __name__)

class LoginController:
    @staticmethod
    @login_blueprint.route('/api/login', methods=['POST'])
    def login():
        """Handle user login"""
        try:
            data = request.get_json()

            # Validate input data
            if not data or 'email' not in data or 'password' not in data:
                return jsonify({
                    "success": False, 
                    "error": "Email and password not provided"
                }), 400
            
            email = data['email']
            password = data['password']

            # Validate credentials using User entity
            login_valid = User.checkLogin(email, password)

            
            if not login_valid:
                error_message = User.getLoginError(email, password)
                
                if "suspended" in error_message.lower():
                    return jsonify({
                        "success": False, 
                        "error": error_message,
                        "status": "suspended"
                    }), 403
                else:
                    return jsonify({
                        "success": False, 
                        "error": error_message
                    }), 401
            
            # Get user object for token creation
            user = User.queryUserAccount(email)
            if not user:
                return jsonify({
                    "success": False, 
                    "error": "User not found"
                }), 404

            # Create JWT Token using your Token entity method
            success, access_token = Token.createAccessToken(user)
            
            if success:
                return jsonify({
                    'success': True,
                    'access_token': access_token,
                    'user': user.to_dict()  # Include user data
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': 'Failed to create access token',
                    'details': access_token  # access_token contains error message on failure
                }), 500

        except Exception as e:
            return jsonify({
                'success': False,
                'error': 'Login failed',
                'details': str(e)
            }), 500
