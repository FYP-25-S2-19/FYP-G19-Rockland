from app.models import db
from datetime import datetime
from sqlalchemy.orm import joinedload

class Testimonials(db.Model):
    __tablename__ = 'testimonials'
    
    testimonials_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    rating = db.Column(db.Integer, nullable=False)  # Rating out of 5 stars (1-5)
    testimony = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)  # User ID who posted it
    
    # NEW FIELD: Whether testimonial is displayed on landing page
    is_selected = db.Column(db.Boolean, default=False, nullable=False)
    
    # Relationship to User model
    user = db.relationship('User', backref='testimonials')
    
    def __repr__(self):
        return f'<Testimonials by User {self.user_id} - {self.rating} stars>'
    
    def get_user_display_name(self):
        """Helper method to get user display name from user relationship"""
        if not self.user:
            print(f"⚠️ No user relationship found for testimonial {self.testimonials_id}, user_id: {self.user_id}")
            return f"User {self.user_id}"
        
        try:
            # Debug: Print user object details
            print(f"🔍 User object for testimonial {self.testimonials_id}: {self.user}")
            print(f"🔍 User attributes: {dir(self.user)}")
            
            # Check for first_name and last_name (based on your User model)
            if hasattr(self.user, 'first_name') and self.user.first_name:
                if hasattr(self.user, 'last_name') and self.user.last_name:
                    full_name = f"{self.user.first_name} {self.user.last_name}".strip()
                    print(f"✅ Found full name: {full_name}")
                    return full_name
                else:
                    print(f"✅ Found first name only: {self.user.first_name}")
                    return self.user.first_name
            elif hasattr(self.user, 'email') and self.user.email:
                email_name = self.user.email.split('@')[0]
                print(f"✅ Using email name: {email_name}")
                return email_name
            else:
                print(f"⚠️ No suitable name field found for user {self.user_id}")
                return f"User {self.user_id}"
        except Exception as e:
            print(f"❌ Error getting user display name: {str(e)}")
            return f"User {self.user_id}"
    
    def to_dict(self):
        user_name = self.get_user_display_name()
        print(f"📋 Testimonial {self.testimonials_id} to_dict - user_name: {user_name}")
        
        return {
            'testimonials_id': self.testimonials_id,
            'name': user_name,  # Add both for compatibility
            'user_name': user_name,  # Keep this too
            'rating': self.rating,
            'testimony': self.testimony,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'user_id': self.user_id,
            'is_selected': self.is_selected,  # NEW FIELD
        }
    
    # NEW METHOD: Toggle selection status
    def toggleSelection(self):
        """Toggle the selection status of this testimonial"""
        try:
            self.is_selected = not self.is_selected
            db.session.commit()
            
            status_text = "selected for display" if self.is_selected else "hidden from display"
            return True, 200, f"Testimonial {status_text} on landing page"
            
        except Exception as e:
            db.session.rollback()
            print(f"Error toggling testimonial selection: {str(e)}")
            return False, 500, f"Error: {str(e)}"
    
    # NEW METHOD: Set selection status
    def setSelection(self, is_selected):
        """Set the selection status of this testimonial"""
        try:
            self.is_selected = bool(is_selected)
            db.session.commit()
            
            status_text = "selected for display" if self.is_selected else "hidden from display"
            return True, 200, f"Testimonial {status_text} on landing page"
            
        except Exception as e:
            db.session.rollback()
            print(f"Error setting testimonial selection: {str(e)}")
            return False, 500, f"Error: {str(e)}"
    
    @classmethod
    def getAllTestimonials(cls):
        """Get all testimonials with user relationship loaded"""
        try:
            # ✅ This is the key fix: use joinedload to eagerly load the user relationship
            testimonials = cls.query.options(joinedload(cls.user)).order_by(cls.date_created.desc()).all()
            
            print(f"📊 Found {len(testimonials)} testimonials")
            
            # Debug: Check if user relationships are loaded
            for testimonial in testimonials:
                print(f"🔍 Testimonial {testimonial.testimonials_id}: user={testimonial.user}, user_id={testimonial.user_id}")
                if testimonial.user:
                    print(f"   👤 User details: first_name={getattr(testimonial.user, 'first_name', 'N/A')}, "
                          f"last_name={getattr(testimonial.user, 'last_name', 'N/A')}, "
                          f"email={getattr(testimonial.user, 'email', 'N/A')}")
            
            return testimonials
        except Exception as e:
            print(f"❌ Error fetching all testimonials: {str(e)}")
            return None
    
    # NEW CLASS METHOD: Get selected testimonials
    @classmethod
    def getSelectedTestimonials(cls):
        """Get all testimonials that are selected for display on landing page"""
        try:
            testimonials = cls.query.options(joinedload(cls.user)).filter_by(is_selected=True).order_by(cls.date_created.desc()).all()
            print(f"📊 Found {len(testimonials)} selected testimonials")
            return testimonials
        except Exception as e:
            print(f"❌ Error fetching selected testimonials: {str(e)}")
            return []
    
    # NEW CLASS METHOD: Toggle testimonial selection by ID
    @classmethod
    def toggleTestimonialSelection(cls, testimonial_id):
        """Class method to toggle testimonial selection by ID"""
        try:
            testimonial = cls.getTestimonialById(testimonial_id)
            
            if not testimonial:
                return False, 404, "Testimonial not found"
            
            return testimonial.toggleSelection()
            
        except Exception as e:
            print(f"Error toggling testimonial selection: {str(e)}")
            return False, 500, f"Error: {str(e)}"
    
    @classmethod
    def getTestimonialById(cls, testimonial_id):
        """Get testimonial by ID with user relationship loaded"""
        try:
            testimonial = cls.query.options(joinedload(cls.user)).get(testimonial_id)
            return testimonial
        except Exception as e:
            print(f"Error fetching testimonial by ID: {str(e)}")
            return None
    
    @classmethod
    def viewTestimonial(cls, testimonial_id):
        try:
            testimonial = cls.query.options(joinedload(cls.user)).get(testimonial_id)
            
            if testimonial:
                return testimonial.to_dict(), 200
            else:
                return None, 404
                
        except Exception as e:
            print(f"Error viewing testimonial: {str(e)}")
            return None, 500
    
    @classmethod
    def createTestimonial(cls, rating, testimony, user_id):
        """Create testimonial - removed name parameter"""
        try:
            # Validate rating
            if rating is None:
                return False, 400, "Rating is required", None
            
            # Convert rating to integer if it's not already
            try:
                rating = int(rating)
            except (ValueError, TypeError):
                return False, 400, "Rating must be a valid number", None
            
            if not (1 <= rating <= 5):
                return False, 400, "Rating must be between 1 and 5 stars", None
            
            # Validate testimony
            if not testimony or not str(testimony).strip():
                return False, 400, "Testimony is required", None
            
            # Validate user_id
            if not user_id:
                return False, 400, "User ID is required", None
            
            new_testimonial = cls(
                rating=rating,
                testimony=str(testimony).strip(),
                user_id=user_id,
                is_selected=False  # Default to not selected
            )
            
            db.session.add(new_testimonial)
            db.session.commit()
            
            return True, 201, "Testimonial created successfully", new_testimonial
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating testimonial: {str(e)}")
            return False, 500, f"Error: {str(e)}", None
    
    def updateTestimonial(self, rating=None, testimony=None):
        """Update testimonial fields - removed name parameter"""
        try:
            # Validate rating if provided
            if rating is not None:
                try:
                    rating = int(rating)
                except (ValueError, TypeError):
                    return False, 400, "Rating must be a valid number"
                
                if not (1 <= rating <= 5):
                    return False, 400, "Rating must be between 1 and 5 stars"
            
            # Validate testimony if provided
            if testimony is not None and not str(testimony).strip():
                return False, 400, "Testimony cannot be empty"
            
            # Update fields if provided
            if rating is not None:
                self.rating = rating
            if testimony is not None:
                self.testimony = str(testimony).strip()
            
            db.session.commit()
            
            return True, 200, "Testimonial updated successfully"
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating testimonial: {str(e)}")
            return False, 500, f"Error: {str(e)}"
    
    def deleteTestimonial(self):
        """Delete this testimonial"""
        try:
            db.session.delete(self)
            db.session.commit()
            
            return True, 200, "Testimonial deleted successfully"
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting testimonial: {str(e)}")
            return False, 500, f"Error: {str(e)}"
    
    @classmethod
    def getTestimonialsByRating(cls, rating):
        """Get testimonials filtered by rating"""
        try:
            if not (1 <= rating <= 5):
                return None
            
            testimonials = cls.query.options(joinedload(cls.user)).filter_by(rating=rating).order_by(cls.date_created.desc()).all()
            return testimonials
        except Exception as e:
            print(f"Error fetching testimonials by rating: {str(e)}")
            return None
    
    @classmethod
    def getTestimonialsByUser(cls, user_id):
        """Get all testimonials by a specific user"""
        try:
            testimonials = cls.query.options(joinedload(cls.user)).filter_by(user_id=user_id).order_by(cls.date_created.desc()).all()
            return testimonials
        except Exception as e:
            print(f"Error fetching testimonials by user: {str(e)}")
            return None
    
    @classmethod
    def getAverageRating(cls):
        """Get the average rating of all testimonials"""
        try:
            result = db.session.query(db.func.avg(cls.rating)).scalar()
            return round(result, 2) if result else 0
        except Exception as e:
            print(f"Error calculating average rating: {str(e)}")
            return None
    
    @classmethod
    def getTestimonialStats(cls):
        """Get testimonial statistics"""
        try:
            total_count = cls.query.count()
            selected_count = cls.query.filter_by(is_selected=True).count()
            average_rating = cls.getAverageRating()
            
            # Count by rating
            rating_counts = {}
            for i in range(1, 6):
                count = cls.query.filter_by(rating=i).count()
                rating_counts[i] = count
            
            return {
                'total_count': total_count,
                'selected_count': selected_count,
                'average_rating': average_rating,
                'rating_distribution': rating_counts
            }
        except Exception as e:
            print(f"Error getting testimonial stats: {str(e)}")
            return None