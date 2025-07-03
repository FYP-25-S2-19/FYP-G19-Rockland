# Libraries
from app.models import db
from datetime import datetime

class UserType(db.Model):
    __tablename__ = 'user_type'  # Changed to lowercase
    
    user_type_id = db.Column(db.Integer, primary_key=True)  # Changed to lowercase
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255))
    
    # Permission columns (matching your database schema)
    has_admin_permission = db.Column(db.Boolean, default=False)
    has_freeuser_permission = db.Column(db.Boolean, default=False)
    has_premium_permission = db.Column(db.Boolean, default=False)
    has_expert_permission = db.Column(db.Boolean, default=False)
    
    @classmethod
    def queryUserType(cls, user_type_id: int):
        """Get user type by ID"""
        return cls.query.get(user_type_id)
    
    @classmethod
    def queryUserTypeByName(cls, name: str):
        """Get user type by name"""
        return cls.query.filter_by(name=name).first()
    
    @classmethod
    def getAllUserTypes(cls):
        """Get all user types"""
        return cls.query.all()
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'user_type_id': self.user_type_id,
            'name': self.name,
            'description': self.description,
            'has_admin_permission': self.has_admin_permission,
            'has_freeuser_permission': self.has_freeuser_permission,
            'has_premium_permission': self.has_premium_permission,
            'has_expert_permission': self.has_expert_permission
        }