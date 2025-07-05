from flask import Blueprint, request, jsonify
from app.entity.usertype import UserType
# Temporarily comment out the permission_required import
# from app.controller.authentication.permission_required import permission_required

view_usertype_blueprint = Blueprint('view_usertype', __name__)

class ViewUserTypeController:
    # Get all user types for admin view (temporarily without auth for testing)
    @staticmethod
    @view_usertype_blueprint.route('/api/usertypes/all', methods=['GET'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
    def get_all_usertypes(**kwargs):
        try:
            usertypes = UserType.getAllUserTypes()
            
            if usertypes is not None:
                # Convert to list of dictionaries
                usertypes_data = [usertype.to_dict() for usertype in usertypes]
                return jsonify({"success": True, "usertypes": usertypes_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch user types"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500

    # View individual user type detail by ID (temporarily without auth for testing)
    @staticmethod
    @view_usertype_blueprint.route('/api/usertypes/view_usertype', methods=['GET'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
    def view_usertype(**kwargs):
        try:
            user_type_id = request.args.get('id')

            if not user_type_id:
                return jsonify({"success": False, "error": "ID parameter not provided"}), 400
            
            try:
                user_type_id = int(user_type_id)
            except ValueError:
                return jsonify({"success": False, "error": "Invalid ID format"}), 400

            usertype = UserType.queryUserType(user_type_id)

            if usertype:
                return jsonify({"success": True, "usertype": usertype.to_dict()}), 200
            else:
                return jsonify({"success": False, "error": "User type not found"}), 404
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
