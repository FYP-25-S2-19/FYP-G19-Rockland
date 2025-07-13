from flask import Blueprint, request, jsonify
from app.entity.video import Video
from app.controller.authentication.permission_required import permission_required

view_video_blueprint = Blueprint('view_video', __name__)

class ViewVideoController:
    
    # PUBLIC ENDPOINT - Get most recent video for landing page
    @staticmethod
    @view_video_blueprint.route('/api/videos', methods=['GET'])
    def get_latest_video():
        """Get the most recent video for landing page"""
        try:
            print("🔍 /api/videos endpoint called")
            
            # Get the most recent video
            latest_video = Video.getLatestVideo()
            
            if latest_video:
                print(f"✅ Latest video found: {latest_video.name} (ID: {latest_video.video_id})")
                video_dict = latest_video.to_dict()
                print(f"📊 Video URL: {video_dict.get('signed_video_url', 'No URL')}")
                return jsonify(video_dict), 200
            else:
                print("❌ No videos found in database")
                return jsonify({"error": "No videos available"}), 404
                
        except Exception as e:
            print(f"❌ Error fetching latest video: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Server error: {str(e)}"}), 500

    # ADMIN ENDPOINT - Get all videos for admin management (following Article pattern)
    @staticmethod
    @view_video_blueprint.route('/api/videos/admin/all', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_all_videos_admin(**kwargs):
        """Fetch all videos for admin view (following Article pattern)"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"📋 Admin {current_user.email} is viewing all videos")
            
            # Get all videos
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
            print(f"Error in get_all_videos_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching videos: {str(e)}'
            }), 500
    
    # ADMIN ENDPOINT - Get video detail (following Article pattern)
    @staticmethod
    @view_video_blueprint.route('/api/videos/view/<int:video_id>', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_video_detail_admin(video_id, **kwargs):
        """When admin clicks view, shows the detail of the video"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"👁️ Admin {current_user.email} is viewing video details {video_id}")
            
            # Get video by ID
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
            print(f"Error in get_video_detail_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching video: {str(e)}'
            }), 500