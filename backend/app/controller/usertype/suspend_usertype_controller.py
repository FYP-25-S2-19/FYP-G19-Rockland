# Suspend UserType Controller
from flask import Blueprint, request, jsonify
from app.entity.usertype import UserType
# Temporarily comment out the permission_required import
# from app.controller.authentication.permission_required import permission_required

suspend_usertype_blueprint = Blueprint('suspend_usertype', __name__)

class SuspendUserTypeController:
    @staticmethod
    @suspend_usertype_blueprint.route('/api/usertypes/suspend', methods=['POST'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
    def suspend_usertype(**kwargs):
        try:
            request_data = request.get_json()
            
            if not request_data:
                return jsonify({
                    "success": False,
                    "error": "No data provided"
                }), 400
            
            user_type_id = request_data.get('userTypeId')
            
            if not user_type_id:
                return jsonify({
                    "success": False,
                    "error": "User Type ID is required"
                }), 400
            
            # Convert userTypeId to integer if it's a string
            try:
                user_type_id = int(user_type_id)
            except (ValueError, TypeError):
                return jsonify({
                    "success": False,
                    "error": "Invalid user type ID format"
                }), 400
            
            # Use the entity method to suspend user type
            success, status_code, message, suspended_usertype = UserType.suspendUserType(user_type_id)
            
            if success and suspended_usertype:
                return jsonify({
                    "success": True,
                    "message": message,
                    "usertype": suspended_usertype.to_dict()
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "error": message
                }), status_code
                
        except Exception as e:
            print(f"Error in suspend_usertype controller: {e}")
            return jsonify({
                "success": False,
                "error": f"An error occurred while suspending user type: {str(e)}"
            }), 500