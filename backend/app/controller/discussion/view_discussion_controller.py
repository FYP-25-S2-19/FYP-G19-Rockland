from flask import Blueprint, jsonify
from app.entity.discussion import Discussion
from app.entity.discussion_comment import DiscussionComment
from app.controller.authentication.permission_required import permission_required

view_discussion_blueprint = Blueprint('view_discussion', __name__)


class ViewDiscussionController:
    
    @staticmethod
    @view_discussion_blueprint.route('/api/discussions', methods=['GET'])
    @permission_required('has_premium_permission')
    def get_discussions(**kwargs):
        """Fetch all discussions for premium users"""
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Premium authentication required'
                }), 401
            
            print(f"📋 User {current_user.email} is viewing discussions")
            
            discussions = Discussion.query.order_by(Discussion.timestamp.desc()).all()
            return jsonify({
                "success": True,
                "discussions": [d.to_dict() for d in discussions]
            }), 200
            
        except Exception as e:
            print(f"Error in get_discussions controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching discussions: {str(e)}'
            }), 500
    
    @staticmethod
    @view_discussion_blueprint.route('/api/discussions/<int:discussion_id>', methods=['GET'])
    @permission_required('has_premium_permission')
    def get_discussion_detail(discussion_id, **kwargs):
        """Fetch discussion detail for premium users"""
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Premium authentication required'
                }), 401
            
            print(f"👁️ User {current_user.email} is viewing discussion {discussion_id}")
            
            discussion = Discussion.query.get(discussion_id)
            if not discussion:
                return jsonify({"success": False, "message": "Discussion not found"}), 404

            comments = DiscussionComment.query.filter_by(discussion_id=discussion_id).all()
            return jsonify({
                "success": True,
                "discussion": discussion.to_dict(),
                "comments": [c.to_dict() for c in comments]
            }), 200
            
        except Exception as e:
            print(f"Error in get_discussion_detail controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching discussion: {str(e)}'
            }), 500
    
    @staticmethod
    @view_discussion_blueprint.route('/api/discussions/admin/all', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_all_discussions_admin(**kwargs):
        """Fetch all discussions for admin view"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"📋 Admin {current_user.email} is viewing all discussions")
            
            # Use the entity method to get all discussions
            discussions_data, status_code = Discussion.getAllDiscussionsForAdmin()
            
            if discussions_data is not None:
                return jsonify({
                    'success': True,
                    'message': 'Discussions fetched successfully',
                    'discussions': discussions_data,
                    'total_count': len(discussions_data)
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to fetch discussions'
                }), status_code
                
        except Exception as e:
            print(f"Error in get_all_discussions_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching discussions: {str(e)}'
            }), 500
    
    @staticmethod
    @view_discussion_blueprint.route('/api/discussions/view/<int:discussion_id>', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_discussion_detail_admin(discussion_id, **kwargs):
        """When admin click view, shows the detail of the discussion"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"👁️ Admin {current_user.email} is viewing discussion details {discussion_id}")
            
            # Use the entity method to get discussion details
            discussion_data, status_code, message = Discussion.getDiscussionById(discussion_id)
            
            if discussion_data is not None:
                # Get comments for this discussion
                comments = DiscussionComment.query.filter_by(discussion_id=discussion_id).all()
                
                return jsonify({
                    'success': True,
                    'message': message,
                    'discussion': discussion_data,
                    'comments': [c.to_dict() for c in comments]
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in get_discussion_detail_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching discussion: {str(e)}'
            }), 500