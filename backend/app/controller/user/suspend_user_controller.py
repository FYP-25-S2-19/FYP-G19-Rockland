# Suspend User Controller
from flask import Blueprint, request, jsonify
from app.entity.user import User
# from app.controller.authentication.permission_required import permission_required

suspend_user_blueprint = Blueprint('suspend_user', __name__)

class SuspendUserController:
    @suspend_user_blueprint.route('/api/users/suspend', methods=['POST'])
    # @permission_required('has_admin_permission')
    def suspend_user():
        try:
            request_data = request.get_json()
            
            if not request_data:
                return jsonify({
                    "success": False,
                    "error": "No data provided"
                }), 400
            
            user_id = request_data.get('userId')
            
            if not user_id:
                return jsonify({
                    "success": False,
                    "error": "User ID is required"
                }), 400
            
            # Convert userId to integer if it's a string
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                return jsonify({
                    "success": False,
                    "error": "Invalid user ID format"
                }), 400
            
            # Call the suspend method
            success, status_code, message, suspended_user = User.suspendUserAccount(user_id)
            
            if success:
                return jsonify({
                    "success": True,
                    "message": message,
                    "user": suspended_user.to_dict() if suspended_user else None
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "error": message
                }), status_code
                
        except Exception as e:
            print(f"Error in suspend_user controller: {e}")
            return jsonify({
                "success": False,
                "error": "An unexpected error occurred"
            }), 500
