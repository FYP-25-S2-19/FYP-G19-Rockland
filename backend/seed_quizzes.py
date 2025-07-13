from app import create_app
from app.models import db
# Import ALL entities to ensure tables are created
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
from datetime import datetime
from sqlalchemy import inspect
from app.entity.quiz import Quiz, QuizQuestion, QuizOption, QuizResult

app = create_app()

quizzes = [
    {
        "title": "Rock Basic Quiz",
        "description": "This quiz is designed to test your fundamental knowledge of rocks and the rock cycle. Whether you're new to geology or just need a refresher, these questions cover the basic types of rocks, how they form, and key characteristics to help you better understand the building blocks of the Earth.",
        "total_points": 270,
        "created_by_email": "admin@rockland.com",
        "questions": [
            {
                "text": "Which of the following is an example of an igneous rock?",
                "options": ["Limestone", "Sandstone", "Granite", "Shale"],
                "answer": "Granite"
            },
            {
                "text": "What process transforms sediment into sedimentary rock?",
                "options": ["Melting", "Compaction and cementation", "Evaporation", "Erosion"],
                "answer": "Compaction and cementation"
            },
            {
                "text": "Metamorphic rocks form as a result of:",
                "options": ["Melting and cooling", "Weathering and erosion", "Heat and pressure", "Freezing and thawing"],
                "answer": "Heat and pressure"
            }
        ]
    }
]

with app.app_context():
    for quiz_data in quizzes:
        existing_quiz = Quiz.query.filter_by(title=quiz_data["title"]).first()
        if existing_quiz:
            print(f"⏭️ Skipping existing quiz: {quiz_data['title']}")
            continue

        user = User.query.filter_by(email=quiz_data["created_by_email"]).first()
        if not user:
            print(f"❌ Creator not found: {quiz_data['created_by_email']}")
            continue

        quiz = Quiz(
            title=quiz_data["title"],
            description=quiz_data["description"],
            total_points=quiz_data["total_points"],
            user_id=user.user_id,
            created_at=datetime.utcnow()
        )
        db.session.add(quiz)
        db.session.flush()

        for q in quiz_data["questions"]:
            question = QuizQuestion(
                quiz_id=quiz.quiz_id,
                question_text=q["text"],
                points=30
            )
            db.session.add(question)
            db.session.flush()

            for option_text in q["options"]:
                is_correct = (option_text.strip() == q["answer"].strip())
                db.session.add(QuizOption(
                    question_id=question.question_id,
                    option_text=option_text,
                    is_correct=is_correct
                ))

        db.session.commit()
        print(f"✅ Quiz seeded: {quiz.title}")
