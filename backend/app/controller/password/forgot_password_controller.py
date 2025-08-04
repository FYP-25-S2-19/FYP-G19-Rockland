# File: app/controller/password/forgot_password_controller.py

from flask import request, jsonify
from app.entity.password_reset import PasswordReset
from app.entity.user import User
from app.utils.email_service import EmailService
import re

class ForgotPasswordController:
    """Controller for handling forgot password HTTP requests - delegates business logic to entities"""
    
    @staticmethod
    def request_password_reset():
        """Step 1: Request password reset - sends verification code via email"""
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            
            # Basic request validation
            if not email:
                return jsonify({
                    'success': False,
                    'error': 'Email is required'
                }), 400
            
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                return jsonify({
                    'success': False,
                    'error': 'Invalid email format'
                }), 400
            
            # Delegate business logic to entity
            success, message, reset_request = PasswordReset.create_reset_request(email)
            
            # Handle email sending if reset request was created
            if success and reset_request:
                # Get user for personalized email (optional)
                user = User.queryUserAccount(email)
                user_name = f"{user.first_name} {user.last_name}" if user else None
                
                # Send email
                email_success, email_message = EmailService.send_password_reset_email(
                    to_email=email,
                    verification_code=reset_request.verification_code,
                    user_name=user_name
                )
                
                if not email_success:
                    return jsonify({
                        'success': False,
                        'error': f'Failed to send email: {email_message}'
                    }), 500
            
            # Return response (always success for security)
            return jsonify({
                'success': True,
                'message': 'If this email is registered, you will receive a password reset code.'
            }), 200
            
        except Exception as e:
            print(f"❌ Controller error in password reset request: {e}")
            return jsonify({
                'success': False,
                'error': 'An error occurred. Please try again.'
            }), 500

    @staticmethod
    def verify_reset_code():
        """Step 2: Verify the reset code"""
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            code = data.get('code', '').strip()
            
            # Basic request validation
            if not email or not code:
                return jsonify({
                    'success': False,
                    'error': 'Email and verification code are required'
                }), 400
            
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                return jsonify({
                    'success': False,
                    'error': 'Invalid email format'
                }), 400
            
            if not code.isdigit() or len(code) != 6:
                return jsonify({
                    'success': False,
                    'error': 'Invalid verification code format'
                }), 400
            
            # Delegate business logic to entity
            success, message = PasswordReset.verify_reset_code(email, code)
            
            # Return response
            return jsonify({
                'success': success,
                'message': message
            }), 200 if success else 400
            
        except Exception as e:
            print(f"❌ Controller error verifying reset code: {e}")
            return jsonify({
                'success': False,
                'error': 'An error occurred during verification'
            }), 500

    @staticmethod
    def reset_password():
        """Step 3: Complete password reset"""
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            code = data.get('code', '').strip()
            new_password = data.get('new_password', '')
            
            # Basic request validation
            if not email or not code or not new_password:
                return jsonify({
                    'success': False,
                    'error': 'Email, verification code, and new password are required'
                }), 400
            
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                return jsonify({
                    'success': False,
                    'error': 'Invalid email format'
                }), 400
            
            if not code.isdigit() or len(code) != 6:
                return jsonify({
                    'success': False,
                    'error': 'Invalid verification code format'
                }), 400
            
            if len(new_password) < 8:
                return jsonify({
                    'success': False,
                    'error': 'Password must be at least 8 characters long'
                }), 400
            
            # Delegate business logic to entity
            success, message = PasswordReset.complete_password_reset(email, code, new_password)
            
            # Return response
            return jsonify({
                'success': success,
                'message': message
            }), 200 if success else 400
            
        except Exception as e:
            print(f"❌ Controller error resetting password: {e}")
            return jsonify({
                'success': False,
                'error': 'An error occurred during password reset'
            }), 500