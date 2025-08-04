from flask import Blueprint, jsonify
from app.entity.rock import Rock
from app.entity.comment_rock import CommentRock
from app.controller.authentication.permission_required import permission_required

view_rock_blueprint = Blueprint("view_rock", __name__)

@view_rock_blueprint.route("/api/viewrock/<int:rock_id>", methods=["GET"])
@permission_required([])  # Public for all logged in users
def get_rock_detail_with_comments(rock_id, **kwargs):
    current_user = kwargs.get("current_user")
    rock = Rock.get_rock_by_id(rock_id)

    if not rock:
        return jsonify({"success": False, "message": "Rock not found"}), 404

    # ✅ Use sorted + like-status method
    success, status, msg, comments_data = CommentRock.get_comments_with_like_status(
        rock_id, current_user.user_id
    )

    return jsonify({
        "success": success,
        "rock": rock.to_dict(),
        "comments": comments_data,
        "total_comments": sum(1 + len(c["replies"]) for c in comments_data)
    }), status

@view_rock_blueprint.route('/api/rocks/admin/all', methods=['GET'])
@permission_required('has_admin_permission')
def get_all_rocks_admin(**kwargs):
    """Fetch all rocks for admin view"""
    try:
        # Access current admin user from permission decorator
        current_user = kwargs.get('current_user')
        if not current_user:
            return jsonify({
                'success': False,
                'message': 'Admin authentication required'
            }), 401
            
        print(f"🪨 Admin {current_user.email} is viewing all rocks")
            
        # Use the entity method to get all rocks
        rocks_data, status_code = Rock.getAllRocksForAdmin()
            
        if rocks_data is not None:
            return jsonify({
                'success': True,
                'message': 'Rocks fetched successfully',
                'rocks': rocks_data,
                'total_count': len(rocks_data)
            }), status_code
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to fetch rocks'
            }), status_code
                
    except Exception as e:
        print(f"Error in get_all_rocks_admin controller: {e}")
        return jsonify({
            'success': False,
            'message': f'Error fetching rocks: {str(e)}'
        }), 500
    
@view_rock_blueprint.route('/api/rocks/admin/all-with-images', methods=['GET'])
@permission_required('has_admin_permission')
def get_all_rocks_admin_with_images(**kwargs):
    """Fetch all rocks for admin view with processed image URLs"""
    try:
        current_user = kwargs.get('current_user')
        if not current_user:
            return jsonify({
                'success': False,
                'message': 'Admin authentication required'
            }), 401
            
        print(f"🪨 Admin {current_user.email} is viewing all rocks with images")
        
        # Use the entity method that handles image processing
        rocks_data, status_code = Rock.getAllRocksForAdminWithImages()
        
        if rocks_data is not None:
            return jsonify({
                'success': True,
                'message': 'Rocks with images fetched successfully',
                'rocks': rocks_data,
                'total_count': len(rocks_data)
            }), status_code
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to fetch rocks with images'
            }), status_code
                
    except Exception as e:
        print(f"Error in get_all_rocks_admin_with_images controller: {e}")
        return jsonify({
            'success': False,
            'message': f'Error fetching rocks: {str(e)}'
        }), 500