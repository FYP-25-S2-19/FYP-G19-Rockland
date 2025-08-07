import os
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables first
load_dotenv()

# Set Google Cloud credentials if specified in .env
if os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    print(f"🔐 Google Cloud credentials loaded from: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")

from app import create_app
from app.models import db
from flask import Flask

# Import all models to ensure they're registered
from app.entity.achievement import AchievementsList, AchievementsRecord
from app.entity.application_answer import ApplicationAnswer
from app.entity.application_file import ApplicationFile
from app.entity.application import Application
from app.entity.applink import AppLink
from app.entity.article_like import ArticleLike
from app.entity.article import Article
from app.entity.categories import Categories
from app.entity.comment_rock import CommentRock
from app.entity.discussion_comment import DiscussionComment
from app.entity.discussion import Discussion
from app.entity.email_verification import EmailVerification
from app.entity.faq import Faq
from app.entity.import_all_entities import ImportAllEntities
from app.entity.interest import Interest
from app.entity.like_comment_rock import LikeCommentRock
from app.entity.password_reset import PasswordReset
from app.entity.payment import Payment
from app.entity.quiz import Quiz, QuizQuestion, QuizOption, QuizResult
from app.entity.rock_scan_history import RockScanHistory
from app.entity.rock_spawn import RockSpawn
from app.entity.rock import Rock
from app.entity.subscription_plan import SubscriptionPlan
from app.entity.testimonials import Testimonials
from app.entity.token import Token
from app.entity.trade_offer import TradeOffer
from app.entity.user_activity import UserActivity
from app.entity.user_rock_collection import UserRockCollection
from app.entity.user_rock_spawn import UserRockSpawn
from app.entity.user_subscription import UserSubscription
from app.entity.user import User
from app.entity.usertype import UserType
from app.entity.video import Video
from app.entity.zone_profile import ZoneProfile


# Create app - no environment switching, always use Cloud SQL
app = create_app()

# Configure Google Cloud Storage for gcs.py
app.config['GCS_BUCKET_NAME'] = 'rocklandapp'
print(f"☁️ GCS Bucket configured: {app.config['GCS_BUCKET_NAME']}")

# Enable CORS for frontend communication
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])
print("🌐 CORS enabled for frontend communication")

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
        
        # Test Google Cloud Storage connection and gsc.py functions
        try:
            from google.cloud import storage
            client = storage.Client()
            print("✅ Google Cloud Storage authentication successful!")
            
            # Test if gsc.py functions work
            try:
                from app.utils.gcs import generate_signed_url
                print("✅ gsc.py utilities imported successfully!")
            except ImportError as gcs_error:
                print(f"⚠️ Could not import gsc.py utilities: {gcs_error}")
                print("💡 Make sure app/utils/gcs.py exists and has the required functions")
                
        except Exception as storage_error:
            print(f"⚠️ Google Cloud Storage authentication failed: {storage_error}")
            print("💡 Article photo uploads will fail without proper GCS authentication")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Make sure:")
        print("1. Cloud SQL instance is running")
        print("2. Your IP is in authorized networks")
        print("3. rockland_user exists with password 'rockland123'")
        exit(1)

# Only run the server when this file is executed directly (for local testing)
# Cloud Run will use main.py instead
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🌐 Local development server starting on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)