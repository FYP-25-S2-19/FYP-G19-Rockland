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
        """Handle user login - ADMIN ONLY"""
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

            print(f"🔐 Admin login attempt for: {email}")

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
            
            # Get user object for admin permission check
            user = User.queryUserAccount(email)
            if not user:
                return jsonify({
                    "success": False, 
                    "error": "User not found"
                }), 404

            # ✅ CHECK IF USER HAS ADMIN PERMISSION
            user_type = user.user_type
            if not user_type:
                print(f"❌ User {email} has no user type")
                return jsonify({
                    "success": False, 
                    "error": "Access denied. Admin privileges required."
                }), 403
            
            if not user_type.has_admin_permission:
                print(f"❌ User {email} ({user_type.name}) lacks admin permission")
                return jsonify({
                    "success": False, 
                    "error": "Access denied. Admin privileges required."
                }), 403
            
            print(f"✅ Admin access granted for: {email} ({user_type.name})")

            # Create JWT Token using your Token entity method
            success, access_token = Token.createAccessToken(user)
            
            if success:
                return jsonify({
                    'success': True,
                    'access_token': access_token,
                    'user': user.to_dict(),
                    'message': f'Admin login successful. Welcome, {user.first_name}!'
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': 'Failed to create access token',
                    'details': access_token
                }), 500

        except Exception as e:
            print(f"💥 Admin login error: {e}")
            return jsonify({
                'success': False,
                'error': 'Login failed',
                'details': str(e)
            }), 500