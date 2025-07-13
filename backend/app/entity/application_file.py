# application_file.py

from app.models import db
from app.utils.gcs import generate_signed_url


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
            'file_path': self.file_path,
            'signed_url': generate_signed_url(self.file_path, expiration_minutes=60)
        }

    @classmethod
    def create_files_for_application(cls, application_id, file_paths):
        """
        Create multiple ApplicationFile records for a given application_id
        file_paths: list of strings (GCS blob paths)
        """
        try:
            created_files = []
            for path in file_paths:
                file = cls(application_id=application_id, file_path=path)
                db.session.add(file)
                created_files.append(file)
            db.session.commit()
            return created_files
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating application files: {e}")
            return None

    @classmethod
    def delete_files_by_application_id(cls, application_id):
        """
        Delete all file records for a given application_id
        """
        try:
            cls.query.filter_by(application_id=application_id).delete()
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error deleting application files: {e}")
            return False

    @classmethod
    def get_files_by_application_id(cls, application_id):
        """
        Fetch all files attached to a specific application
        """
        try:
            return cls.query.filter_by(application_id=application_id).all()
        except Exception as e:
            print(f"❌ Error fetching files: {e}")
            return []
