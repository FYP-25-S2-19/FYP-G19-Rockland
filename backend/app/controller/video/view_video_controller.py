from flask import Blueprint, request, jsonify
from app.entity.video import Video
from app.controller.authentication.permission_required import permission_required

view_video_blueprint = Blueprint('view_video', __name__)

class ViewVideoController:
    
    # PUBLIC ENDPOINT - Get all SELECTED videos only
    @staticmethod
    @view_video_blueprint.route('/api/videos/all', methods=['GET'])
    def get_all_selected_videos():
        """Get all SELECTED videos for landing page"""
        try:
            selected_videos = Video.getSelectedVideos()
            
            return jsonify({
                'success': True,
                'videos': [video.to_dict() for video in selected_videos],
                'count': len(selected_videos)
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f"Server error: {str(e)}"
            }), 500

    # ADMIN ENDPOINT - Toggle video selection
    @staticmethod
    @view_video_blueprint.route('/api/videos/toggle-selection/<int:video_id>', methods=['POST'])
    @permission_required('has_admin_permission')
    def toggle_video_selection(video_id, **kwargs):
        """Toggle video selection for landing page display"""
        try:
            success, status_code, message = Video.toggleVideoSelection(video_id)
            
            if success:
                video = Video.getVideoById(video_id)
                return jsonify({
                    'success': True,
                    'message': message,
                    'video': video.to_dict() if video else None
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error: {str(e)}'
            }), 500

    # Keep your existing admin endpoints unchanged...
    @staticmethod
    @view_video_blueprint.route('/api/videos/admin/all', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_all_videos_admin(**kwargs):
        """Fetch all videos for admin view"""
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            videos = Video.getAllVideos()
            
            if videos is not None:
                videos_data = [video.to_dict() for video in videos]
                return jsonify({
                    'success': True,
                    'message': 'Videos fetched successfully',
                    'videos': videos_data,
                    'total_count': len(videos_data)
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to fetch videos'
                }), 500
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error fetching videos: {str(e)}'
            }), 500

    @staticmethod
    @view_video_blueprint.route('/api/videos/view/<int:video_id>', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_video_detail_admin(video_id, **kwargs):
        """When admin clicks view, shows the detail of the video"""
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            video = Video.getVideoById(video_id)
            
            if video:
                return jsonify({
                    'success': True,
                    'message': 'Video found',
                    'video': video.to_dict()
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Video not found'
                }), 404
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error fetching video: {str(e)}'
            }), 500