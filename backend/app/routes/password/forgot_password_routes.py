# File: app/routes/password/forgot_password_routes.py

from flask import Blueprint
from app.controller.password.forgot_password_controller import ForgotPasswordController

# Create blueprint for forgot password routes
forgot_password_bp = Blueprint('forgot_password', __name__)

# Route for requesting password reset (Step 1)
@forgot_password_bp.route('/api/forgot-password/request', methods=['POST'])
def request_password_reset():
    """Step 1: Request password reset - sends verification code via email"""
    return ForgotPasswordController.request_password_reset()

# Route for verifying reset code (Step 2)  
@forgot_password_bp.route('/api/forgot-password/verify', methods=['POST'])
def verify_reset_code():
    """Step 2: Verify the reset code"""
    return ForgotPasswordController.verify_reset_code()

# Route for completing password reset (Step 3)
@forgot_password_bp.route('/api/forgot-password/reset', methods=['POST'])
def reset_password():
    """Step 3: Complete password reset"""
    return ForgotPasswordController.reset_password()