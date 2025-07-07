# application_answer.py
from app.models import db

class ApplicationAnswer(db.Model):
    __tablename__ = 'application_answer'
    
    answer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(db.Integer, db.ForeignKey('application.application_id'), nullable=False)
    answer_text = db.Column(db.Text, nullable=False)
    
    def __repr__(self):
        return f'<ApplicationAnswer {self.answer_id} for Application {self.application_id}>'
    
    def to_dict(self):
        return {
            'answer_id': self.answer_id,
            'application_id': self.application_id,
            'answer_text': self.answer_text
        }