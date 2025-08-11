from app.models import db
from datetime import datetime

class Testimonials(db.Model):
    __tablename__ = 'testimonials'
    
    testimonials_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)  # Name of who posted it
    rating = db.Column(db.Integer, nullable=False)  # Rating out of 5 stars (1-5)
    testimony = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)  # User ID who posted it
    
    # Relationship to User model
    user = db.relationship('User', backref='testimonials')
    
    def __repr__(self):
        return f'<Testimonials {self.name} - {self.rating} stars>'
    
    def to_dict(self):
        return {
            'testimonials_id': self.testimonials_id,
            'name': self.name,
            'rating': self.rating,
            'testimony': self.testimony,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'user_id': self.user_id,
            # Include user information if available
            'user_name': self.user.username if self.user else None
        }
    
    @classmethod
    def getAllTestimonials(cls):
        try:
            testimonials = cls.query.all()
            return testimonials
        except Exception as e:
            return None
    
    @classmethod
    def getTestimonialById(cls, testimonial_id):
        try:
            testimonial = cls.query.get(testimonial_id)
            return testimonial
        except Exception as e:
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
            return None, 500
    
    @classmethod
    def createTestimonial(cls, name, rating, testimony, user_id):
        try:
            # Validate name
            if not name or not str(name).strip():
                return False, 400, "Name is required", None
            
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
                name=str(name).strip(),
                rating=rating,
                testimony=str(testimony).strip(),
                user_id=user_id
            )
            
            db.session.add(new_testimonial)
            db.session.commit()
            
            return True, 201, "Testimonial created successfully", new_testimonial
            
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}", None
    
    @classmethod
    def updateTestimonial(cls, testimonial_id, name=None, rating=None, testimony=None, user_id=None):
        try:
            testimonial = cls.query.get(testimonial_id)
            
            if not testimonial:
                return False, 404, "Testimonial not found"
            
            # Validate rating if provided
            if rating is not None:
                try:
                    rating = int(rating)
                except (ValueError, TypeError):
                    return False, 400, "Rating must be a valid number"
                
                if not (1 <= rating <= 5):
                    return False, 400, "Rating must be between 1 and 5 stars"
            
            # Validate name if provided
            if name is not None and not str(name).strip():
                return False, 400, "Name cannot be empty"
            
            # Validate testimony if provided
            if testimony is not None and not str(testimony).strip():
                return False, 400, "Testimony cannot be empty"
            
            # Update fields if provided
            if name is not None:
                testimonial.name = str(name).strip()
            if rating is not None:
                testimonial.rating = rating
            if testimony is not None:
                testimonial.testimony = str(testimony).strip()
            if user_id is not None:
                testimonial.user_id = user_id
            
            db.session.commit()
            
            return True, 200, "Testimonial updated successfully", testimonial
            
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}", None
    
    @classmethod
    def deleteTestimonial(cls, testimonial_id, user_id=None):
        try:
            testimonial = cls.query.get(testimonial_id)
            
            if not testimonial:
                return False, 404, "Testimonial not found"
            
            # Optional: Check if user_id matches the testimonial's user_id for authorization
            if user_id is not None and testimonial.user_id != user_id:
                return False, 403, "Unauthorized to delete this testimonial"
            
            db.session.delete(testimonial)
            db.session.commit()
            
            return True, 200, "Testimonial deleted successfully"
            
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}"
    
    @classmethod
    def getTestimonialsByRating(cls, rating):
        """Get testimonials filtered by rating"""
        try:
            if not (1 <= rating <= 5):
                return None
            
            testimonials = cls.query.filter_by(rating=rating).all()
            return testimonials
        except Exception as e:
            return None
    
    @classmethod
    def getTestimonialsByUser(cls, user_id):
        """Get all testimonials by a specific user"""
        try:
            testimonials = cls.query.filter_by(user_id=user_id).all()
            return testimonials
        except Exception as e:
            return None
    
    @classmethod
    def getAverageRating(cls):
        """Get the average rating of all testimonials"""
        try:
            result = db.session.query(db.func.avg(cls.rating)).scalar()
            return round(result, 2) if result else 0
        except Exception as e:
            return None