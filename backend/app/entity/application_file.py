# application_file.py
from app.models import db

class ApplicationFile(db.Model):
    __tablename__ = 'application_file'
    
    file_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(db.Integer, db.ForeignKey('application.application_id'), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    
    def __repr__(self):
        return f'<ApplicationFile {self.file_id} for Application {self.application_id}>'
    
    def to_dict(self):
        return {
            'file_id': self.file_id,
            'application_id': self.application_id,
            'file_path': self.file_path
        }