from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from app.entity.application import Application
from app.controller.authentication.permission_required import permission_required

create_application_blueprint = Blueprint('create_application', __name__)

class CreateApplicationController:
    
    # Configuration for file uploads
    UPLOAD_FOLDER = 'uploads/applications'
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'}
    MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size
    
    @staticmethod
    def allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in CreateApplicationController.ALLOWED_EXTENSIONS
    
    @staticmethod
    def save_uploaded_file(file, user_id, application_id):
        """Save uploaded file and return file path"""
        try:
            if file and CreateApplicationController.allowed_file(file.filename):
                # Create secure filename
                filename = secure_filename(file.filename)
                
                # Add timestamp and user_id to avoid conflicts
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                name, ext = os.path.splitext(filename)
                secure_filename_final = f"{user_id}_{application_id}_{timestamp}_{name}{ext}"
                
                # Create upload directory if it doesn't exist
                upload_path = os.path.join(CreateApplicationController.UPLOAD_FOLDER, str(user_id))
                os.makedirs(upload_path, exist_ok=True)
                
                # Save file
                file_path = os.path.join(upload_path, secure_filename_final)
                file.save(file_path)
                
                return file_path
            return None
        except Exception as e:
            print(f"Error saving file: {e}")
            return None
    
    @staticmethod
    @create_application_blueprint.route('/api/applications/create', methods=['POST'])
    @permission_required('has_user_permission')
    def create_application(**kwargs):
        """Create a new application with answers and files"""
        try:
            # Access current user
            current_user = kwargs.get('current_user')
            user_id = current_user.user_id if current_user else None
            
            if current_user:
                print(f"📝 User {current_user.email} is creating a new application")
            
            # Get form data
            answer1 = request.form.get('answer1', '').strip()
            answer2 = request.form.get('answer2', '').strip()
            
            # Basic validation
            if not answer1 or not answer2:
                return jsonify({
                    'success': False,
                    'message': 'Both answers are required'
                }), 400
            
            # Prepare answers data for entity
            answers_data = [
                {
                    'question': 'Why do you want to become an expert?',
                    'answer': answer1
                },
                {
                    'question': 'Describe your background and expertise in your field.',
                    'answer': answer2
                }
            ]
            
            # Handle file uploads
            files_data = []
            files = request.files.getlist('files')
            
            if files and len(files) > 0:
                for file in files:
                    if file and file.filename:
                        # Basic file validation
                        if not CreateApplicationController.allowed_file(file.filename):
                            return jsonify({
                                'success': False,
                                'message': f'File type not allowed for {file.filename}'
                            }), 400
                        
                        # For now, just store the filename - actual saving happens after entity creates application
                        files_data.append(file)
            
            # Use entity method to create application
            success, status_code, message, new_application = Application.createApplication(
                user_id=user_id,
                answers_data=answers_data,
                files_data=None  # We'll handle files separately after application creation
            )
            
            if not success:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
            
            # Save files after successful application creation
            uploaded_files = []
            if files_data:
                for file in files_data:
                    file_path = CreateApplicationController.save_uploaded_file(
                        file, user_id, new_application.application_id
                    )
                    if file_path:
                        uploaded_files.append(file.filename)
            
            return jsonify({
                'success': True,
                'message': message,
                'application': new_application.to_dict(),
                'uploaded_files': uploaded_files
            }), status_code
            
        except Exception as e:
            print(f"Error in create_application controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating application: {str(e)}'
            }), 500
    
    @staticmethod
    @create_application_blueprint.route('/api/applications/upload-requirements', methods=['GET'])
    def get_upload_requirements():
        """Get file upload requirements and questions"""
        try:
            return jsonify({
                'success': True,
                'requirements': {
                    'max_files': 10,
                    'max_file_size_mb': 16,
                    'allowed_extensions': list(CreateApplicationController.ALLOWED_EXTENSIONS),
                    'questions': [
                        {
                            'id': 1,
                            'question': 'Why do you want to become an expert?',
                            'required': True
                        },
                        {
                            'id': 2,
                            'question': 'Describe your background and expertise in your field.',
                            'required': True
                        }
                    ]
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error getting requirements: {str(e)}'
            }), 500