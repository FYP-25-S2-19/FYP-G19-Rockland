# seed_subscriptions.py

from app import create_app
from app.models import db
from app.entity.subscription_plan import SubscriptionPlan

# Import all entity files to prevent relationship errors
from app.entity.categories import Categories
from app.entity.interest import Interest
from app.entity.faq import Faq
from app.entity.user import User
from app.entity.usertype import UserType
from app.entity.video import Video
from app.entity.applink import AppLink
from app.entity.testimonials import Testimonials
from app.entity.token import Token
from app.entity.application import Application
from app.entity.application_answer import ApplicationAnswer
from app.entity.application_file import ApplicationFile
from app.entity.article import Article
from app.entity.article_like import ArticleLike
from app.entity.quiz import Quiz, QuizQuestion, QuizOption, QuizResult
from app.entity.user_activity import UserActivity

app = create_app()

with app.app_context():
    # Clear existing plans with same name to avoid duplication (optional)
    existing = SubscriptionPlan.query.filter_by(name="Premium Plan").first()
    if existing:
        db.session.delete(existing)
        db.session.commit()

    # Create the Premium Plan
    premium_plan = SubscriptionPlan(
        name="Premium Plan",
        description="Unlock all Rockland premium features",
        price=9.99,
        currency="usd",
        feature_a="Chat expert",
        feature_b="Unlimited scans",
        feature_c="Unlimited quizzes",
        feature_d="Badges & premium articles"
    )

    db.session.add(premium_plan)
    db.session.commit()
    print("✅ Premium subscription plan seeded successfully!")
