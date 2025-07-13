# application.py
from app.models import db
from datetime import datetime

class Application(db.Model):
    __tablename__ = 'application'
    
    application_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    submission_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pending')  # Pending, Approved, Rejected, Under Review
    
    # Relationships - Use string references to avoid import order issues
    user = db.relationship('User', backref='applications')
    answers = db.relationship('ApplicationAnswer', backref='application', cascade='all, delete-orphan')
    files = db.relationship('ApplicationFile', backref='application', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Application {self.application_id} by User {self.user_id}>'
    
    def to_dict(self):
        return {
            'application_id': self.application_id,
            'user_id': self.user_id,
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'status': self.status
        }
    
    @classmethod
    def getApplicationsByUserId(cls, user_id):
        """Get all applications by a specific user"""
        try:
            applications = cls.query.filter_by(user_id=user_id).order_by(cls.submission_date.desc()).all()
            return applications
        except Exception as e:
            print(f"Error fetching user applications: {e}")
            return None

    @classmethod
    def createApplication(cls, user_id, answers_data, files_data=None):
        """
        Create new application with answers and files
        answers_data: list of dicts [{'question': 'Q1', 'answer': 'A1'}, {'question': 'Q2', 'answer': 'A2'}]
        files_data: list of file paths (optional)
        """
        try:
            # Import here to avoid circular imports
            from app.entity.application_answer import ApplicationAnswer
            from app.entity.application_file import ApplicationFile
            
            # Check if user already has a pending application
            existing_applications = cls.getApplicationsByUserId(user_id)
            if existing_applications:
                for app in existing_applications:
                    if app.status == 'Pending':
                        return False, 400, "You already have a pending application. Please wait for it to be processed.", None
            
            # Create application
            new_application = cls(
                user_id=user_id,
                status='Pending'
            )
            
            db.session.add(new_application)
            db.session.flush()  # Get the application_id
            
            # Create answers
            if answers_data:
                for answer_data in answers_data:
                    answer = ApplicationAnswer(
                        application_id=new_application.application_id,
                        answer_text=answer_data.get('answer', '')
                    )
                    db.session.add(answer)
            
            # Create file records if provided
            if files_data:
                for file_path in files_data:
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
        """Get all applications for admin view"""
        try:
            applications = cls.query.order_by(cls.submission_date.desc()).all()
            return applications
        except Exception as e:
            print(f"Error fetching all applications: {e}")
            return None

    @classmethod
    def getApplicationsByStatus(cls, status):
        """Get applications by status (Pending, Approved, Rejected)"""
        try:
            applications = cls.query.filter_by(status=status).order_by(cls.submission_date.desc()).all()
            return applications
        except Exception as e:
            print(f"Error fetching applications by status: {e}")
            return None

    @classmethod
    def getPastApplications(cls):
        """Get processed applications (Approved + Rejected)"""
        try:
            from sqlalchemy import or_
            applications = cls.query.filter(
                or_(cls.status == 'Approved', cls.status == 'Rejected')
            ).order_by(cls.submission_date.desc()).all()
            return applications
        except Exception as e:
            print(f"Error fetching past applications: {e}")
            return None

    @classmethod
    def getApplicationById(cls, application_id):
        """Get specific application by ID"""
        try:
            application = cls.query.get(application_id)
            return application
        except Exception as e:
            print(f"Error fetching application by ID: {e}")
            return None

    @classmethod
    def viewApplicationDetails(cls, application_id):
        """Get detailed application information including user, answers, and files"""
        try:
            application = cls.query.get(application_id)
            
            if not application:
                return None, 404
            
            # Build detailed response
            user = application.user
            detailed_data = {
                'application_id': application.application_id,
                'status': application.status,
                'date_submitted': application.submission_date.strftime('%d/%m/%Y') if application.submission_date else None,
                
                # User information
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
                'interest': "Fossils, Minerals",  # You can implement this based on your Interest relationship
                
                # Questions and answers
                'questions': {},
                'attached_files': []
            }
            
            # Get answers
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
            
            # Get attached files
            if application.files:
                for file in application.files:
                    # Extract just the filename from the full path
                    filename = file.file_path.split('/')[-1] if file.file_path else "Unknown file"
                    detailed_data['attached_files'].append(filename)
            
            return detailed_data, 200
            
        except Exception as e:
            print(f"Error in viewApplicationDetails: {e}")
            return None, 500

    @classmethod
    def acceptApplication(cls, application_id, admin_id):
        """Accept an application and upgrade user to Expert"""
        try:
            application = cls.query.get(application_id)
            
            if not application:
                return False, 404, "Application not found"
            
            if application.status != 'Pending':
                return False, 400, f"Cannot accept application with status: {application.status}"
            
            # Update status to Approved
            application.status = 'Approved'
            
            # IMPORTANT: Upgrade the user to Expert when application is accepted
            user = application.user
            if user:
                # Import User class to use upgradeUserType method
                from app.entity.user import User
                
                # Upgrade user to Expert (assuming Expert type exists)
                success, status_code, upgrade_message, updated_user = User.upgradeUserType(
                    user.user_id, 
                    'Expert'  # Target user type
                )
                
                if success:
                    print(f"✅ User {user.email} upgraded to Expert successfully")
                    success_message = "Application accepted successfully and user upgraded to Expert"
                else:
                    # If upgrade fails, still accept application but log the issue
                    print(f"⚠️ Warning: Application accepted but user upgrade failed: {upgrade_message}")
                    success_message = f"Application accepted but user upgrade failed: {upgrade_message}"
            else:
                success_message = "Application accepted but user not found"
            
            # You can add admin tracking here if needed
            # application.processed_by = admin_id
            # application.processed_date = datetime.utcnow()
            
            db.session.commit()
            return True, 200, success_message
            
        except Exception as e:
            db.session.rollback()
            print(f"Error accepting application: {e}")
            return False, 500, f"Error accepting application: {str(e)}"

    @classmethod
    def rejectApplication(cls, application_id, admin_id, rejection_reason=None):
        """Reject an application"""
        try:
            application = cls.query.get(application_id)
            
            if not application:
                return False, 404, "Application not found"
            
            if application.status != 'Pending':
                return False, 400, f"Cannot reject application with status: {application.status}"
            
            # Update status to Rejected
            application.status = 'Rejected'
            
            # You can add admin tracking and rejection reason here if needed
            # application.processed_by = admin_id
            # application.processed_date = datetime.utcnow()
            # application.rejection_reason = rejection_reason
            
            db.session.commit()
            return True, 200, "Application rejected successfully"
            
        except Exception as e:
            db.session.rollback()
            print(f"Error rejecting application: {e}")
            return False, 500, f"Error rejecting application: {str(e)}"

    @classmethod
    def updateApplicationStatus(cls, application_id, new_status, admin_id):
        """Update application status"""
        try:
            application = cls.query.get(application_id)
            
            if not application:
                return False, 404, "Application not found"
            
            # Validate status
            valid_statuses = ['Pending', 'Approved', 'Rejected', 'Under Review']
            if new_status not in valid_statuses:
                return False, 400, f"Invalid status: {new_status}"
            
            # Update status
            application.status = new_status
            
            # You can add admin tracking here if needed
            # application.processed_by = admin_id
            # application.processed_date = datetime.utcnow()
            
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
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'files_submitted': len(self.files) if self.files else 0,
            'status': self.status,
            'answers_count': len(self.answers) if self.answers else 0,
            # For past applications
            'date_processed': self.submission_date.isoformat() if self.submission_date else None,
            'admin_id': 'N/A'  # You can add this field later to track who processed it
        }