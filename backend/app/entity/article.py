# Libraries
from datetime import datetime
import os
import humanize
from werkzeug.utils import secure_filename
from io import BytesIO
from sqlalchemy import func
# Local dependencies
from app.models import db
from app.utils.gcs import generate_signed_url, upload_file_to_gcs, delete_file_from_gcs
from app.entity.article_like import ArticleLike

class Article(db.Model):
    __tablename__ = 'article'
    
    article_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    photo = db.Column(db.String(500))      # Store cloud storage path only
    photo_url = db.Column(db.Text)  # Store public GCS URL
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

    # Configuration
    ALLOWED_PHOTO_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
    MAX_PHOTO_SIZE = 10 * 1024 * 1024  # 10MB limit for photos

    def to_dict(self, current_user_id=None) -> dict:
        """Return a dictionary representation of the article."""
        # Generate signed URL for photo if it exists
        signed_photo_url = None
        if self.photo:
            try:
                signed_photo_url = generate_signed_url(self.photo, expiration_minutes=60)
            except Exception as e:
                print(f"⚠️ Failed to generate signed URL for {self.photo}: {e}")

        liked = False
        if current_user_id:
            liked = ArticleLike.query.filter_by(user_id=current_user_id, article_id=self.article_id).first() is not None
        
        return {
            'article_id': self.article_id,
            'title': self.title,
            'content': self.content,
            'photo': self.photo,          # Internal cloud storage path
            'photo_url': self.photo_url,  # Stored public URL (for backward compatibility)
            'signed_photo_url': signed_photo_url,  # Fresh signed URL
            "date_created": self.date_created.isoformat() if self.date_created else None,
            'is_free': self.is_free,
            'categories_id': self.categories_id,
            'category_title': self.category.title if self.category else None,
            'user_id': self.user_id,
            'author_name': f"{self.author.first_name} {self.author.last_name}" if self.author else None,
            'author_email': self.author.email if self.author else None,
            'author_profile_picture': generate_signed_url(self.author.profile_picture) if self.author and self.author.profile_picture else None,
            'total_likes': self.likes.count() if self.likes else 0,
            'liked_by_user': liked
        }
    
    def to_preview_dict(self, current_user_id=None):
        signed_url = None
        if self.photo:
            try:
                signed_url = generate_signed_url(self.photo, expiration_minutes=60)
            except Exception as e:
                print(f"⚠️ Failed to generate signed URL for preview: {e}")

        liked = False
        if current_user_id:
            liked = ArticleLike.query.filter_by(user_id=current_user_id, article_id=self.article_id).first() is not None

    
        
        return {
            "article_id": self.article_id,
            "title": self.title,
            "content": self.content.replace("\n", " ")[:100] if self.content else "",
            "category_title": self.category.title if self.category else "",
            "author_name": f"{self.author.first_name} {self.author.last_name}" if self.author else "Unknown",
            'author_profile_picture': generate_signed_url(self.author.profile_picture) if self.author and self.author.profile_picture else None,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "is_free": self.is_free,
            "photo_url": self.photo_url,
            "signed_photo_url": signed_url,  # ✅ Correct variable
            "total_likes": self.likes.count() if self.likes else 0,
            "liked_by_user": liked  # ✅ add this
        }

    @classmethod
    def allowed_photo_file(cls, filename):
        """Check if photo file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in cls.ALLOWED_PHOTO_EXTENSIONS

    @classmethod
    def _upload_photo_to_cloud(cls, photo_file, filename):
        """Upload photo to Google Cloud Storage using friend's gsc utilities"""
        try:
            # Validate file type
            if not cls.allowed_photo_file(filename):
                print(f"❌ Invalid file type: {filename}")
                return None, None
            
            # Check file size
            if hasattr(photo_file, 'seek'):
                photo_file.seek(0, os.SEEK_END)
                file_size = photo_file.tell()
                photo_file.seek(0)
                
                if file_size > cls.MAX_PHOTO_SIZE:
                    print(f"❌ Photo too large: {file_size} bytes (max: {cls.MAX_PHOTO_SIZE})")
                    return None, None
            
            # Upload using friend's GCS utilities
            blob_path = upload_file_to_gcs(
                file_stream=photo_file,
                filename=filename,
                folder="articles",
                custom_filename=None,  # Let it generate UUID-based name
                overwrite=True
            )
            
            if blob_path:
                # Generate signed URL for the uploaded file
                signed_url = generate_signed_url(blob_path, expiration_minutes=60)
                print(f"✅ Photo uploaded to cloud: {blob_path}")
                print(f"✅ Generated signed URL: {signed_url}")
                return blob_path, signed_url
            else:
                print(f"❌ Failed to upload photo: {filename}")
                return None, None
                
        except Exception as e:
            print(f"❌ Error uploading photo: {e}")
            return None, None

    @classmethod
    def createArticle(cls, title: str, content: str, categories_id: int, user_id: int, 
                     photo: str = None, photo_file=None, is_free: bool = True):
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
            
            # Handle photo upload if photo_file is provided
            photo_path = None
            photo_url = None
            
            if photo_file and photo_file.filename:
                filename = secure_filename(photo_file.filename)
                if filename:
                    photo_path, photo_url = cls._upload_photo_to_cloud(photo_file, filename)
                    if not photo_path:
                        return False, 500, "Failed to upload photo", None
            
            # Create new article
            new_article = cls(
                title=title.strip(),
                content=content.strip(),
                photo=photo_path,     # Cloud storage path
                photo_url=photo_url,  # Public URL
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
            
            # Check permissions: only admin can deletege
            is_admin = user.user_type and user.user_type.name == 'Admin'
            
            if not is_admin:
                return False, 403, "Only administrators can delete articles", None
            
            # Store article info for response
            article_title = article.title
            article_data = article.to_dict()
            
            # Delete photo from cloud storage if exists
            if article.photo:
                success = delete_file_from_gcs(article.photo)
                if success:
                    print(f"✅ Deleted photo from cloud storage: {article.photo}")
                else:
                    print(f"⚠️ Could not delete photo from cloud storage: {article.photo}")
            
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
    def getArticlesByAuthor(cls, author_id: int, limit: int = 6):
        try:
            articles = (
                cls.query.filter_by(user_id=author_id)
                .order_by(cls.date_created.desc())
                .limit(limit)
                .all()
            )
            articles_data = [article.to_dict() for article in articles]
            return articles_data, 200, f"Top {limit} articles by author"
        except Exception as e:
            print(f"Error fetching articles by author: {e}")
            return None, 500, f"Error: {str(e)}"
        
    @classmethod
    def getAllArticlesByAuthor(cls, author_id: int):
        try:
            articles = (
                cls.query.filter_by(user_id=author_id)
                .order_by(cls.date_created.desc())
                .all()
            )
            articles_data = [article.to_dict() for article in articles]
            return articles_data, 200, f"All articles by author {author_id}"
        except Exception as e:
            print(f"❌ Error fetching all articles by author: {e}")
            return None, 500, f"Error: {str(e)}"

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
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return None, 404, "User not found"

            if user.status != 'Active':
                return None, 403, "User account is not active"

            user_type_name = user.user_type.name if user.user_type else None

            # Admin can view all articles
            if user_type_name == 'Admin':
                articles = cls.query.order_by(cls.date_created.desc()).all()
                articles_data = [article.to_dict() for article in articles]
                return articles_data, 200, "All articles for admin"

            # Expert can also view all articles, but doesn't need like info
            elif user_type_name == 'Expert':
                articles = cls.query.order_by(cls.date_created.desc()).all()
                articles_data = [article.to_dict() for article in articles]
                return articles_data, 200, "All articles for expert"

            # Premium can view all articles (free + premium) with like info
            elif user_type_name == 'Premium':
                articles = cls.query.order_by(cls.date_created.desc()).all()
                articles_data = [article.to_dict(user.user_id) for article in articles]
                return articles_data, 200, "All articles for premium user"

            # Free users can only see free articles
            elif user_type_name == 'Free':
                articles = cls.query.filter_by(is_free=True).order_by(cls.date_created.desc()).all()
                articles_data = [article.to_dict(user.user_id) for article in articles]
                return articles_data, 200, "Free articles only for free user"

            return None, 403, "Invalid user type"

        except Exception as e:
            print(f"Error fetching articles for user: {e}")
            return None, 500, f"Error fetching articles: {str(e)}"

    @classmethod
    def searchArticles(cls, user_id: int, search_term: str = None, category_ids: list = None, sort_by: str = "newest"):
        try:
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return None, 404, "User not found"

            if user.status != 'Active':
                return None, 403, "User account is not active"

            user_type = user.user_type.name if user.user_type else None

            if user_type not in ['Free', 'Premium', 'Expert', 'Admin']:
                return None, 403, "Invalid user type"

            # Build base query
            query = cls.query

            if search_term:
                query = query.filter(cls.title.ilike(f'%{search_term.strip()}%'))

            if category_ids and isinstance(category_ids, list) and category_ids:
                query = query.filter(cls.categories_id.in_(category_ids))

            # Sorting
            if sort_by == "oldest":
                query = query.order_by(cls.date_created.asc())
            elif sort_by == "most_liked":
                query = query.outerjoin(ArticleLike).group_by(cls.article_id).order_by(func.count(ArticleLike.article_like_id).desc())
            else:  # default to newest
                query = query.order_by(cls.date_created.desc())

            articles = query.all()
            articles_data = [a.to_dict(user.user_id if user_type in ['Free', 'Premium'] else None) for a in articles]
            return articles_data, 200, "Search results returned"
        except Exception as e:
            print(f"Error searching articles: {e}")
            return None, 500, f"Internal error: {str(e)}"
        
    @classmethod
    def getArticleByIdForUser(cls, article_id: int, user_id: int):
        """Get specific article by ID with user role-based access control"""
        try:
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return None, 404, "User not found"
            
            if user.status != 'Active':
                return None, 403, "User is not active"

            user_type = user.user_type.name if user.user_type else None

            # Get the article
            article = cls.query.get(article_id)
            if not article:
                return None, 404, "Article not found"

            # Access control and liked_by_user toggle
            if user_type == "Admin":
                return article.to_dict(), 200, "Admin access granted"

            elif user_type == "Expert":
                return article.to_dict(), 200, "Expert access granted"

            elif user_type == "Premium":
                return article.to_dict(user.user_id), 200, "Premium access granted"

            elif user_type == "Free":
                if article.is_free:
                    return article.to_dict(user.user_id), 200, "Free user can view free article"
                else:
                    return None, 403, "Access denied: Premium content"

            return None, 403, "Access denied: Invalid user type"

        except Exception as e:
            print(f"Error fetching article by ID for user: {e}")
            return None, 500, f"Internal error: {str(e)}"
        

    @classmethod
    def query_all_preview_only(cls):
        try:
            articles = cls.query.all()
            return articles
        except Exception as e:
            print("❌ Error in query_all_preview_only:", e)
            return []
        
    @classmethod
    def getArticlesForLandingPage(cls):
        """Get maximum 3 articles for landing page (public access)"""
        try:
            # Get the 3 most recent articles for landing page
            articles = cls.query.order_by(cls.date_created.desc()).limit(3).all()
            articles_data = [article.to_dict() for article in articles]
            
            return articles_data, 200, f"Retrieved {len(articles_data)} articles for landing page"
            
        except Exception as e:
            print(f"Error fetching articles for landing page: {e}")
            return None, 500, f"Error fetching articles: {str(e)}"
    
    @classmethod
    def getTotalArticleCount(cls):
        """Get total count of all articles"""
        try:
            total_articles = cls.query.count()
            return total_articles, 200, "Article count fetched successfully"
        except Exception as e:
            print(f"Error fetching article count: {e}")
            return 0, 500, f"Error: {str(e)}"
        
    @classmethod
    def getTopLikedArticles(cls, limit=3):
        try:
            from app.entity.article_like import ArticleLike
            from sqlalchemy import func

            top_articles = (
                db.session.query(cls, func.count(ArticleLike.article_like_id).label("like_count"))
                .join(ArticleLike, cls.article_id == ArticleLike.article_id)
                .group_by(cls.article_id)
                .order_by(func.count(ArticleLike.article_like_id).desc())
                .limit(limit)
                .all()
            )

            articles_data = [
                {**article.to_preview_dict(), "like_count": count}
                for article, count in top_articles
            ]

            return articles_data, 200, f"Top {limit} most liked articles"
        
        except Exception as e:
            print(f"❌ Error fetching top liked articles: {e}")
            return None, 500, f"Internal error: {str(e)}"