from flask import Blueprint, request, jsonify
from app.entity.user import User
from app.entity.usertype import UserType
from app.models import db
from app.controller.authentication.permission_required import permission_required

upgrade_user_blueprint = Blueprint('upgrade_user', __name__)

class UpgradeUserController:
    @upgrade_user_blueprint.route('/api/users/upgrade', methods=['POST'])
    @permission_required('has_admin_permission')
    def upgrade_user(current_user=None):  # Add current_user parameter
        """
        Upgrade user type using the entity method
        """
        try:
            print(f"🎯 Current admin user: {current_user.email if current_user else 'None'}")
            
            upgrade_details = request.get_json()
            
            if not upgrade_details:
                return jsonify({
                    "success": False, 
                    "error": "No data provided"
                }), 400
            
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
            
            # Convert userId to integer if it's a string
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                return jsonify({
                    "success": False,
                    "error": "Invalid user ID format"
                }), 400
            
            # Use the entity method to upgrade user
            success, status_code, message, upgraded_user = User.upgradeUserType(
                user_id=user_id,
                target_user_type=target_user_type
            )
            
            if success and upgraded_user:
                return jsonify({
                    "success": True, 
                    "message": message,
                    "user": upgraded_user.to_dict()
                }), status_code
            else:
                return jsonify({
                    "success": False, 
                    "error": message
                }), status_code
            
        except Exception as e:
            print(f"Error in upgrade_user controller: {e}")
            return jsonify({
                "success": False, 
                "error": f"An error occurred while upgrading user: {str(e)}"
            }), 500