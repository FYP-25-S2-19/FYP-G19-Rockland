# Libraries
from datetime import datetime

# Local dependencies
from app.models import db

class Article(db.Model):
    __tablename__ = 'article'
    
    article_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    photo = db.Column(db.String(500))  # Store photo URL/path
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    is_free = db.Column(db.Boolean, nullable=False, default=True)
    
    # Foreign keys
    categories_id = db.Column(db.Integer, db.ForeignKey('categories.categories_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    
    # Relationships
    category = db.relationship('Categories', backref='articles')
    author = db.relationship('User', backref='authored_articles')
    
    # Relationship with ArticleLike (one-to-many)
    likes = db.relationship('ArticleLike', backref='article', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self) -> dict:
        """Return a dictionary representation of the article."""
        return {
            'article_id': self.article_id,
            'title': self.title,
            'content': self.content,
            'photo': self.photo,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'is_free': self.is_free,
            'categories_id': self.categories_id,
            'category_title': self.category.title if self.category else None,
            'user_id': self.user_id,
            'author_name': f"{self.author.first_name} {self.author.last_name}" if self.author else None,
            'author_email': self.author.email if self.author else None,
            'total_likes': self.likes.count() if self.likes else 0
        }

    @classmethod
    def createArticle(cls, title: str, content: str, categories_id: int, user_id: int, 
                     photo: str = None, is_free: bool = True):
        """Create a new article"""
        try:
            # Validate required fields
            if not title or not title.strip():
                return False, 400, "Article title is required", None
            
            if not content or not content.strip():
                return False, 400, "Article content is required", None
            
            if not categories_id:
                return False, 400, "Category ID is required", None
            
            if not user_id:
                return False, 400, "User ID is required", None
            
            # Validate title and content length
            if len(title.strip()) < 5:
                return False, 400, "Title must be at least 5 characters long", None
            
            if len(content.strip()) < 50:
                return False, 400, "Content must be at least 50 characters long", None
            
            # Check if user exists and is Expert
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None
            
            if not user.user_type or user.user_type.name != 'Expert':
                return False, 403, "Only Expert users can create articles", None
            
            if user.status != 'Active':
                return False, 403, "User account is not active", None
            
            # Check if category exists
            from app.entity.categories import Categories
            category = Categories.query.get(categories_id)
            if not category:
                return False, 404, f"Category with ID {categories_id} not found", None
            
            # Create new article
            new_article = cls(
                title=title.strip(),
                content=content.strip(),
                photo=photo,
                categories_id=categories_id,
                user_id=user_id,
                is_free=is_free,
                date_created=datetime.utcnow()
            )
            
            # Save to database
            db.session.add(new_article)
            db.session.commit()
            
            return True, 201, "Article created successfully", new_article
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating article: {e}")
            return False, 500, f"Error creating article: {str(e)}", None

    @classmethod
    def deleteArticle(cls, article_id: int, user_id: int):
        """Delete an article - only by admin"""
        try:
            # Get the article
            article = cls.query.get(article_id)
            if not article:
                return False, 404, "Article not found", None
            
            # Get the user trying to delete
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None
            
            # Check permissions: only admin can delete
            is_admin = user.user_type and user.user_type.name == 'Admin'
            
            if not is_admin:
                return False, 403, "Only administrators can delete articles", None
            
            # Store article info for response
            article_title = article.title
            article_data = article.to_dict()
            
            # Delete associated photo file if exists
            if article.photo:
                try:
                    import os
                    # Remove leading slash and construct full path
                    photo_path = article.photo.lstrip('/')
                    full_photo_path = os.path.join('static', photo_path)
                    if os.path.exists(full_photo_path):
                        os.remove(full_photo_path)
                        print(f"Deleted photo file: {full_photo_path}")
                except Exception as e:
                    print(f"Warning: Could not delete photo file: {e}")
                    # Continue with article deletion even if photo deletion fails
            
            # Delete the article (CASCADE will handle ArticleLike deletions)
            db.session.delete(article)
            db.session.commit()
            
            return True, 200, f"Article '{article_title}' deleted successfully", article_data
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting article: {e}")
            return False, 500, f"Error deleting article: {str(e)}", None

    @classmethod
    def getAllArticlesForAdmin(cls):
        """Get all articles for admin view"""
        try:
            articles = cls.query.order_by(cls.date_created.desc()).all()
            articles_data = [article.to_dict() for article in articles]
            return articles_data, 200
        except Exception as e:
            print(f"Error fetching all articles for admin: {e}")
            return None, 500

    @classmethod
    def getArticleById(cls, article_id: int):
        """Get a specific article by ID for detailed view"""
        try:
            article = cls.query.get(article_id)
            if not article:
                return None, 404, "Article not found"
            return article.to_dict(), 200, "Article found"
        except Exception as e:
            print(f"Error fetching article by ID: {e}")
            return None, 500, f"Error fetching article: {str(e)}"

    @classmethod
    def getArticlesForUser(cls, user_id: int):
        """Get articles based on user type with restrictions"""
        try:
            # Get the user
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return None, 404, "User not found"
            
            if user.status != 'Active':
                return None, 403, "User account is not active"
            
            user_type_name = user.user_type.name if user.user_type else None
            
            # Admin can see all articles
            if user_type_name == 'Admin':
                articles = cls.query.order_by(cls.date_created.desc()).all()
                articles_data = [article.to_dict() for article in articles]
                return articles_data, 200, "All articles for admin"
            
            # Expert and Premium can see all articles (free + premium)
            elif user_type_name in ['Expert', 'Premium']:
                articles = cls.query.order_by(cls.date_created.desc()).all()
                articles_data = [article.to_dict() for article in articles]
                return articles_data, 200, f"All articles (free + premium) for {user_type_name} user"
            
            # Free users can only view free articles (unlimited)
            elif user_type_name == 'Free':
                articles = cls.query.filter_by(is_free=True).order_by(cls.date_created.desc()).all()
                articles_data = [article.to_dict() for article in articles]
                return articles_data, 200, "Free articles only for free user"
            
            else:
                return None, 403, "Invalid user type"
                
        except Exception as e:
            print(f"Error fetching articles for user: {e}")
            return None, 500, f"Error fetching articles: {str(e)}"

    @classmethod
    def searchArticles(cls, user_id: int, search_term: str = None, category_id: int = None):
        """Search articles by title or category based on user type restrictions"""
        try:
            # Get the user
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return None, 404, "User not found"
            
            if user.status != 'Active':
                return None, 403, "User account is not active"
            
            user_type_name = user.user_type.name if user.user_type else None
            
            # Only Free and Premium users can search (based on requirements)
            if user_type_name not in ['Free', 'Premium']:
                return None, 403, "Only Free and Premium users can search articles"
            
            # Build base query based on user type
            if user_type_name == 'Free':
                # Free users can only search free articles
                base_query = cls.query.filter_by(is_free=True)
            elif user_type_name == 'Premium':
                # Premium users can search all articles
                base_query = cls.query
            
            # Apply search filters
            if search_term and search_term.strip():
                # Search by title (case-insensitive)
                search_term_clean = search_term.strip()
                base_query = base_query.filter(cls.title.ilike(f'%{search_term_clean}%'))
            
            if category_id:
                # Search by category
                base_query = base_query.filter_by(categories_id=category_id)
            
            # If no search criteria provided
            if not search_term and not category_id:
                return None, 400, "Please provide search term or category"
            
            # Execute query
            articles = base_query.order_by(cls.date_created.desc()).all()
            articles_data = [article.to_dict() for article in articles]
            
            # Build response message
            search_info = []
            if search_term:
                search_info.append(f"title containing '{search_term}'")
            if category_id:
                search_info.append(f"category ID {category_id}")
            
            search_description = " and ".join(search_info)
            message = f"Search results for {search_description} ({user_type_name} user access)"
            
            return articles_data, 200, message
            
        except Exception as e:
            print(f"Error searching articles: {e}")
            return None, 500, f"Error searching articles: {str(e)}"