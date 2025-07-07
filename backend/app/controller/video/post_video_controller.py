from flask import Blueprint, request, jsonify

# Update imports to match your project structure
from app.models import db
from app.entity.video import Video
from app.controller.authentication.permission_required import permission_required

post_video_blueprint = Blueprint('post_video', __name__)

class PostVideoController:
    
    @staticmethod
    @post_video_blueprint.route('/api/videos/upload', methods=['POST'])
    @permission_required('has_admin_permission')  
    def upload_video(**kwargs):
        """Upload a new video file"""
        try:
            # Access current user
            current_user = kwargs.get('current_user')
            user_id = current_user.user_id if current_user else 1
            
            if current_user:
                print(f"🎯 Admin user {current_user.email} is uploading a new video")
            
            # Check if file is in request
            if 'video_file' not in request.files:
                return jsonify({
                    'success': False,
                    'message': 'No video file provided'
                }), 400
            
            file = request.files['video_file']
            
            # Check if file is selected
            if file.filename == '':
                return jsonify({
                    'success': False,
                    'message': 'No file selected'
                }), 400
            
            # Get form data
            name = request.form.get('name', '').strip()
            description = request.form.get('description', '').strip()
            remarks = request.form.get('remarks', '').strip()
            
            # Basic validation
            if not name:
                return jsonify({
                    'success': False,
                    'message': 'Video name is required'
                }), 400
            
            # Use entity method to handle file upload and creation
            success, status_code, message, new_video = Video.createVideoWithFile(
                name=name,
                description=description if description else None,
                user_id=user_id,
                video_file=file,
                remarks=remarks if remarks else None
            )
            
            if success and new_video:
                return jsonify({
                    'success': True,
                    'message': message,
                    'video': new_video.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in upload_video controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error uploading video: {str(e)}'
            }), 500