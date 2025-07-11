# Libraries
from flask import Blueprint, request, jsonify

# Local Dependencies
from app.models import db
from app.entity.user import User
from app.entity.token import Token

test_login_blueprint = Blueprint("test_login", __name__)

class TestLoginController:
    @staticmethod
    @test_login_blueprint.route('/api/test-login', methods=['POST'])
    def test_login():
        """Test login endpoint - NO ADMIN RESTRICTION for testing purposes"""
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

            print(f"🧪 TEST LOGIN attempt for: {email}")

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
            
            # Get user object - NO ADMIN CHECK for testing
            user = User.queryUserAccount(email)
            if not user:
                return jsonify({
                    "success": False, 
                    "error": "User not found"
                }), 404

            # ✅ SKIP ADMIN CHECK FOR TESTING
            user_type = user.user_type
            if user_type:
                print(f"✅ TEST LOGIN granted for: {email} ({user_type.name}) - Admin check BYPASSED for testing")
            else:
                print(f"✅ TEST LOGIN granted for: {email} (No user type) - Admin check BYPASSED for testing")

            # Create JWT Token using your Token entity method
            success, access_token = Token.createAccessToken(user)
            
            if success:
                return jsonify({
                    'success': True,
                    'access_token': access_token,
                    'token': access_token,  # Also provide as 'token' for compatibility
                    'user': user.to_dict(),
                    'message': f'TEST login successful. Welcome, {user.first_name}! (Admin check bypassed for testing)'
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': 'Failed to create access token',
                    'details': access_token
                }), 500

        except Exception as e:
            print(f"💥 TEST login error: {e}")
            return jsonify({
                'success': False,
                'error': 'Login failed',
                'details': str(e)
            }), 500