# Libraries
from app.models import db
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from typing import Optional, Tuple  # Add this import

class UserType(db.Model):
    __tablename__ = 'user_type'
    
    # Add autoincrement=True to ensure it auto-increments
    user_type_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(255))
    
    # Permission columns (matching your database schema)
    has_admin_permission = db.Column(db.Boolean, default=False, nullable=False)
    has_freeuser_permission = db.Column(db.Boolean, default=False, nullable=False)
    has_premium_permission = db.Column(db.Boolean, default=False, nullable=False)
    has_expert_permission = db.Column(db.Boolean, default=False, nullable=False)
    
    @classmethod
    def queryUserType(cls, user_type_id: int):
        """Get user type by ID"""
        try:
            return cls.query.get(user_type_id)
        except Exception as e:
            print(f"Error fetching user type by ID {user_type_id}: {str(e)}")
            return None
    
    @classmethod
    def queryUserTypeByName(cls, name: str):
        """Get user type by name (case-insensitive)"""
        return cls.query.filter(db.func.lower(cls.name) == db.func.lower(name)).first()
    
    @classmethod
    def getAllUserTypes(cls):
        """Get all user types"""
        try:
            return cls.query.order_by(cls.user_type_id).all()
        except Exception as e:
            print(f"Error fetching all user types: {str(e)}")
            return None
    
    @classmethod
    def createUserType(cls, name: str, description: str = None, 
                      has_admin_permission: bool = False,
                      has_freeuser_permission: bool = False,
                      has_premium_permission: bool = False,
                      has_expert_permission: bool = False):
        """Create a new user type"""
        try:
            # Validate required fields
            if not name or not name.strip():
                return False, 400, "Name is required", None
            
            # Trim the name
            name = name.strip()
            
            # Check if user type with this name already exists (case-insensitive)
            existing_usertype = cls.queryUserTypeByName(name)
            if existing_usertype:
                return False, 409, f"User type with name '{name}' already exists", None
            
            # Validate that at least one permission is set
            if not any([has_admin_permission, has_freeuser_permission, 
                       has_premium_permission, has_expert_permission]):
                return False, 400, "At least one permission must be granted", None
            
            # Create new user type instance WITHOUT specifying user_type_id
            # Let the database auto-increment handle it
            new_usertype = cls(
                # Don't set user_type_id - let it auto-increment
                name=name,
                description=description.strip() if description else None,
                has_admin_permission=bool(has_admin_permission),
                has_freeuser_permission=bool(has_freeuser_permission),
                has_premium_permission=bool(has_premium_permission),
                has_expert_permission=bool(has_expert_permission)
            )
            
            # Save to database
            db.session.add(new_usertype)
            db.session.commit()
            
            # The user_type_id will be automatically assigned after commit
            print(f"Created user type with ID: {new_usertype.user_type_id}")
            
            return True, 201, "User type created successfully", new_usertype
            
        except IntegrityError as e:
            db.session.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            print(f"IntegrityError: {error_msg}")
            
            if 'duplicate key value violates unique constraint "user_type_pkey"' in error_msg:
                return False, 500, "Primary key conflict. The database may need auto-increment configuration.", None
            elif 'unique' in error_msg.lower() or 'duplicate' in error_msg.lower():
                return False, 409, f"User type with name '{name}' already exists", None
            else:
                return False, 500, f"Database integrity error: {error_msg}", None
        except Exception as e:
            # Rollback in case of error
            db.session.rollback()
            print(f"Error creating user type: {str(e)}")
            return False, 500, f"Error creating user type: {str(e)}", None
    
    def to_dict(self):
        """Convert UserType instance to dictionary"""
        return {
            'user_type_id': self.user_type_id,
            'name': self.name,
            'description': self.description,
            'has_admin_permission': self.has_admin_permission,
            'has_freeuser_permission': self.has_freeuser_permission,
            'has_premium_permission': self.has_premium_permission,
            'has_expert_permission': self.has_expert_permission
        }
    
    @classmethod
    def updateUserType(cls, user_type_id: int, name: str, description: str = None, 
                      has_admin_permission: bool = False,
                      has_freeuser_permission: bool = False,
                      has_premium_permission: bool = False,
                      has_expert_permission: bool = False):
        """Update an existing user type"""
        try:
            # Validate required fields
            if not name or not name.strip():
                return False, 400, "Name is required", None
            
            # Trim the name
            name = name.strip()
            
            # Get the existing user type
            existing_usertype = cls.queryUserType(user_type_id)
            if not existing_usertype:
                return False, 404, "User type not found", None
            
            # Check if another user type with this name already exists (case-insensitive)
            # but exclude the current user type from the check
            duplicate_usertype = cls.query.filter(
                db.func.lower(cls.name) == db.func.lower(name),
                cls.user_type_id != user_type_id
            ).first()
            
            if duplicate_usertype:
                return False, 409, f"User type with name '{name}' already exists", None
            
            # Validate that at least one permission is set
            if not any([has_admin_permission, has_freeuser_permission, 
                       has_premium_permission, has_expert_permission]):
                return False, 400, "At least one permission must be granted", None
            
            # Update the user type fields
            existing_usertype.name = name
            existing_usertype.description = description.strip() if description else None
            existing_usertype.has_admin_permission = bool(has_admin_permission)
            existing_usertype.has_freeuser_permission = bool(has_freeuser_permission)
            existing_usertype.has_premium_permission = bool(has_premium_permission)
            existing_usertype.has_expert_permission = bool(has_expert_permission)
            
            # Save to database
            db.session.commit()
            
            print(f"Updated user type with ID: {existing_usertype.user_type_id}")
            
            return True, 200, "User type updated successfully", existing_usertype
            
        except IntegrityError as e:
            db.session.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            print(f"IntegrityError: {error_msg}")
            
            if 'unique' in error_msg.lower() or 'duplicate' in error_msg.lower():
                return False, 409, f"User type with name '{name}' already exists", None
            else:
                return False, 500, f"Database integrity error: {error_msg}", None
        except Exception as e:
            # Rollback in case of error
            db.session.rollback()
            print(f"Error updating user type: {str(e)}")
            return False, 500, f"Error updating user type: {str(e)}", None
        
    

    @classmethod
    def suspendUserType(cls, user_type_id: int) -> tuple[bool, int, str, Optional['UserType']]:
        """
        Suspend a user type and move all associated users to Free user type (ID: 2)
        """
        try:
            # Get the user type to suspend
            user_type = cls.queryUserType(user_type_id)
            if not user_type:
                return False, 404, "User type not found", None
            
            # Prevent suspending Free user type (ID: 2) since it's the fallback
            if user_type_id == 2:
                return False, 400, "Cannot suspend Free user type as it's the default fallback", None
            
            # Check if user type is already suspended
            if hasattr(user_type, 'is_suspended') and user_type.is_suspended:
                return False, 400, f"User type '{user_type.name}' is already suspended", None
            
            # Get all users currently assigned to this user type
            from app.entity.user import User
            affected_users = User.query.filter_by(user_type_id=user_type_id).all()
            
            print(f"🔄 Suspending user type '{user_type.name}' (ID: {user_type_id})")
            print(f"📊 Found {len(affected_users)} users to reassign to Free user type")
            
            # Move all affected users to Free user type (ID: 2)
            if affected_users:
                for user in affected_users:
                    old_type = user.user_type_id
                    user.user_type_id = 2  # Free user type
                    print(f"   ↳ User {user.email}: {old_type} → 2 (Free)")
            
            # Mark the user type as suspended
            # If you don't have an is_suspended column, you can add it to the model
            # For now, we'll use the description to mark it as suspended
            original_description = user_type.description
            user_type.description = f"[SUSPENDED] {original_description or user_type.name}"
            
            # Commit all changes
            db.session.commit()
            
            print(f"✅ User type '{user_type.name}' suspended successfully")
            print(f"📝 {len(affected_users)} users moved to Free user type")
            
            return True, 200, f"User type '{user_type.name}' suspended successfully. {len(affected_users)} users moved to Free user type.", user_type
            
        except Exception as e:
            db.session.rollback()
            print(f"💥 Error suspending user type: {e}")
            return False, 500, f"An error occurred while suspending user type: {str(e)}", None