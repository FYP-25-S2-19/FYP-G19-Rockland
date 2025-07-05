# Libraries
from app.models import db
from datetime import datetime, timedelta
import jwt
import os

class Token(db.Model):
    __tablename__ = 'token'  # Changed to lowercase

    token_id = db.Column(db.Integer, primary_key=True)  # Changed to lowercase
    access_token = db.Column(db.String(512), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)  # Updated FK reference
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    # Relationship with User
    user = db.relationship('User', backref='tokens')

    @classmethod
    def generateAccessToken(cls, user):
        """Generate JWT token for user"""
        try:
            payload = {
                'user_id': user.user_id,  # Updated to use lowercase
                'email': user.email,
                'user_type': user.user_type_id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            
            secret = os.getenv("JWT_SECRET", "fallback-secret")
            print(f"🔑 Secret found: {secret[:10]}..." if secret else "❌ No secret found")
            
            token = jwt.encode(payload, secret, algorithm="HS256")
            print(f"✅ Token generated successfully: {token[:50]}...")
            
            return token
        except Exception as e:
            print(f"❌ Error generating token: {e}")
            return None

    @classmethod
    def createAccessToken(cls, user):
        """Create token record in database"""
        try:
            print(f"🔄 Creating token for user: {user.email} (ID: {user.user_id})")
            
            # Check if active token exists
            existing_token = cls.query.filter_by(
                user_id=user.user_id,  # Updated to lowercase
                is_active=True
            ).first()
            
            if existing_token:
                print(f"♻️ Deactivating existing token for user {user.user_id}")
                existing_token.is_active = False

            # Generate new token
            token_string = cls.generateAccessToken(user)
            if not token_string:
                return False, "Failed to generate JWT token"
            
            print(f"🎫 Creating new token record in database...")
            
            # Create token record
            new_token = cls(
                access_token=token_string,
                user_id=user.user_id,  # Updated to lowercase
                expires_at=datetime.utcnow() + timedelta(hours=24)
            )
            
            print(f"💾 Saving token to database...")
            db.session.add(new_token)
            db.session.commit()
            
            print(f"✅ Token created successfully!")
            return True, token_string
            
        except Exception as e:
            print(f"❌ Error in createAccessToken: {e}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
            return False, str(e)

    @classmethod
    def queryAccessToken(cls, token_string):
        """Check if token exists and is valid"""
        token = cls.query.filter_by(
            access_token=token_string,
            is_active=True
        ).first()
        
        if not token:
            return None
            
        # Check if token is expired
        if token.expires_at < datetime.utcnow():
            token.is_active = False
            db.session.commit()
            return None
            
        return token

    @classmethod
    def revokeToken(cls, token_string):
        """Revoke/deactivate a token"""
        token = cls.query.filter_by(access_token=token_string).first()
        if token:
            token.is_active = False
            db.session.commit()
            return True
        return False

    def to_dict(self):
        """Convert token to dictionary"""
        return {
            'token_id': self.token_id,
            'user_id': self.user_id,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_active': self.is_active
        }