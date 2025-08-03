from app.models import db
from datetime import datetime
from app.entity.interest import Interest

class Quiz(db.Model):
    __tablename__ = 'quiz'

    quiz_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    total_points = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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
            "question_count": len(self.questions),
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }

    def to_dict_full(self):
        return {
            "quiz_id": self.quiz_id,
            "title": self.title,
            "description": self.description,
            "total_points": self.total_points,
            "interest": self.interest.title if self.interest else None,
            "interest_id": self.interest_id,
            "question_count": len(self.questions),
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

    @staticmethod
    def create_quiz(data, user_id):
        interest_id = data.get("interest_id")

        if interest_id and not Interest.query.get(interest_id):
            return None

        quiz = Quiz(
            title=data.get("title"),
            description=data.get("description"),
            interest_id=interest_id,
            user_id=user_id,
            total_points=0
        )
        db.session.add(quiz)
        db.session.commit()
        return quiz

    def update_quiz(self, data):
        from app.entity.quiz import QuizQuestion, QuizOption

        self.title = data.get("title", self.title)
        self.description = data.get("description", self.description)
        total_points = 0

        questions_data = data.get("questions", [])
        for q_data in questions_data:
            question_id = q_data.get("question_id")
            options_data = q_data.get("options", [])

            if question_id:
                question = QuizQuestion.query.filter_by(question_id=question_id, quiz_id=self.quiz_id).first()
                if question:
                    question.question_text = q_data.get("question", question.question_text)
                    question.points = q_data.get("points", question.points)
                    total_points += question.points

                    existing_options = QuizOption.query.filter_by(question_id=question.question_id).all()
                    existing_option_ids = {opt.option_id for opt in existing_options}
                    updated_option_ids = set()

                    for opt_data in options_data:
                        option_id = opt_data.get("option_id")
                        if option_id:
                            option = QuizOption.query.filter_by(option_id=option_id, question_id=question.question_id).first()
                            if option:
                                option.option_text = opt_data.get("option_text", option.option_text)
                                option.is_correct = opt_data.get("is_correct", option.is_correct)
                                updated_option_ids.add(option.option_id)
                        else:
                            new_option = QuizOption(
                                question_id=question.question_id,
                                option_text=opt_data.get("option_text"),
                                is_correct=opt_data.get("is_correct", False),
                            )
                            db.session.add(new_option)
                            db.session.flush()

                    to_delete_ids = existing_option_ids - updated_option_ids
                    if to_delete_ids:
                        QuizOption.query.filter(QuizOption.option_id.in_(to_delete_ids)).delete(synchronize_session='fetch')
            else:
                new_question = QuizQuestion(
                    quiz_id=self.quiz_id,
                    question_text=q_data.get("question"),
                    points=q_data.get("points", 1),
                )
                db.session.add(new_question)
                db.session.flush()
                total_points += new_question.points

                for opt_data in options_data:
                    new_option = QuizOption(
                        question_id=new_question.question_id,
                        option_text=opt_data.get("option_text"),
                        is_correct=opt_data.get("is_correct", False),
                    )
                    db.session.add(new_option)

        self.total_points = total_points
        if "interest_id" in data:
            self.interest_id = data["interest_id"]

        db.session.commit()

    def delete_quiz(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def search_quizzes_by_user(user_id, keyword=None):
        query = Quiz.query.filter_by(user_id=user_id)
        if keyword:
            query = query.filter(Quiz.title.ilike(f"%{keyword}%"))
        return query.order_by(Quiz.quiz_id.desc()).all()

    def add_question(self, question_text, options, correct_index, points):
        new_question = QuizQuestion(
            quiz_id=self.quiz_id,
            question_text=question_text,
            points=points
        )
        db.session.add(new_question)
        db.session.flush()

        for idx, opt_text in enumerate(options):
            opt = QuizOption(
                question_id=new_question.question_id,
                option_text=opt_text,
                is_correct=(idx == correct_index)
            )
            db.session.add(opt)

        self.total_points = (self.total_points or 0) + points
        db.session.commit()
        return new_question.question_id

    @staticmethod
    def get_filtered_by_interest(interest_id):
        return Quiz.query.filter_by(interest_id=interest_id).order_by(Quiz.quiz_id.desc()).all()

    @staticmethod
    def get_sorted_by_user_interests(user_interest_ids):
        all_quizzes = Quiz.query.order_by(Quiz.quiz_id.desc()).all()
        return sorted(all_quizzes, key=lambda q: 0 if q.interest_id in user_interest_ids else 1)


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

    @staticmethod
    def count_attempts_today(user_id):
        today = datetime.utcnow().date()
        return QuizResult.query.filter_by(user_id=user_id)\
            .filter(QuizResult.completed_at >= datetime(today.year, today.month, today.day))\
            .count()

    @staticmethod
    def get_history_for_user(user_id):
        return QuizResult.query.filter_by(user_id=user_id).order_by(QuizResult.completed_at.desc()).all()

    @staticmethod
    def submit_result(user_id, quiz_id, selected_option_ids):
        total_score = 0
        for selected_id in selected_option_ids:
            option = QuizOption.query.get(selected_id)
            if option and option.is_correct:
                question = option.question
                total_score += question.points if question and question.points else 0

        result = QuizResult(
            user_id=user_id,
            quiz_id=quiz_id,
            score=total_score,
            points_earned=total_score
        )
        db.session.add(result)
        return result, total_score
