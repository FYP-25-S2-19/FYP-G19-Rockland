# app/entity/discussion.py
from datetime import datetime
from app.models import db

class Discussion(db.Model):
    __tablename__ = 'discussion'

    discussion_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User', backref='discussions')
    comments = db.relationship('DiscussionComment', backref='discussion', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.discussion_id,
            'user': self.user.first_name if self.user else 'Unknown',
            'text': self.text,
            'timestamp': self.timestamp.isoformat(),
            'comment_count': len(self.comments)
        }

    @classmethod
    def getAllDiscussionsForAdmin(cls):
        """Get all discussions for admin view"""
        try:
            discussions = cls.query.order_by(cls.timestamp.desc()).all()
            discussions_data = [discussion.to_dict() for discussion in discussions]
            
            print(f"📋 Successfully fetched {len(discussions_data)} discussions for admin")
            return discussions_data, 200
            
        except Exception as e:
            print(f"Error in getAllDiscussionsForAdmin: {e}")
            return None, 500

    @classmethod
    def getDiscussionById(cls, discussion_id):
        """Get discussion by ID with detailed information"""
        try:
            discussion = cls.query.get(discussion_id)
            
            if discussion:
                discussion_data = discussion.to_dict()
                print(f"👁️ Successfully fetched discussion {discussion_id}")
                return discussion_data, 200, "Discussion details fetched successfully"
            else:
                print(f"❌ Discussion {discussion_id} not found")
                return None, 404, "Discussion not found"
                
        except Exception as e:
            print(f"Error in getDiscussionById: {e}")
            return None, 500, f"Error fetching discussion: {str(e)}"

    @classmethod
    def deleteDiscussion(cls, discussion_id, user_id):
        """Delete discussion by ID"""
        try:
            discussion = cls.query.get(discussion_id)
            
            if discussion:
                discussion_data = discussion.to_dict()
                
                # Delete the discussion (this will cascade delete comments due to relationship)
                db.session.delete(discussion)
                db.session.commit()
                
                print(f"✅ Successfully deleted discussion {discussion_id}")
                return True, 200, "Discussion deleted successfully", discussion_data
            else:
                print(f"❌ Discussion {discussion_id} not found")
                return False, 404, "Discussion not found", None
                
        except Exception as e:
            db.session.rollback()
            print(f"Error in deleteDiscussion: {e}")
            return False, 500, f"Error deleting discussion: {str(e)}", None

    @classmethod
    def createDiscussion(cls, user_id, text):
        """Create a new discussion"""
        try:
            # Validation
            if not text or not text.strip():
                return False, 400, "Discussion text is required", None
            
            text = text.strip()
            
            if len(text) < 10:
                return False, 400, "Discussion text must be at least 10 characters long", None
            
            if len(text) > 2000:
                return False, 400, "Discussion text cannot exceed 2000 characters", None
            
            # Create new discussion
            new_discussion = cls(
                user_id=user_id,
                text=text
            )
            
            db.session.add(new_discussion)
            db.session.commit()
            
            discussion_data = new_discussion.to_dict()
            print(f"✅ Successfully created discussion {new_discussion.discussion_id}")
            return True, 201, "Discussion created successfully", discussion_data
            
        except Exception as e:
            db.session.rollback()
            print(f"Error in createDiscussion: {e}")
            return False, 500, f"Error creating discussion: {str(e)}", None