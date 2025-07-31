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
            'photo': self.photo,
            'photo_url': self.photo_url,
            'signed_photo_url': signed_photo_url,
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
            "signed_photo_url": signed_url,
            "total_likes": self.likes.count() if self.likes else 0,
            "liked_by_user": liked
        }

    # === Utility methods for photos ===
    @classmethod
    def allowed_photo_file(cls, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in cls.ALLOWED_PHOTO_EXTENSIONS

    @classmethod
    def _upload_photo_to_cloud(cls, photo_file, filename):
        try:
            if not cls.allowed_photo_file(filename):
                print(f"❌ Invalid file type: {filename}")
                return None, None
            
            if hasattr(photo_file, 'seek'):
                photo_file.seek(0, os.SEEK_END)
                file_size = photo_file.tell()
                photo_file.seek(0)
                if file_size > cls.MAX_PHOTO_SIZE:
                    print(f"❌ Photo too large: {file_size} bytes (max: {cls.MAX_PHOTO_SIZE})")
                    return None, None
            
            blob_path = upload_file_to_gcs(
                file_stream=photo_file,
                filename=filename,
                folder="articles",
                custom_filename=None,
                overwrite=True
            )
            
            if blob_path:
                signed_url = generate_signed_url(blob_path, expiration_minutes=60)
                print(f"✅ Photo uploaded: {blob_path}")
                return blob_path, signed_url
            else:
                return None, None
                
        except Exception as e:
            print(f"❌ Error uploading photo: {e}")
            return None, None

    # === CRUD methods ===
    @classmethod
    def createArticle(cls, title, content, categories_id, user_id, photo=None, photo_file=None, is_free=True):
        try:
            if not title or not title.strip():
                return False, 400, "Article title is required", None
            if not content or not content.strip():
                return False, 400, "Article content is required", None
            if not categories_id:
                return False, 400, "Category ID is required", None
            if not user_id:
                return False, 400, "User ID is required", None
            if len(title.strip()) < 5:
                return False, 400, "Title must be at least 5 characters long", None
            if len(content.strip()) < 50:
                return False, 400, "Content must be at least 50 characters long", None

            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None
            if not user.user_type or user.user_type.name != 'Expert':
                return False, 403, "Only Expert users can create articles", None
            if user.status != 'Active':
                return False, 403, "User account is not active", None

            from app.entity.categories import Categories
            category = Categories.query.get(categories_id)
            if not category:
                return False, 404, f"Category with ID {categories_id} not found", None
            
            photo_path = None
            photo_url = None
            
            if photo_file and photo_file.filename:
                filename = secure_filename(photo_file.filename)
                if filename:
                    photo_path, photo_url = cls._upload_photo_to_cloud(photo_file, filename)
                    if not photo_path:
                        return False, 500, "Failed to upload photo", None
            
            new_article = cls(
                title=title.strip(),
                content=content.strip(),
                photo=photo_path,
                photo_url=photo_url,
                categories_id=categories_id,
                user_id=user_id,
                is_free=is_free,
                date_created=datetime.utcnow()
            )
            
            db.session.add(new_article)
            db.session.commit()
            
            return True, 201, "Article created successfully", new_article
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating article: {e}")
            return False, 500, f"Error creating article: {str(e)}", None

    @classmethod
    def deleteArticle(cls, article_id, user_id):
        try:
            article = cls.query.get(article_id)
            if not article:
                return False, 404, "Article not found", None
            
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return False, 404, "User not found", None
            
            is_admin = user.user_type and user.user_type.name == 'Admin'
            if not is_admin:
                return False, 403, "Only administrators can delete articles", None
            
            article_title = article.title
            article_data = article.to_dict()
            
            if article.photo:
                delete_file_from_gcs(article.photo)
            
            db.session.delete(article)
            db.session.commit()
            
            return True, 200, f"Article '{article_title}' deleted successfully", article_data
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting article: {e}")
            return False, 500, f"Error deleting article: {str(e)}", None

    # === Retrieval methods ===
    @classmethod
    def getArticlesForUser(cls, user_id):
        """Free users now see premium articles too (frontend blocks access on click)"""
        try:
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return None, 404, "User not found"
            if user.status != 'Active':
                return None, 403, "User account is not active"

            articles = cls.query.order_by(cls.date_created.desc()).all()
            articles_data = [article.to_dict(user.user_id) for article in articles]
            return articles_data, 200, "All articles for user (premium locked on frontend)"
        except Exception as e:
            print(f"Error fetching articles for user: {e}")
            return None, 500, f"Error fetching articles: {str(e)}"

    @classmethod
    def searchArticles(cls, user_id, search_term=None, category_ids=None, sort_by="newest"):
        """Free users now see premium articles too in search results"""
        try:
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return None, 404, "User not found"
            if user.status != 'Active':
                return None, 403, "User account is not active"

            query = cls.query

            if search_term:
                query = query.filter(cls.title.ilike(f'%{search_term.strip()}%'))
            if category_ids and isinstance(category_ids, list) and category_ids:
                query = query.filter(cls.categories_id.in_(category_ids))

            if sort_by == "oldest":
                query = query.order_by(cls.date_created.asc())
            elif sort_by == "most_liked":
                query = query.outerjoin(ArticleLike).group_by(cls.article_id).order_by(func.count(ArticleLike.article_like_id).desc())
            else:
                query = query.order_by(cls.date_created.desc())

            articles = query.all()
            articles_data = [a.to_dict(user.user_id) for a in articles]
            return articles_data, 200, "Search results returned"
        except Exception as e:
            print(f"Error searching articles: {e}")
            return None, 500, f"Internal error: {str(e)}"

    @classmethod
    def getArticleByIdForUser(cls, article_id, user_id):
        """Access control still enforced here: free users can't open premium articles"""
        try:
            from app.entity.user import User
            user = User.queryUserById(user_id)
            if not user:
                return None, 404, "User not found"
            if user.status != 'Active':
                return None, 403, "User is not active"

            user_type = user.user_type.name if user.user_type else None
            article = cls.query.get(article_id)
            if not article:
                return None, 404, "Article not found"

            # Admin & Expert can open all
            if user_type in ["Admin", "Expert"]:
                return article.to_dict(), 200, f"{user_type} access granted"

            # Premium can open all
            if user_type == "Premium":
                return article.to_dict(user.user_id), 200, "Premium access granted"

            # Free can only open free
            if user_type == "Free":
                if article.is_free:
                    return article.to_dict(user.user_id), 200, "Free user can view free article"
                else:
                    return None, 403, "Access denied: Premium content"

            return None, 403, "Access denied: Invalid user type"

        except Exception as e:
            print(f"Error fetching article by ID for user: {e}")
            return None, 500, f"Internal error: {str(e)}"
        
    @classmethod
    def getArticlesByAuthor(cls, author_id: int, limit: int = 6):
        """Get latest `limit` articles by specific author (used for profile/preview)"""
        try:
            articles = (
                cls.query.filter_by(user_id=author_id)
                .order_by(cls.date_created.desc())
                .limit(limit)
                .all()
            )
            articles_data = [article.to_dict() for article in articles]
            return articles_data, 200, f"Top {limit} articles by author {author_id}"
        except Exception as e:
            print(f"Error fetching articles by author: {e}")
            return None, 500, f"Error: {str(e)}"

    @classmethod
    def getAllArticlesByAuthor(cls, author_id: int):
        """Get all articles by specific author (full history)"""
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
    def query_all_preview_only(cls):
        try:
            return cls.query.all()
        except Exception as e:
            print("❌ Error in query_all_preview_only:", e)
            return []

    @classmethod
    def getArticlesForLandingPage(cls):
        try:
            articles = cls.query.order_by(cls.date_created.desc()).limit(3).all()
            return [article.to_dict() for article in articles], 200, f"Retrieved {len(articles)} articles for landing page"
        except Exception as e:
            print(f"Error fetching articles for landing page: {e}")
            return None, 500, f"Error fetching articles: {str(e)}"

    @classmethod
    def getTotalArticleCount(cls):
        try:
            return cls.query.count(), 200, "Article count fetched successfully"
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

            return [
                {**article.to_preview_dict(), "like_count": count}
                for article, count in top_articles
            ], 200, f"Top {limit} most liked articles"
        except Exception as e:
            print(f"❌ Error fetching top liked articles: {e}")
            return None, 500, f"Internal error: {str(e)}"
