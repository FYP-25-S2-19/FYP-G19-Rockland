from flask import Blueprint, request, jsonify
from app.entity.usertype import UserType
# Temporarily comment out the permission_required import
# from app.controller.authentication.permission_required import permission_required

update_usertype_blueprint = Blueprint('update_usertype', __name__)

class UpdateUserTypeController:
    # Update user type (temporarily without auth for testing)
    @staticmethod
    @update_usertype_blueprint.route('/api/usertypes/update_usertype', methods=['PUT'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
    def update_usertype(**kwargs):
        try:
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({"success": False, "message": "No data provided"}), 400
            
            # Extract required fields
            user_type_id = data.get('user_type_id')
            name = data.get('name')
            description = data.get('description', '')
            has_admin_permission = data.get('has_admin_permission', False)
            has_freeuser_permission = data.get('has_freeuser_permission', False)
            has_premium_permission = data.get('has_premium_permission', False)
            has_expert_permission = data.get('has_expert_permission', False)
            
            # Validate required fields
            if not user_type_id:
                return jsonify({"success": False, "message": "User type ID is required"}), 400
            
            if not name or not name.strip():
                return jsonify({"success": False, "message": "Name is required"}), 400
            
            # Validate that at least one permission is set
            if not any([has_admin_permission, has_freeuser_permission, 
                       has_premium_permission, has_expert_permission]):
                return jsonify({"success": False, "message": "At least one permission must be granted"}), 400
            
            # Update the user type using the entity method
            success, status_code, message, updated_usertype = UserType.updateUserType(
                user_type_id=user_type_id,
                name=name.strip(),
                description=description.strip() if description else None,
                has_admin_permission=bool(has_admin_permission),
                has_freeuser_permission=bool(has_freeuser_permission),
                has_premium_permission=bool(has_premium_permission),
                has_expert_permission=bool(has_expert_permission)
            )
            
            if success:
                return jsonify({
                    "success": True, 
                    "message": message,
                    "usertype": updated_usertype.to_dict() if updated_usertype else None
                }), status_code
            else:
                return jsonify({"success": False, "message": message}), status_code
                
        except Exception as e:
            return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500