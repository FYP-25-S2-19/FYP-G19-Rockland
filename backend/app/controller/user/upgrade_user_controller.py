from flask import Blueprint, request, jsonify
from app.entity.user import User
from app.entity.usertype import UserType
from app.models import db
from app.controller.authentication.permission_required import permission_required

upgrade_user_blueprint = Blueprint('upgrade_user', __name__)

class UpgradeUserController:
    @upgrade_user_blueprint.route('/api/users/upgrade', methods=['POST'])
    def upgrade_user():
        """
        Upgrade user type with the following rules:
        - Free users can be upgraded to Premium or Expert
        - Premium users can only be upgraded to Expert
        - Expert users cannot be upgraded further
        """
        try:
            upgrade_details = request.get_json()
            
            user_id = upgrade_details.get('userId')
            target_user_type = upgrade_details.get('targetUserType')  # 'Premium' or 'Expert'
            
            if not user_id:
                return jsonify({
                    "success": False, 
                    "error": "User ID is required"
                }), 400
            
            if not target_user_type:
                return jsonify({
                    "success": False, 
                    "error": "Target user type is required"
                }), 400
            
            # Get the user
            user = User.queryUserById(user_id)
            if not user:
                return jsonify({
                    "success": False, 
                    "error": "User not found"
                }), 404
            
            # Get current user type
            current_user_type = user.user_type
            if not current_user_type:
                return jsonify({
                    "success": False, 
                    "error": "User type not found"
                }), 404
            
            # Get target user type from database
            target_type_obj = UserType.queryUserTypeByName(target_user_type)
            if not target_type_obj:
                return jsonify({
                    "success": False, 
                    "error": f"Target user type '{target_user_type}' not found"
                }), 404
            
            # Check upgrade rules
            current_type_name = current_user_type.name
            
            if current_type_name == 'Expert':
                return jsonify({
                    "success": False, 
                    "error": "Expert users cannot be upgraded further"
                }), 400
            
            elif current_type_name == 'Free':
                # Free users can upgrade to Premium or Expert
                if target_user_type not in ['Premium', 'Expert']:
                    return jsonify({
                        "success": False, 
                        "error": "Free users can only be upgraded to Premium or Expert"
                    }), 400
            
            elif current_type_name == 'Premium':
                # Premium users can only upgrade to Expert
                if target_user_type != 'Expert':
                    return jsonify({
                        "success": False, 
                        "error": "Premium users can only be upgraded to Expert"
                    }), 400
            
            else:
                return jsonify({
                    "success": False, 
                    "error": f"Unknown current user type: {current_type_name}"
                }), 400
            
            # Check if user is already at target type
            if current_type_name == target_user_type:
                return jsonify({
                    "success": False, 
                    "error": f"User is already a {target_user_type} user"
                }), 400
            
            # Perform the upgrade
            user.user_type_id = target_type_obj.user_type_id
            db.session.commit()
            
            return jsonify({
                "success": True, 
                "message": f"User successfully upgraded from {current_type_name} to {target_user_type}",
                "user": user.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error upgrading user: {e}")
            return jsonify({
                "success": False, 
                "error": f"An error occurred while upgrading user: {str(e)}"
            }), 500

