# app/controller/email/email_verification.py
from flask import Blueprint, request, jsonify
from app.entity.email_verification import EmailVerification

email_verification_blueprint = Blueprint('email_verification', __name__)

class EmailVerificationController:
    
    @staticmethod
    @email_verification_blueprint.route('/api/auth/send-verification-code', methods=['POST'])
    def send_verification_code():
        """Send verification code to email"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            email = data.get('email')
            user_name = data.get('name')  # Optional: for personalized email
            
            # Validate email
            if not email:
                return jsonify({
                    'success': False,
                    'message': 'Email is required'
                }), 400
            
            # Call entity method for business logic
            success, status_code, message, data_result = EmailVerification.send_verification_code(
                email=email,
                user_name=user_name
            )
            
            return jsonify({
                'success': success,
                'message': message,
                'data': data_result
            }), status_code
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error sending verification code: {str(e)}'
            }), 500
    
    @staticmethod
    @email_verification_blueprint.route('/api/auth/verify-email-code', methods=['POST'])
    def verify_email_code():
        """Verify the email verification code"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            email = data.get('email')
            code = data.get('code')
            
            # Validate inputs
            if not email or not code:
                return jsonify({
                    'success': False,
                    'message': 'Email and verification code are required'
                }), 400
            
            # Call entity method for business logic
            success, status_code, message, data_result = EmailVerification.verify_email_code(
                email=email,
                code=code
            )
            
            return jsonify({
                'success': success,
                'message': message,
                'data': data_result
            }), status_code
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error verifying code: {str(e)}'
            }), 500
    
    @staticmethod
    @email_verification_blueprint.route('/api/auth/resend-verification-code', methods=['POST'])
    def resend_verification_code():
        """Resend verification code to email"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            email = data.get('email')
            user_name = data.get('name')
            
            # Validate email
            if not email:
                return jsonify({
                    'success': False,
                    'message': 'Email is required'
                }), 400
            
            # Call entity method for business logic (same as send_verification_code)
            success, status_code, message, data_result = EmailVerification.send_verification_code(
                email=email,
                user_name=user_name
            )
            
            # Update message for resend context
            if success:
                message = "Verification code resent successfully"
            
            return jsonify({
                'success': success,
                'message': message,
                'data': data_result
            }), status_code
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error resending verification code: {str(e)}'
            }), 500