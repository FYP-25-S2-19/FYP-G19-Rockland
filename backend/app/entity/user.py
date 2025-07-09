# Libraries
from flask import current_app
from datetime import datetime
from typing_extensions import Self
from typing import Optional, Tuple, List
import bcrypt
import re

# Local dependencies
from app.models import db
from app.entity.usertype import UserType

# Association table for many-to-many relationship between User and Interest
user_interest_association = db.Table('userinterest',
    db.Column('user_id', db.Integer, db.ForeignKey('user.user_id'), primary_key=True),
    db.Column('interest_id', db.Integer, db.ForeignKey('interest.interest_id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'user'  

    user_id = db.Column(db.Integer, primary_key=True)  
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
    user_type_id = db.Column(db.Integer, db.ForeignKey('user_type.user_type_id'), nullable=False, default=2)

    # Relationship with UserType model
    user_type = db.relationship('UserType', backref='users')

    # Many-to-many relationship with Interest using association table
    interests = db.relationship('Interest', 
                              secondary=user_interest_association,
                              backref='users',
                              lazy='dynamic')

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
            'created_date': self.created_date.isoformat() if self.created_date else None,
            
            # ✅ Add this line to return interest titles
            'interests': [interest.title for interest in self.interests] if self.interests else []
        }

    @classmethod
    def checkLogin(cls, email: str, password: str) -> bool:
        """Verify user login credentials"""
        user = cls.queryUserAccount(email)

        if not user:
            return False

        # Check if account is suspended BEFORE checking password
        if user.status == 'Suspended':
            return False
        
        # Check if account is active
        if user.status != 'Active':
            return False

        # Finally check password
        if not user.check_password(password):
            return False

        return True

    @classmethod 
    def getLoginError(cls, email: str, password: str) -> str:
        """Get specific error message for failed login"""
        user = cls.queryUserAccount(email)
        
        if not user:
            return "Invalid email or password"
        
        if user.status == 'Suspended':
            return "Your account has been suspended. Please contact administrator."
        
        if user.status != 'Active':
            return f"Your account is {user.status.lower()}. Please contact administrator."
        
        if not user.check_password(password):
            return "Invalid email or password"
        
        return "Login successful"
    
    @classmethod
    def queryUserAccount(cls, email: str):
        """Query a specific user account based on email"""
        return cls.query.filter_by(email=email).first()

    @classmethod
    def queryUserById(cls, user_id: int):
        """Query a specific user account based on user_id"""
        return cls.query.get(user_id)
    
    @classmethod
    def viewUserAccount(cls, email: str):
        """View individual user account details by email (for admin use)"""
        try:
            user = cls.queryUserAccount(email)
            
            if not user:
                return None, 404
            
            return user.to_dict(), 200
            
        except Exception as e:
            print(f"Error viewing user account: {e}")
            return None, 500
    
    @classmethod
    def getAllUsers(cls):
        """Get all users for admin view"""
        try:
            users = cls.query.order_by(cls.created_date.desc()).all()
            users_data = [user.to_dict() for user in users]
            return users_data, 200
        except Exception as e:
            print(f"Error fetching all users: {e}")
            return None, 500
    
    @classmethod
    def searchUserAccount(cls, search_term: str = None):
        """Search user accounts by first name, email, or date of birth"""
        try:
            if not search_term:
                # If no search term provided, return all users
                users = cls.query.join(UserType).order_by(cls.created_date.desc()).all()
                users_data = [user.to_dict() for user in users]
                return users_data, 200
            
            # Clean the search term
            search_term_clean = search_term.strip()
            
            # Try to detect if search term is a date (various formats)
            date_search = None
            
            # Check for date formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, etc.
            date_patterns = [
                r'^\d{4}-\d{2}-\d{2}$',  # YYYY-MM-DD
                r'^\d{2}/\d{2}/\d{4}$',  # DD/MM/YYYY or MM/DD/YYYY
                r'^\d{2}-\d{2}-\d{4}$',  # DD-MM-YYYY
                r'^\d{1,2}/\d{1,2}/\d{4}$',  # D/M/YYYY or DD/M/YYYY etc.
                r'^\d{1,2}-\d{1,2}-\d{4}$',  # D-M-YYYY or DD-M-YYYY etc.
            ]
            
            # Try to parse as date
            for pattern in date_patterns:
                if re.match(pattern, search_term_clean):
                    try:
                        # Try different date parsing formats
                        if '-' in search_term_clean and len(search_term_clean.split('-')[0]) == 4:
                            # YYYY-MM-DD format
                            date_search = datetime.strptime(search_term_clean, '%Y-%m-%d').date()
                            break
                        elif '/' in search_term_clean:
                            # Try DD/MM/YYYY format first
                            try:
                                date_search = datetime.strptime(search_term_clean, '%d/%m/%Y').date()
                                break
                            except ValueError:
                                # Try MM/DD/YYYY format
                                try:
                                    date_search = datetime.strptime(search_term_clean, '%m/%d/%Y').date()
                                    break
                                except ValueError:
                                    # Try single digit variations
                                    parts = search_term_clean.split('/')
                                    if len(parts) == 3:
                                        day, month, year = parts
                                        try:
                                            date_search = datetime.strptime(f"{day.zfill(2)}/{month.zfill(2)}/{year}", '%d/%m/%Y').date()
                                            break
                                        except ValueError:
                                            continue
                        elif '-' in search_term_clean:
                            # Try DD-MM-YYYY format
                            try:
                                date_search = datetime.strptime(search_term_clean, '%d-%m-%Y').date()
                                break
                            except ValueError:
                                # Try single digit variations
                                parts = search_term_clean.split('-')
                                if len(parts) == 3:
                                    day, month, year = parts
                                    try:
                                        date_search = datetime.strptime(f"{day.zfill(2)}-{month.zfill(2)}-{year}", '%d-%m-%Y').date()
                                        break
                                    except ValueError:
                                        continue
                    except ValueError:
                        # If date parsing fails, continue to text search
                        continue
            
            # Build search query using OR conditions
            from sqlalchemy import or_
            
            search_conditions = []
            
            # Search by email (case-insensitive)
            search_conditions.append(cls.email.ilike(f'%{search_term_clean}%'))
            
            # Search by first name (case-insensitive)
            search_conditions.append(cls.first_name.ilike(f'%{search_term_clean}%'))
            
            # Search by last name (case-insensitive)
            search_conditions.append(cls.last_name.ilike(f'%{search_term_clean}%'))
            
            # If we successfully parsed a date, search by date of birth
            if date_search:
                search_conditions.append(cls.date_of_birth == date_search)
            
            # Apply OR search across all conditions
            query = cls.query.join(UserType).filter(or_(*search_conditions))
            
            # Execute query and get results
            users = query.order_by(cls.created_date.desc()).all()
            users_data = [user.to_dict() for user in users]
            
            return users_data, 200
            
        except Exception as e:
            print(f"Error searching users: {e}")
            return None, 500
    
    @classmethod
    def createUserAccount(cls, email: str, password: str = "Password123",
                        first_name: str = None,
                        last_name: str = None,
                        date_of_birth: str = None,
                        contact_number: str = None,
                        gender: str = None,
                        region: str = None,
                        user_type_id: int = 2,  # Default to 'Free' user type
                        status: str = 'Active',
                        total_points: int = 0,
                        interests: list = None):  # Added interests parameter
        """Create a new user account"""
        
        # Check if user already exists
        if cls.queryUserAccount(email):
            return False, 409, "User with this email already exists", None

        # Validate required fields
        if not email or not password or not first_name or not last_name or not date_of_birth:
            return False, 400, "Missing required fields", None
        
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return False, 400, "Invalid email format", None
        
        # Check if user_type_id exists
        user_type = UserType.query.get(user_type_id)
        if not user_type:
            return False, 404, f"User type with ID {user_type_id} not found", None

        # Convert date_of_birth string to date object
        try:
            dob_date = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
        except ValueError:
            return False, 400, "Invalid date format. Use YYYY-MM-DD", None
        
        try:
            # Create new user instance
            new_user = cls(
                email=email.lower(),  # Store email in lowercase
                first_name=first_name.strip(),
                last_name=last_name.strip(),
                date_of_birth=dob_date,
                contact_number=contact_number,
                gender=gender,
                region=region,
                user_type_id=user_type_id,
                status=status,
                total_points=total_points,
                created_date=datetime.utcnow()
            )
            
            # Hash the password using the instance method
            new_user.set_password(password)

            # Save to database first to get user_id
            db.session.add(new_user)
            db.session.flush()  # This assigns the user_id without committing
            
            # Handle interests if provided
            if interests and isinstance(interests, list):
                # Import Interest model
                from app.entity.interest import Interest
                
                # Process each interest
                for interest_title in interests:
                    if interest_title and interest_title.strip():
                        # Find the interest by title
                        interest = Interest.query.filter_by(title=interest_title.strip()).first()
                        if interest:
                            # Add the interest to the user's interests
                            new_user.interests.append(interest)
                        else:
                            print(f"Warning: Interest '{interest_title}' not found in database")
            
            # Commit all changes
            db.session.commit()

            return True, 201, "User created successfully", new_user

        except Exception as e:
            db.session.rollback()
            print(f"Error creating user: {e}")
            return False, 500, f"Error creating user: {str(e)}", None
        
    @classmethod
    def upgradeUserType(cls, user_id: int, target_user_type: str) -> Tuple[bool, int, str, Optional['User']]:
        """
        Upgrade user type with business rules:
        - Free users can be upgraded to Premium or Expert
        - Premium users can only be upgraded to Expert
        - Expert users cannot be upgraded further
        """
        try:
            # Get the user
            user = cls.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None
            
            # Get current user type
            current_user_type = user.user_type
            if not current_user_type:
                return False, 404, "Current user type not found", None
            
            # Get target user type from database
            target_type_obj = UserType.queryUserTypeByName(target_user_type)
            if not target_type_obj:
                return False, 404, f"Target user type '{target_user_type}' not found", None
            
            # Check upgrade rules
            current_type_name = current_user_type.name
            
            if current_type_name == 'Expert':
                return False, 400, "Expert users cannot be upgraded further", None
            
            elif current_type_name == 'Free':
                # Free users can upgrade to Premium or Expert
                if target_user_type not in ['Premium', 'Expert']:
                    return False, 400, "Free users can only be upgraded to Premium or Expert", None
            
            elif current_type_name == 'Premium':
                # Premium users can only upgrade to Expert
                if target_user_type != 'Expert':
                    return False, 400, "Premium users can only be upgraded to Expert", None
            
            else:
                return False, 400, f"Unknown current user type: {current_type_name}", None
            
            # Check if user is already at target type
            if current_type_name == target_user_type:
                return False, 400, f"User is already a {target_user_type} user", None
            
            # Perform the upgrade
            user.user_type_id = target_type_obj.user_type_id
            db.session.commit()
            
            return True, 200, f"User successfully upgraded from {current_type_name} to {target_user_type}", user
            
        except Exception as e:
            db.session.rollback()
            print(f"Error upgrading user: {e}")
            return False, 500, f"An error occurred while upgrading user: {str(e)}", None
        

    @classmethod
    def updateUserAccount(cls, current_user, data: dict) -> Tuple[bool, int, str, Optional['User']]:
        """Update user account details"""
        try:
            from app.entity.interest import Interest
            from datetime import datetime
            import re

            # Load update fields from data
            email = data.get("email")
            password = data.get("password")
            first_name = data.get("first_name")
            last_name = data.get("last_name")
            date_of_birth = data.get("date_of_birth")
            contact_number = data.get("contact_number")
            gender = data.get("gender")
            region = data.get("region")
            status = data.get("status")
            interests = data.get("interests")

            # Get the current user object
            user = cls.query.get(current_user.user_id)
            if not user:
                return False, 404, "User not found", None

            # Validate email format
            if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                return False, 400, "Invalid email format", None

            # Update fields
            if email is not None:
                user.email = email.strip()
            if first_name is not None:
                user.first_name = first_name.strip()
            if last_name is not None:
                user.last_name = last_name.strip()
            if date_of_birth is not None:
                try:
                    user.date_of_birth = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
                except ValueError:
                    return False, 400, "Invalid date format. Use YYYY-MM-DD", None
            if contact_number is not None:
                user.contact_number = contact_number
            if gender is not None:
                user.gender = gender
            if region is not None:
                user.region = region
            if password is not None and password.strip():
                user.set_password(password)

            # ✅ Admin-only: Update status field
            if status is not None and getattr(current_user, "status", None) == "Admin":
                valid_statuses = ['Active', 'Inactive', 'Suspended']
                if status not in valid_statuses:
                    return False, 400, f"Invalid status. Must be one of: {', '.join(valid_statuses)}", None
                user.status = status

           # 🔄 Update interests
            if interests is not None:
                from app.entity.interest import Interest
                user.interests = []  # ✅ Correctly clear the existing relationships
                for interest_title in interests:
                    interest = Interest.query.filter_by(title=interest_title.strip()).first()
                    if interest:
                        user.interests.append(interest)
                    else:
                        print(f"⚠️ Interest '{interest_title}' not found, skipping.")

            db.session.commit()
            return True, 200, "User account updated successfully", user

        except Exception as e:
            db.session.rollback()
            print(f"Error updating user account: {e}")
            return False, 500, f"An error occurred while updating user: {str(e)}", None

        
    @classmethod
    def suspendUserAccount(cls, user_id: int) -> Tuple[bool, int, str, Optional['User']]:
        """
        Suspend a user account by changing status from 'Active' to 'Suspended'
        Suspended users cannot sign in to the system
        Also invalidates all active tokens for the user
        """
        try:
            # Get the user by ID
            user = cls.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None
            
            # Check if user is already suspended
            if user.status == 'Suspended':
                return False, 400, "User is already suspended", None
            
            # Update user status to Suspended
            user.status = 'Suspended'
            
            # IMPORTANT: Invalidate all active tokens for this user
            from app.entity.token import Token
            active_tokens = Token.query.filter_by(
                user_id=user_id,
                is_active=True
            ).all()
            
            for token in active_tokens:
                token.is_active = False
            
            # Commit the changes to database
            db.session.commit()
            
            # Log the suspension for debugging
            print(f"✅ User {user.first_name} {user.last_name} (ID: {user_id}) suspended")
            print(f"📝 Deactivated {len(active_tokens)} tokens")
            
            return True, 200, f"User {user.first_name} {user.last_name} has been suspended successfully", user
            
        except Exception as e:
            db.session.rollback()
            print(f"Error suspending user account: {e}")
            return False, 500, f"An error occurred while suspending user: {str(e)}", None