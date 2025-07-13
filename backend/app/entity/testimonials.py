from app.models import db
from datetime import datetime

class Testimonials(db.Model):
    __tablename__ = 'testimonials'
    
    testimonials_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    testimony = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    
    # Relationship to User model
    user = db.relationship('User', backref='testimonials')
    
    def __repr__(self):
        return f'<Testimonials {self.name}>'
    
    def to_dict(self):
        return {
            'testimonials_id': self.testimonials_id,
            'name': self.name,
            'testimony': self.testimony,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'user_id': self.user_id
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
    def createTestimonial(cls, name, testimony, user_id):
        try:
            new_testimonial = cls(
                name=name,
                testimony=testimony,
                user_id=user_id
            )
            
            db.session.add(new_testimonial)
            db.session.commit()
            
            return True, 201, "Testimonial created successfully", new_testimonial
            
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}", None
    
    @classmethod
    def deleteTestimonial(cls, testimonial_id, user_id=None):
        try:
            testimonial = cls.query.get(testimonial_id)
            
            if not testimonial:
                return False, 404, "Testimonial not found"
            
            db.session.delete(testimonial)
            db.session.commit()
            
            return True, 200, "Testimonial deleted successfully"
            
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Error: {str(e)}"