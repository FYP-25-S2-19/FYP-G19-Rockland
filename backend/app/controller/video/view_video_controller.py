from flask import Blueprint, request, jsonify
from app.entity.video import Video
# Temporarily comment out the permission_required import
from app.controller.authentication.permission_required import permission_required

view_video_blueprint = Blueprint('view_video', __name__)

class ViewVideoController:
    
    # Get all videos for admin view
    @staticmethod
    @view_video_blueprint.route('/api/videos/all', methods=['GET'])
    @permission_required('has_admin_permission')  # Only admins can view all videos
    def get_all_videos(**kwargs):
        try:
            videos = Video.getAllVideos()
            
            if videos is not None:
                # Convert to list of dictionaries
                videos_data = [video.to_dict() for video in videos]
                return jsonify({"success": True, "videos": videos_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch videos"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500