from flask import Blueprint, request, jsonify
from app.entity.usertype import UserType
# Temporarily comment out the permission_required import
from app.controller.authentication.permission_required import permission_required

update_usertype_blueprint = Blueprint('update_usertype', __name__)

class UpdateUserTypeController:
    # Update user type (temporarily without auth for testing)
    @staticmethod
    @update_usertype_blueprint.route('/api/usertypes/update_usertype', methods=['PUT'])
    @permission_required('has_admin_permission')  # Temporarily commented out
    def update_usertype(**kwargs):
        try:
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({
                    "success": False, 
                    "message": "No data provided"
                }), 400
            
            # Extract required fields
            user_type_id = data.get('user_type_id')
            name = data.get('name')
            description = data.get('description', '')
            has_admin_permission = data.get('has_admin_permission', False)
            has_freeuser_permission = data.get('has_freeuser_permission', False)
            has_premium_permission = data.get('has_premium_permission', False)
            has_expert_permission = data.get('has_expert_permission', False)
            
            # Basic request validation only
            if not user_type_id:
                return jsonify({
                    "success": False, 
                    "message": "User type ID is required"
                }), 400
            
            # Convert user_type_id to integer if it's a string
            try:
                user_type_id = int(user_type_id)
            except (ValueError, TypeError):
                return jsonify({
                    "success": False,
                    "message": "Invalid user type ID format"
                }), 400
            
            # Use the entity method to update user type
            success, status_code, message, updated_usertype = UserType.updateUserType(
                user_type_id=user_type_id,
                name=name,
                description=description,
                has_admin_permission=has_admin_permission,
                has_freeuser_permission=has_freeuser_permission,
                has_premium_permission=has_premium_permission,
                has_expert_permission=has_expert_permission
            )
            
            if success and updated_usertype:
                return jsonify({
                    "success": True, 
                    "message": message,
                    "usertype": updated_usertype.to_dict()
                }), status_code
            else:
                return jsonify({
                    "success": False, 
                    "message": message
                }), status_code
                
        except Exception as e:
            return jsonify({
                "success": False, 
                "message": f"Error updating user type: {str(e)}"
            }), 500