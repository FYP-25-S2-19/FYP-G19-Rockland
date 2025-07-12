from flask import Blueprint, request, jsonify
from app.entity.application import Application
from app.controller.authentication.permission_required import permission_required

create_application_blueprint = Blueprint('create_application', __name__)

class CreateApplicationController:

    @staticmethod
    @create_application_blueprint.route('/api/applications/create', methods=['POST'])
    @permission_required([])
    def create_application(**kwargs):
        """Pass parsed application data to the entity"""
        try:
            current_user = kwargs.get('current_user')
            user_id = current_user.user_id if current_user else None

            if not user_id:
                return jsonify({
                    'success': False,
                    'message': 'Authentication failed. User not found.'
                }), 401

            # Extract answers
            answer1 = request.form.get('answer1', '').strip()
            answer2 = request.form.get('answer2', '').strip()

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

            # Extract uploaded files
            uploaded_files = request.files.getlist('files')

            # Pass everything to the entity
            success, status_code, message, new_application = Application.createApplication(
                user_id=user_id,
                answers_data=answers_data,
                files_data=uploaded_files  # pass raw FileStorage objects
            )

            if not success:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code

            return jsonify({
                'success': True,
                'message': message,
                'application': new_application.to_dict()
            }), status_code

        except Exception as e:
            print(f"❌ Error in create_application controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating application: {str(e)}'
            }), 500

    @staticmethod
    @create_application_blueprint.route('/api/applications/upload-requirements', methods=['GET'])
    def get_upload_requirements():
        """Send upload instructions to frontend"""
        try:
            return jsonify({
                'success': True,
                'requirements': {
                    'max_files': 10,
                    'max_file_size_mb': 16,
                    'allowed_extensions': [
                        'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'
                    ],
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
