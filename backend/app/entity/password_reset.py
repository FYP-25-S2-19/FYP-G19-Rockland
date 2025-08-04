# File: app/entity/password_reset.py

from flask import current_app
from datetime import datetime, timedelta
from typing import Optional
import secrets
from app.models import db

class PasswordReset(db.Model):
    __tablename__ = 'password_reset'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False)
    verification_code = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    
    def __init__(self, email: str):
        self.email = email.lower()
        self.verification_code = self.generate_code()
        self.created_at = datetime.utcnow()
        self.expires_at = self.created_at + timedelta(minutes=15)  # 15 minutes expiry
        self.is_used = False
    
    @staticmethod
    def generate_code() -> str:
        """Generate a 6-digit verification code"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    @classmethod
    def create_reset_request(cls, email: str) -> tuple[bool, str, Optional['PasswordReset']]:
        """Create a new password reset request"""
        try:
            from app.entity.user import User
            
            # Check if user exists
            user = User.queryUserAccount(email)
            if not user:
                # For security, don't reveal if email exists or not
                return True, "If this email is registered, you will receive a password reset code.", None
            
            # Check if user account is active
            if user.status != 'Active':
                return False, "Account is not active. Please contact administrator.", None
            
            # Clean up old unused reset requests for this email
            cls.cleanup_old_requests(email)
            
            # Create new reset request
            reset_request = cls(email=email)
            db.session.add(reset_request)
            db.session.commit()
            
            print(f"✅ Password reset request created for {email}")
            return True, "Password reset code generated successfully", reset_request
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating password reset request: {e}")
            return False, "An error occurred. Please try again.", None
    
    @classmethod
    def verify_reset_code(cls, email: str, code: str) -> tuple[bool, str]:
        """Verify password reset code"""
        try:
            # Find the most recent unused reset request
            reset_request = cls.query.filter_by(
                email=email.lower(),
                verification_code=code,
                is_used=False
            ).order_by(cls.created_at.desc()).first()
            
            if not reset_request:
                return False, "Invalid or expired verification code"
            
            # Check if code has expired
            if datetime.utcnow() > reset_request.expires_at:
                return False, "Verification code has expired. Please request a new one."
            
            return True, "Verification code is valid"
            
        except Exception as e:
            print(f"❌ Error verifying reset code: {e}")
            return False, "An error occurred during verification"
    
    @classmethod
    def complete_password_reset(cls, email: str, code: str, new_password: str) -> tuple[bool, str]:
        """Complete password reset process"""
        try:
            from app.entity.user import User
            
            # Verify the code first
            is_valid, message = cls.verify_reset_code(email, code)
            if not is_valid:
                return False, message
            
            # Get the user
            user = User.queryUserAccount(email)
            if not user:
                return False, "User not found"
            
            # Validate new password
            if len(new_password) < 8:
                return False, "Password must be at least 8 characters long"
            
            # Update password
            user.set_password(new_password)
            
            # Mark reset request as used
            reset_request = cls.query.filter_by(
                email=email.lower(),
                verification_code=code,
                is_used=False
            ).order_by(cls.created_at.desc()).first()
            
            if reset_request:
                reset_request.is_used = True
            
            # Invalidate all active tokens for security
            from app.entity.token import Token
            active_tokens = Token.query.filter_by(
                user_id=user.user_id,
                is_active=True
            ).all()
            
            for token in active_tokens:
                token.is_active = False
            
            db.session.commit()
            
            print(f"✅ Password reset completed for {email}")
            print(f"📝 Deactivated {len(active_tokens)} tokens")
            
            return True, "Password reset successfully"
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error completing password reset: {e}")
            return False, "An error occurred during password reset"
    
    @classmethod
    def cleanup_old_requests(cls, email: str):
        """Clean up old unused reset requests for an email"""
        try:
            old_requests = cls.query.filter_by(
                email=email.lower(),
                is_used=False
            ).all()
            
            for request in old_requests:
                db.session.delete(request)
            
            print(f"🧹 Cleaned up {len(old_requests)} old reset requests for {email}")
            
        except Exception as e:
            print(f"❌ Error cleaning up old requests: {e}")
