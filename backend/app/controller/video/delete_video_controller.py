# Libraries
from flask import Blueprint, request, jsonify

# Local dependencies
from app.entity.video import Video
from app.models import db
from app.controller.authentication.permission_required import permission_required

delete_video_blueprint = Blueprint('delete_video', __name__)

class DeleteVideoController:
    
    @staticmethod
    @delete_video_blueprint.route('/api/videos/delete/<int:video_id>', methods=['DELETE'])
    @permission_required('has_admin_permission')  
    def delete_video(video_id, **kwargs):
        """Delete a video by ID"""
        try:
            # Access current user
            current_user = kwargs.get('current_user')
            if current_user:
                print(f"🎯 Admin user {current_user.email} is deleting video ID: {video_id}")
            
            # Use entity method to handle video deletion
            success, status_code, message = Video.deleteVideoById(video_id)
            
            if success:
                return jsonify({
                    "success": True,
                    "message": message
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "message": message
                }), status_code
                
        except Exception as e:
            print(f"Error in delete_video controller: {e}")
            return jsonify({
                "success": False,
                "message": f"Error deleting video: {str(e)}"
            }), 500