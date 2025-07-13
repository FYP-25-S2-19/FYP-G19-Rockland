# seed_achievements.py
from app import create_app
from app.models import db
from app.entity.achievement import AchievementsList

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
app.app_context().push()

def seed_achievements():
    achievements = [
        (1, "Complete your first quiz", 50),
        (2, "Complete 5 quizzes", 100),
        (3, "Participate in a discussion", 25),
        (4, "Participate in 10 discussions", 75),
        (5, "Reach 100 total points", 50)
    ]

    for id, description, score in achievements:
        if not AchievementsList.query.get(id):
            db.session.add(AchievementsList(achievement_id=id, description=description, score=score))

    db.session.commit()
    print("✅ Achievements seeded.")

seed_achievements()
