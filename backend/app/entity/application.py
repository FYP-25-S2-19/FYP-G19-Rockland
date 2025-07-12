# application.py
from app.models import db
from datetime import datetime
from app.utils.gcs import generate_signed_url, upload_file_to_gcs
from werkzeug.utils import secure_filename
import os

class Application(db.Model):
    __tablename__ = 'application'

    application_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    submission_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pending')

    user = db.relationship('User', backref='applications')
    answers = db.relationship("ApplicationAnswer", backref="application", lazy='dynamic')
    files = db.relationship('ApplicationFile', backref='application', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Application {self.application_id} by User {self.user_id}>'

    def to_dict(self):
        return {
            'application_id': self.application_id,
            'user_id': self.user_id,
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'status': self.status,
        }

    @classmethod
    def getApplicationsByUserId(cls, user_id):
        try:
            return cls.query.filter_by(user_id=user_id).order_by(cls.submission_date.desc()).all()
        except Exception as e:
            print(f"Error fetching user applications: {e}")
            return None

    @classmethod
    def createApplication(cls, user_id, answers_data, files_data=None):
        try:
            from app.entity.application_answer import ApplicationAnswer
            from app.entity.application_file import ApplicationFile

            print(f"▶️ Received answers: {answers_data}")
            print(f"▶️ Received files: {[f.filename for f in files_data] if files_data else 'No files'}")

            allowed_extensions = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'}

            existing_apps = cls.getApplicationsByUserId(user_id)
            if existing_apps:
                for app in existing_apps:
                    if app.status == 'Pending':
                        return False, 400, "You already have a pending application. Please wait for it to be processed.", None

            if not answers_data or any(not a.get('answer', '').strip() for a in answers_data):
                return False, 400, "Both answers are required.", None

            uploaded_paths = []
            if files_data:
                for file in files_data:
                    if not file or not file.filename:
                        continue

                    filename = secure_filename(file.filename)
                    if '.' not in filename:
                        return False, 400, f"Invalid filename: {filename}", None

                    ext = filename.rsplit('.', 1)[1].lower()
                    print(f"📦 Checking file extension: {ext}")
                    print(f"✅ Allowed extensions: {allowed_extensions}")

                    if ext not in allowed_extensions:
                        return False, 400, f"File type not allowed for {filename}", None

                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    name, _ = os.path.splitext(filename)
                    final_name = f"{user_id}_{timestamp}_{name}"

                    blob_path = upload_file_to_gcs(
                        file_stream=file.stream,
                        filename=filename,
                        folder=f"applications/{user_id}",
                        custom_filename=final_name,
                        overwrite=True
                    )

                    if blob_path:
                        uploaded_paths.append(blob_path)

            new_application = cls(user_id=user_id, status='Pending')
            db.session.add(new_application)
            db.session.flush()

            for answer_data in answers_data:
                answer = ApplicationAnswer(
                    application_id=new_application.application_id,
                    answer_text=answer_data.get('answer', '')
                )
                db.session.add(answer)

            for file_path in uploaded_paths:
                file_record = ApplicationFile(
                    application_id=new_application.application_id,
                    file_path=file_path
                )
                db.session.add(file_record)

            db.session.commit()
            return True, 201, "Application submitted successfully", new_application

        except Exception as e:
            db.session.rollback()
            print(f"Error creating application: {e}")
            return False, 500, f"Error: {str(e)}", None

    @classmethod
    def getAllApplications(cls):
        try:
            return cls.query.order_by(cls.submission_date.desc()).all()
        except Exception as e:
            print(f"Error fetching all applications: {e}")
            return None

    @classmethod
    def getApplicationsByStatus(cls, status):
        try:
            return cls.query.filter_by(status=status).order_by(cls.submission_date.desc()).all()
        except Exception as e:
            print(f"Error fetching applications by status: {e}")
            return None

    @classmethod
    def getPastApplications(cls):
        try:
            from sqlalchemy import or_
            return cls.query.filter(
                or_(cls.status == 'Approved', cls.status == 'Rejected')
            ).order_by(cls.submission_date.desc()).all()
        except Exception as e:
            print(f"Error fetching past applications: {e}")
            return None

    @classmethod
    def getApplicationById(cls, application_id):
        try:
            return cls.query.get(application_id)
        except Exception as e:
            print(f"Error fetching application by ID: {e}")
            return None

    @classmethod
    def viewApplicationDetails(cls, application_id):
        try:
            application = cls.query.get(application_id)
            if not application:
                return None, 404

            user = application.user
            detailed_data = {
                'application_id': application.application_id,
                'status': application.status,
                'date_submitted': application.submission_date.strftime('%d/%m/%Y') if application.submission_date else None,
                'user_id': application.user_id,
                'first_name': user.first_name if user else "Unknown",
                'last_name': user.last_name if user else "Unknown",
                'email': user.email if user else "Unknown",
                'date_of_birth': user.date_of_birth.strftime('%d/%m/%Y') if user and user.date_of_birth else None,
                'contact_number': user.contact_number if user else None,
                'gender': user.gender if user else None,
                'region': user.region if user else None,
                'created_date': user.created_date.strftime('%d/%m/%Y') if user and user.created_date else None,
                'role': user.user_type.name if user and user.user_type else "Unknown",
                'interest': "Fossils, Minerals",
                'questions': {},
                'attached_files': []
            }

            if application.answers:
                questions_data = {
                    'question1': 'Why do you want to become an expert?',
                    'answer1': '',
                    'question2': 'Describe your background and expertise in your field.',
                    'answer2': ''
                }
                for i, answer in enumerate(application.answers):
                    if i == 0:
                        questions_data['answer1'] = answer.answer_text
                    elif i == 1:
                        questions_data['answer2'] = answer.answer_text
                detailed_data['questions'] = questions_data

            if application.files:
                for file in application.files:
                    signed_url = generate_signed_url(file.file_path, expiration_minutes=60)
                    detailed_data['attached_files'].append({
                        'file_name': file.file_path.split('/')[-1],
                        'signed_url': signed_url
                    })

            return detailed_data, 200

        except Exception as e:
            print(f"Error in viewApplicationDetails: {e}")
            return None, 500

    @classmethod
    def acceptApplication(cls, application_id, admin_id):
        try:
            application = cls.query.get(application_id)
            if not application:
                return False, 404, "Application not found"
            if application.status != 'Pending':
                return False, 400, f"Cannot accept application with status: {application.status}"
            application.status = 'Approved'
            db.session.commit()
            return True, 200, "Application accepted successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error accepting application: {e}")
            return False, 500, f"Error accepting application: {str(e)}"

    @classmethod
    def rejectApplication(cls, application_id, admin_id, rejection_reason=None):
        try:
            application = cls.query.get(application_id)
            if not application:
                return False, 404, "Application not found"
            if application.status != 'Pending':
                return False, 400, f"Cannot reject application with status: {application.status}"
            application.status = 'Rejected'
            db.session.commit()
            return True, 200, "Application rejected successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error rejecting application: {e}")
            return False, 500, f"Error rejecting application: {str(e)}"

    @classmethod
    def updateApplicationStatus(cls, application_id, new_status, admin_id):
        try:
            application = cls.query.get(application_id)
            if not application:
                return False, 404, "Application not found"
            valid_statuses = ['Pending', 'Approved', 'Rejected', 'Under Review']
            if new_status not in valid_statuses:
                return False, 400, f"Invalid status: {new_status}"
            application.status = new_status
            db.session.commit()
            return True, 200, f"Application status updated to {new_status}"
        except Exception as e:
            db.session.rollback()
            print(f"Error updating application status: {e}")
            return False, 500, f"Error updating application status: {str(e)}"

    def to_dict_detailed(self):
        user = self.user
        return {
            'application_id': self.application_id,
            'user_id': self.user_id,
            'first_name': user.first_name if user else "Unknown",
            'last_name': user.last_name if user else "Unknown",
            'email': user.email if user else "Unknown",
            'date_submitted': self.submission_date.strftime('%d/%m/%Y') if self.submission_date else None,
            'files_submitted': len(self.files) if self.files else 0,
            'status': self.status,
            'answers_count': len(self.answers) if self.answers else 0,
            'date_processed': self.submission_date.strftime('%d/%m/%Y') if self.submission_date else None,
            'admin_id': 100
        }
