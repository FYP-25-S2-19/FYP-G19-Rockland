from flask import Blueprint, request, jsonify
from app.entity.user import User
# Temporarily comment out the permission_required import
# from app.controller.authentication.permission_required import permission_required

view_user_blueprint = Blueprint('view_user', __name__)

class ViewUserController:
    # Get all users for admin view (temporarily without auth for testing)
    @staticmethod
    @view_user_blueprint.route('/api/users/all', methods=['GET'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
    def get_all_users(**kwargs):
        try:
            users_data, status_code = User.getAllUsers()
            
            if users_data is not None:
                return jsonify({"success": True, "users": users_data}), status_code
            else:
                return jsonify({"success": False, "error": "Failed to fetch users"}), status_code
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500

    # View individual user detail by email (temporarily without auth for testing)
    @staticmethod
    @view_user_blueprint.route('/api/users/view_user', methods=['GET'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
    def view_user(**kwargs):
        try:
            user_email = request.args.get('email')

            if not user_email:
                return jsonify({"success": False, "error": "Email parameter not provided"}), 400
            
            user, status_code = User.viewUserAccount(user_email)

            if user:
                return jsonify({"success": True, "user": user}), status_code
            else:
                return jsonify({"success": False, "error": "User not found"}), status_code
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500