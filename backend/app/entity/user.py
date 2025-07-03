# Libraries
from flask import current_app
from datetime import datetime
from typing_extensions import Self
import bcrypt  # Changed from werkzeug to bcrypt

# Local dependencies
from app.models import db
from app.entity.usertype import UserType

class User(db.Model):
    __tablename__ = 'user'  # Changed to lowercase

    user_id = db.Column(db.Integer, primary_key=True)  # Changed to lowercase
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    contact_number = db.Column(db.String(20))
    gender = db.Column(db.String(10))
    region = db.Column(db.String(100))
    status = db.Column(db.String(20), nullable=False, default='Active')
    total_points = db.Column(db.Integer, default=0)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign key to UserType
    user_type_id = db.Column(db.Integer, db.ForeignKey('user_type.user_type_id'), nullable=False, default=1)

    # Relationship with UserType model
    user_type = db.relationship('UserType', backref='users')

    def set_password(self, password):
        """Hash the password before storing it."""
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password) -> bool:
        """Verify the password hash."""
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def to_dict(self) -> dict:
        """Return a dictionary representation of the user."""
        return {
            'user_id': self.user_id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'contact_number': self.contact_number,
            'gender': self.gender,
            'region': self.region,
            'status': self.status,
            'total_points': self.total_points,
            'user_type_id': self.user_type_id,
            'user_type_name': self.user_type.name if self.user_type else None,
            'created_date': self.created_date.isoformat() if self.created_date else None
        }

    @classmethod
    def checkLogin(cls, email: str, password: str) -> bool:
        """Verify user login credentials"""
        user = cls.queryUserAccount(email)
    
        if not user or not user.check_password(password):
            return False

        # Check if account is active
        if user.status != 'Active':
            return False

        return True
    
    @classmethod
    def queryUserAccount(cls, email: str):
        """Query a specific user account based on email"""
        return cls.query.filter_by(email=email).first()

    @classmethod
    def queryUserById(cls, user_id: int):
        """Query a specific user account based on user_id"""
        return cls.query.get(user_id)