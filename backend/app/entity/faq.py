from app.models import db

class Faq(db.Model):
    __tablename__ = 'faq'

    faq_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question = db.Column(db.Text, nullable=False)  # Changed to Text for longer questions
    answer = db.Column(db.Text, nullable=False)    # Changed to Text for longer answers
    
    # Foreign key to User (who created/manages the FAQ)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False, default=1)
    
    # Relationship to User
    user = db.relationship('User', backref='faqs', lazy=True)
    
    def __repr__(self):
        return f'<Faq {self.faq_id}: {self.question[:50]}...>'
    
    def to_dict(self):
        """Convert FAQ to dictionary for JSON serialization"""
        return {
            'faq_id': self.faq_id,
            'question': self.question,
            'answer': self.answer,
            'user_id': self.user_id
        }
    
    @classmethod
    def getAllFaqs(cls):
        """Get all FAQs"""
        try:
            return cls.query.all()
        except Exception as e:
            print(f"Error fetching all FAQs: {str(e)}")
            return None
    
    @classmethod
    def getFaqById(cls, faq_id):
        """Get FAQ by ID"""
        try:
            return cls.query.get(faq_id)
        except Exception as e:
            print(f"Error fetching FAQ by ID: {str(e)}")
            return None
    
    @classmethod
    def createFaq(cls, question, answer, user_id=1):
        """Create a new FAQ"""
        try:
            new_faq = cls(
                question=question,
                answer=answer,
                user_id=user_id
            )
            db.session.add(new_faq)
            db.session.commit()
            return True, 201, "FAQ created successfully", new_faq
        except Exception as e:
            db.session.rollback()
            print(f"Error creating FAQ: {str(e)}")
            return False, 500, f"Error creating FAQ: {str(e)}", None
    
    def updateFaq(self, question=None, answer=None):
        """Update FAQ fields"""
        try:
            if question:
                self.question = question
            if answer:
                self.answer = answer
            
            db.session.commit()
            return True, 200, "FAQ updated successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error updating FAQ: {str(e)}")
            return False, 500, f"Error updating FAQ: {str(e)}"
    
    def deleteFaq(self):
        """Delete this FAQ"""
        try:
            db.session.delete(self)
            db.session.commit()
            return True, 200, "FAQ deleted successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting FAQ: {str(e)}")
            return False, 500, f"Error deleting FAQ: {str(e)}"