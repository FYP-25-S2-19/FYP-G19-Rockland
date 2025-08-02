from app.models import db
from datetime import datetime

class Quiz(db.Model):
    __tablename__ = 'quiz'

    quiz_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    total_points = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))  # Creator
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 🆕 Link to Interest
    interest_id = db.Column(db.Integer, db.ForeignKey('interest.interest_id'))
    interest = db.relationship('Interest')

    questions = db.relationship('QuizQuestion', backref='quiz', cascade="all, delete-orphan")
    results = db.relationship('QuizResult', backref='quiz', cascade="all, delete-orphan")

    def to_dict_basic(self):
        return {
            "quiz_id": self.quiz_id,
            "title": self.title,
            "description": self.description,
            "total_points": self.total_points,
            "interest": self.interest.title if self.interest else None,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }

    def to_dict_full(self):
        return {
            "quiz_id": self.quiz_id,
            "title": self.title,
            "description": self.description,
            "total_points": self.total_points,
            "interest": self.interest.title if self.interest else None,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "questions": [
                {
                    "question_id": q.question_id,
                    "question_text": q.question_text,
                    "points": q.points,
                    "options": [
                        {
                            "option_id": opt.option_id,
                            "option_text": opt.option_text,
                            "is_correct": opt.is_correct,
                        }
                        for opt in q.options
                    ],
                }
                for q in self.questions
            ],
        }


class QuizQuestion(db.Model):
    __tablename__ = 'quizquestion'

    question_id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.quiz_id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    points = db.Column(db.Integer, default=1)

    options = db.relationship('QuizOption', backref='question', cascade="all, delete-orphan")


class QuizOption(db.Model):
    __tablename__ = 'quizoption'

    option_id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('quizquestion.question_id'), nullable=False)
    option_text = db.Column(db.String(255), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)


class QuizResult(db.Model):
    __tablename__ = 'quizresult'

    quiz_result_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.quiz_id'), nullable=False)
    score = db.Column(db.Integer)
    points_earned = db.Column(db.Integer)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ✅ No need for a relationship here — already linked via Quiz.results
