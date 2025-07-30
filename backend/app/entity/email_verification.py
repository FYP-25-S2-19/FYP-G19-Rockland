# app/entity/email_verification.py
from app.models import db
from datetime import datetime, timedelta
import random
import string

class EmailVerification(db.Model):
    __tablename__ = 'email_verification'
    
    verification_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, index=True)
    verification_code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    attempts = db.Column(db.Integer, default=0)
    max_attempts = db.Column(db.Integer, default=5)
    
    @classmethod
    def generate_verification_code(cls):
        """Generate a 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    @classmethod
    def create_verification(cls, email: str, expiry_minutes: int = 15):
        """Create a new email verification record"""
        try:
            # Deactivate any existing verification for this email
            existing_verifications = cls.query.filter_by(
                email=email.lower(),
                is_verified=False
            ).all()
            
            for verification in existing_verifications:
                verification.is_verified = True  # Mark as used/expired
            
            # Generate new verification code
            verification_code = cls.generate_verification_code()
            expires_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)
            
            # Create new verification record
            new_verification = cls(
                email=email.lower(),
                verification_code=verification_code,
                expires_at=expires_at
            )
            
            db.session.add(new_verification)
            db.session.commit()
            
            print(f"✅ Email verification created for {email}: {verification_code}")
            return True, verification_code, new_verification
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating email verification: {e}")
            return False, None, None
    
    @classmethod
    def verify_code(cls, email: str, code: str):
        """Verify the email code"""
        try:
            # Find the latest active verification for this email
            verification = cls.query.filter_by(
                email=email.lower(),
                verification_code=code,
                is_verified=False
            ).order_by(cls.created_at.desc()).first()
            
            if not verification:
                return False, "Invalid verification code"
            
            # Check if code has expired
            if verification.expires_at < datetime.utcnow():
                verification.is_verified = True  # Mark as expired
                db.session.commit()
                return False, "Verification code has expired"
            
            # Check attempt limits
            if verification.attempts >= verification.max_attempts:
                verification.is_verified = True  # Lock the verification
                db.session.commit()
                return False, "Maximum verification attempts exceeded"
            
            # Increment attempts
            verification.attempts += 1
            
            # Mark as verified
            verification.is_verified = True
            db.session.commit()
            
            print(f"✅ Email {email} verified successfully")
            return True, "Email verified successfully"
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error verifying code: {e}")
            return False, f"Error verifying code: {str(e)}"
    
    @classmethod
    def is_email_verified(cls, email: str):
        """Check if email has been recently verified (within last 30 minutes)"""
        try:
            recent_verification = cls.query.filter_by(
                email=email.lower(),
                is_verified=True
            ).filter(
                cls.created_at > datetime.utcnow() - timedelta(minutes=30)
            ).order_by(cls.created_at.desc()).first()
            
            return recent_verification is not None
            
        except Exception as e:
            print(f"❌ Error checking email verification: {e}")
            return False
    
    @classmethod
    def send_verification_code(cls, email: str, user_name: str = None):
        """Send verification code to email (business logic)"""
        try:
            from app.entity.user import User
            from app.utils.email_service import EmailService
            import re
            
            # Validate email format
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                return False, 400, "Invalid email format", None
            
            # Check if email already exists in the system
            existing_user = User.queryUserAccount(email)
            if existing_user:
                return False, 409, "An account with this email already exists", None
            
            # Create verification record
            success, verification_code, verification_record = cls.create_verification(email)
            
            if not success:
                return False, 500, "Failed to create verification code", None
            
            # Send verification email
            email_sent, email_message = EmailService.send_verification_email(
                to_email=email,
                verification_code=verification_code,
                user_name=user_name
            )
            
            if not email_sent:
                return False, 500, f"Failed to send verification email: {email_message}", None
            
            return True, 200, "Verification code sent successfully", {
                'email': email,
                'expires_in_minutes': 15,
                'max_attempts': 5
            }
            
        except Exception as e:
            print(f"❌ Error in send_verification_code: {e}")
            return False, 500, f"Error sending verification code: {str(e)}", None
    
    @classmethod
    def verify_email_code(cls, email: str, code: str):
        """Verify email code (business logic)"""
        try:
            import re
            
            # Validate code format (6 digits)
            if not re.match(r'^\d{6}$', code):
                return False, 400, "Verification code must be 6 digits", None
            
            # Verify the code
            verified, message = cls.verify_code(email, code)
            
            if verified:
                return True, 200, message, {
                    'email': email,
                    'verified': True
                }
            else:
                return False, 400, message, None
                
        except Exception as e:
            print(f"❌ Error in verify_email_code: {e}")
            return False, 500, f"Error verifying code: {str(e)}", None
    
    @classmethod
    def cleanup_expired_verifications(cls):
        """Clean up expired verification records (run this periodically)"""
        try:
            expired_time = datetime.utcnow() - timedelta(hours=24)
            expired_verifications = cls.query.filter(
                cls.created_at < expired_time
            ).all()
            
            for verification in expired_verifications:
                db.session.delete(verification)
            
            db.session.commit()
            print(f"🧹 Cleaned up {len(expired_verifications)} expired verifications")
            return len(expired_verifications)
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error cleaning up verifications: {e}")
            return 0
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'verification_id': self.verification_id,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_verified': self.is_verified,
            'attempts': self.attempts,
            'max_attempts': self.max_attempts
        }