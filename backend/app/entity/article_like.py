# Libraries
from datetime import datetime

# Local dependencies
from app.models import db

class ArticleLike(db.Model):
    __tablename__ = 'articlelike'
    
    article_like_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey('article.article_id'), nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='article_likes')
    # article relationship is defined in Article class with backref
    
    # Unique constraint to prevent duplicate likes
    __table_args__ = (db.UniqueConstraint('user_id', 'article_id', name='unique_user_article_like'),)

    def to_dict(self) -> dict:
        """Return a dictionary representation of the article like."""
        return {
            'article_like_id': self.article_like_id,
            'user_id': self.user_id,
            'article_id': self.article_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_name': f"{self.user.first_name} {self.user.last_name}" if self.user else None,
            'article_title': self.article.title if self.article else None
        }

    @classmethod
    def likeArticle(cls, user_id: int, article_id: int):
        """Like an article - only Premium and Free users"""
        try:
            # Get the user
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None
            
            if user.status != 'Active':
                return False, 403, "User account is not active", None
            
            user_type_name = user.user_type.name if user.user_type else None
            
            # Only Free and Premium users can like articles
            if user_type_name not in ['Free', 'Premium', 'Expert']:
                return False, 403, "Only Free Premium Expert users can like articles", None
            
            # Check if article exists
            from app.entity.article import Article
            article = Article.query.get(article_id)
            if not article:
                return False, 404, "Article not found", None
            
            # Check if user can access this article based on user type
            if user_type_name == 'Free' and not article.is_free:
                return False, 403, "Free users can only like free articles", None
            
            # Check if user has already liked this article
            existing_like = cls.query.filter_by(user_id=user_id, article_id=article_id).first()
            if existing_like:
                return False, 400, "You have already liked this article", existing_like
            
            # Create new like
            new_like = cls(
                user_id=user_id,
                article_id=article_id,
                created_at=datetime.utcnow()
            )
            
            # Save to database
            db.session.add(new_like)
            db.session.commit()
            
            return True, 201, "Article liked successfully", new_like
            
        except Exception as e:
            db.session.rollback()
            print(f"Error liking article: {e}")
            return False, 500, f"Error liking article: {str(e)}", None

    @classmethod
    def checkUserLike(cls, user_id: int, article_id: int):
        """Check if user has already liked an article"""
        try:
            like = cls.query.filter_by(user_id=user_id, article_id=article_id).first()
            if like:
                return True, 200, "User has liked this article", like
            else:
                return False, 200, "User has not liked this article", None
                
        except Exception as e:
            print(f"Error checking user like: {e}")
            return False, 500, f"Error checking like: {str(e)}", None

    @classmethod
    def getArticleLikes(cls, article_id: int):
        """Get all likes for a specific article"""
        try:
            # Check if article exists
            from app.entity.article import Article
            article = Article.query.get(article_id)
            if not article:
                return None, 404, "Article not found"
            
            likes = cls.query.filter_by(article_id=article_id).order_by(cls.created_at.desc()).all()
            likes_data = [like.to_dict() for like in likes]
            
            return likes_data, 200, f"Likes for article '{article.title}'"
            
        except Exception as e:
            print(f"Error fetching article likes: {e}")
            return None, 500, f"Error fetching likes: {str(e)}"
        
    @classmethod
    def unlikeArticle(cls, user_id: int, article_id: int):
        """Unlike an article if it was previously liked"""
        try:
            like = cls.query.filter_by(user_id=user_id, article_id=article_id).first()
            if like:
                db.session.delete(like)
                db.session.commit()
                return True, 200, "Article unliked successfully"
            else:
                return False, 400, "You have not liked this article yet"
        except Exception as e:
            db.session.rollback()
            print(f"Error unliking article: {e}")
            return False, 500, f"Error unliking article: {str(e)}"