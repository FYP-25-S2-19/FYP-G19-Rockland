from app import create_app
from app.models import db
from flask import Flask

# CRITICAL: Import models in correct order
# Import these BEFORE calling create_all()
from app.entity.categories import Categories
from app.entity.interest import Interest
from app.entity.faq import Faq
from app.entity.user import User
from app.entity.usertype import UserType
from app.entity.rock import Rock
from app.entity.comment_rock import CommentRock
from app.entity.like_comment_rock import LikeCommentRock
from app.entity.rock_scan_history import RockScanHistory
from app.entity.user_rock_collection import UserRockCollection
from app.entity.rock_spawn import RockSpawn
from app.entity.user_rock_spawn import UserRockSpawn
from app.entity.video import Video
from app.entity.applink import AppLink
from app.entity.testimonials import Testimonials
from app.entity.token import Token
from app.entity.application import Application
from app.entity.application_answer import ApplicationAnswer
from app.entity.application_file import ApplicationFile
from app.entity.article import Article
from app.entity.article_like import ArticleLike
from app.entity.trade_offer import TradeOffer


# Create app - no environment switching, always use Cloud SQL
app = create_app()

print("🚀 Starting Rockland app with Cloud SQL")
print(f"📊 Database: {app.config['SQLALCHEMY_DATABASE_URI'].split('@')[1] if '@' in app.config['SQLALCHEMY_DATABASE_URI'] else 'Unknown'}")

with app.app_context():
    try:
        # Test database connection (SQLAlchemy 2.x compatible)
        with db.engine.connect() as connection:
            connection.execute(db.text('SELECT 1'))
        print("✅ Cloud SQL connection successful!")
        
        # Create all tables
        db.create_all()
        print("✅ Database tables created successfully!")
        
        # Show which tables were created
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"📋 Created {len(tables)} tables: {', '.join(tables)}")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Make sure:")
        print("1. Cloud SQL instance is running")
        print("2. Your IP is in authorized networks")
        print("3. rockland_user exists with password 'rockland123'")
        exit(1)

if __name__ == '__main__':
    print(f"🌐 Server starting on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)