from app.models import db
from datetime import datetime

class Testimonials(db.Model):
    __tablename__ = 'testimonials'
    
    testimonials_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    # Removed name field - will get name from user relationship
    rating = db.Column(db.Integer, nullable=False)  # Rating out of 5 stars (1-5)
    testimony = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)  # User ID who posted it
    
    # Relationship to User model
    user = db.relationship('User', backref='testimonials')
    
    def __repr__(self):
        return f'<Testimonials by User {self.user_id} - {self.rating} stars>'
    
    def get_user_display_name(self):
        """Helper method to get user display name from user relationship"""
        if not self.user:
            return f"User {self.user_id}"
        
        try:
            # Try different possible field combinations in your User model
            if hasattr(self.user, 'username') and self.user.username:
                return self.user.username
            elif hasattr(self.user, 'first_name') and hasattr(self.user, 'last_name'):
                full_name = f"{self.user.first_name or ''} {self.user.last_name or ''}".strip()
                return full_name if full_name else f"User {self.user_id}"
            elif hasattr(self.user, 'email') and self.user.email:
                return self.user.email.split('@')[0]  # Use part before @ as display name
            elif hasattr(self.user, 'name') and self.user.name:
                return self.user.name
            else:
                return f"User {self.user_id}"
        except Exception as e:
            print(f"Error getting user display name: {str(e)}")
            return f"User {self.user_id}"
    
    def to_dict(self):
        return {
            'testimonials_id': self.testimonials_id,
            'rating': self.rating,
            'testimony': self.testimony,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'user_id': self.user_id,
            # Get name from user relationship instead of separate field
            'user_name': self.get_user_display_name()
        }
    
    @classmethod
    def getAllTestimonials(cls):
        try:
            testimonials = cls.query.order_by(cls.date_created.desc()).all()
            return testimonials
        except Exception as e:
            print(f"Error fetching all testimonials: {str(e)}")
            return None
    
    @classmethod
    def getTestimonialById(cls, testimonial_id):
        try:
            testimonial = cls.query.get(testimonial_id)
            return testimonial
        except Exception as e:
            print(f"Error fetching testimonial by ID: {str(e)}")
            return None
    
    @classmethod
    def viewTestimonial(cls, testimonial_id):
        try:
            testimonial = cls.query.get(testimonial_id)
            
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
                user_id=user_id
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
            
            testimonials = cls.query.filter_by(rating=rating).order_by(cls.date_created.desc()).all()
            return testimonials
        except Exception as e:
            print(f"Error fetching testimonials by rating: {str(e)}")
            return None
    
    @classmethod
    def getTestimonialsByUser(cls, user_id):
        """Get all testimonials by a specific user"""
        try:
            testimonials = cls.query.filter_by(user_id=user_id).order_by(cls.date_created.desc()).all()
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
            average_rating = cls.getAverageRating()
            
            # Count by rating
            rating_counts = {}
            for i in range(1, 6):
                count = cls.query.filter_by(rating=i).count()
                rating_counts[i] = count
            
            return {
                'total_count': total_count,
                'average_rating': average_rating,
                'rating_distribution': rating_counts
            }
        except Exception as e:
            print(f"Error getting testimonial stats: {str(e)}")
            return None