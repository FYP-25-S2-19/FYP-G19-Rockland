from app.models import db
from datetime import datetime

class Faq(db.Model):
    __tablename__ = 'faq'

    faq_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question = db.Column(db.Text, nullable=False)  # Question submitted by user
    answer = db.Column(db.Text, nullable=True)     # Answer provided by admin (can be null initially)
    
    # Status of the FAQ
    # 'pending' - question submitted, waiting for admin answer
    # 'answered' - admin has provided an answer
    # 'published' - answer is published and visible to all users
    # 'rejected' - admin rejected the question (won't be answered)
    status = db.Column(db.String(20), nullable=False, default='pending')
    
    # User who submitted the question
    submitted_by_user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    
    # Admin who answered the question (nullable until answered)
    answered_by_admin_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=True)
    
    # Timestamps
    submitted_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    answered_at = db.Column(db.DateTime, nullable=True)
    published_at = db.Column(db.DateTime, nullable=True)
    
    # Optional: Admin notes (internal notes, not visible to users)
    admin_notes = db.Column(db.Text, nullable=True)
    
    # Relationships
    submitted_by = db.relationship('User', foreign_keys=[submitted_by_user_id], backref='submitted_faqs', lazy=True)
    answered_by = db.relationship('User', foreign_keys=[answered_by_admin_id], backref='answered_faqs', lazy=True)
    
    def __repr__(self):
        return f'<Faq {self.faq_id}: {self.question[:50]}... - Status: {self.status}>'
    
    def get_user_display_name(self, user):
        """Helper method to get user display name based on available fields"""
        if not user:
            return None
        
        # Try different possible field combinations in your User model
        try:
            if hasattr(user, 'username') and user.username:
                return user.username
            elif hasattr(user, 'first_name') and hasattr(user, 'last_name'):
                full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
                return full_name if full_name else None
            elif hasattr(user, 'email') and user.email:
                return user.email.split('@')[0]  # Use part before @ as display name
            elif hasattr(user, 'name') and user.name:
                return user.name
            else:
                return f"User {user.user_id}"
        except Exception as e:
            print(f"Error getting user display name: {str(e)}")
            return f"User {user.user_id if hasattr(user, 'user_id') else 'Unknown'}"
    
    def to_dict(self):
        """Convert FAQ to dictionary for JSON serialization"""
        return {
            'faq_id': self.faq_id,
            'question': self.question,
            'answer': self.answer,
            'status': self.status,
            'submitted_by_user_id': self.submitted_by_user_id,
            'answered_by_admin_id': self.answered_by_admin_id,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'answered_at': self.answered_at.isoformat() if self.answered_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'admin_notes': self.admin_notes,
            # Fixed: Use helper method to get user display names safely
            'submitted_by_username': self.get_user_display_name(self.submitted_by),
            'answered_by_username': self.get_user_display_name(self.answered_by)
        }
    
    def to_public_dict(self):
        """Convert FAQ to dictionary for public display (only published FAQs)"""
        if self.status != 'published':
            return None
        
        return {
            'faq_id': self.faq_id,
            'question': self.question,
            'answer': self.answer,
            'published_at': self.published_at.isoformat() if self.published_at else None
        }
    
    @classmethod
    def getAllFaqs(cls, status=None):
        """Get all FAQs, optionally filtered by status"""
        try:
            if status:
                return cls.query.filter_by(status=status).order_by(cls.submitted_at.desc()).all()
            return cls.query.order_by(cls.submitted_at.desc()).all()
        except Exception as e:
            print(f"Error fetching all FAQs: {str(e)}")
            return None
    
    @classmethod
    def getPublishedFaqs(cls):
        """Get only published FAQs for public display"""
        try:
            return cls.query.filter_by(status='published').order_by(cls.published_at.desc()).all()
        except Exception as e:
            print(f"Error fetching published FAQs: {str(e)}")
            return None
    
    @classmethod
    def getPendingFaqs(cls):
        """Get FAQs pending admin response"""
        try:
            return cls.query.filter_by(status='pending').order_by(cls.submitted_at.asc()).all()
        except Exception as e:
            print(f"Error fetching pending FAQs: {str(e)}")
            return None
    
    @classmethod
    def getUserFaqs(cls, user_id, status=None):
        """Get FAQs submitted by a specific user"""
        try:
            query = cls.query.filter_by(submitted_by_user_id=user_id)
            if status:
                query = query.filter_by(status=status)
            return query.order_by(cls.submitted_at.desc()).all()
        except Exception as e:
            print(f"Error fetching user FAQs: {str(e)}")
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
    def submitQuestion(cls, question, user_id):
        """User submits a new question"""
        try:
            new_faq = cls(
                question=question,
                submitted_by_user_id=user_id,
                status='pending'
            )
            db.session.add(new_faq)
            db.session.commit()
            return True, 201, "Question submitted successfully", new_faq
        except Exception as e:
            db.session.rollback()
            print(f"Error submitting question: {str(e)}")
            return False, 500, f"Error submitting question: {str(e)}", None
    
    def answerQuestion(self, answer, admin_id, admin_notes=None):
        """Admin answers a pending question"""
        try:
            if self.status != 'pending':
                return False, 400, "Only pending questions can be answered"
            
            self.answer = answer
            self.answered_by_admin_id = admin_id
            self.answered_at = datetime.utcnow()
            self.status = 'answered'
            if admin_notes:
                self.admin_notes = admin_notes
            
            db.session.commit()
            return True, 200, "Question answered successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error answering question: {str(e)}")
            return False, 500, f"Error answering question: {str(e)}"
    
    def publishAnswer(self, admin_id):
        """Admin publishes an answered question to make it visible to all users"""
        try:
            if self.status != 'answered':
                return False, 400, "Only answered questions can be published"
            
            self.status = 'published'
            self.published_at = datetime.utcnow()
            
            db.session.commit()
            return True, 200, "FAQ published successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error publishing FAQ: {str(e)}")
            return False, 500, f"Error publishing FAQ: {str(e)}"
    
    def rejectQuestion(self, admin_id, admin_notes=None):
        """Admin rejects a question (won't be answered)"""
        try:
            if self.status != 'pending':
                return False, 400, "Only pending questions can be rejected"
            
            self.answered_by_admin_id = admin_id
            self.answered_at = datetime.utcnow()
            self.status = 'rejected'
            if admin_notes:
                self.admin_notes = admin_notes
            
            db.session.commit()
            return True, 200, "Question rejected"
        except Exception as e:
            db.session.rollback()
            print(f"Error rejecting question: {str(e)}")
            return False, 500, f"Error rejecting question: {str(e)}"
    
    def updateAnswer(self, answer=None, admin_notes=None):
        """Admin updates the answer to a question"""
        try:
            if self.status not in ['answered', 'published']:
                return False, 400, "Only answered or published questions can have their answers updated"
            
            if answer:
                self.answer = answer
                self.answered_at = datetime.utcnow()  # Update the answered timestamp
            
            if admin_notes is not None:  # Allow empty string to clear notes
                self.admin_notes = admin_notes
            
            db.session.commit()
            return True, 200, "Answer updated successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error updating answer: {str(e)}")
            return False, 500, f"Error updating answer: {str(e)}"
    
    def unpublishFaq(self):
        """Unpublish a FAQ (move from published back to answered)"""
        try:
            if self.status != 'published':
                return False, 400, "Only published FAQs can be unpublished"
            
            self.status = 'answered'
            self.published_at = None
            
            db.session.commit()
            return True, 200, "FAQ unpublished successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error unpublishing FAQ: {str(e)}")
            return False, 500, f"Error unpublishing FAQ: {str(e)}"
    
    def deleteFaq(self):
        """Delete this FAQ (admin only, for any status)"""
        try:
            db.session.delete(self)
            db.session.commit()
            return True, 200, "FAQ deleted successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting FAQ: {str(e)}")
            return False, 500, f"Error deleting FAQ: {str(e)}"