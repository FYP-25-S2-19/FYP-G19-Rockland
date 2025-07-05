from flask import Blueprint, request, jsonify
from app.entity.user import User
# Temporarily comment out the permission_required import
from app.controller.authentication.permission_required import permission_required

view_user_blueprint = Blueprint('view_user', __name__)

class ViewUserController:
    @staticmethod
    @view_user_blueprint.route('/api/users/all', methods=['GET'])
    def get_all_users(**kwargs):
        try:
            users_data, status_code = User.getAllUsers()
            
            if users_data is not None:
                return jsonify({
                    "success": True, 
                    "users": users_data,
                    "message": f"Retrieved {len(users_data)} users"
                }), status_code
            else:
                return jsonify({
                    "success": False, 
                    "error": "Failed to fetch users"
                }), status_code
        except Exception as e:
            print(f"Error in get_all_users: {e}")
            return jsonify({
                "success": False, 
                "error": f"Error: {str(e)}"
            }), 500

    @staticmethod
    @view_user_blueprint.route('/api/users/view_user', methods=['GET'])
    def view_user(**kwargs):
        try:
            user_email = request.args.get('email')

            if not user_email:
                return jsonify({
                    "success": False, 
                    "error": "Email parameter not provided"
                }), 400
            
            user, status_code = User.viewUserAccount(user_email)

            if user:
                return jsonify({
                    "success": True, 
                    "user": user,
                    "message": f"User details retrieved for {user_email}"
                }), status_code
            else:
                return jsonify({
                    "success": False, 
                    "error": "User not found"
                }), status_code
        except Exception as e:
            print(f"Error in view_user: {e}")
            return jsonify({
                "success": False, 
                "error": f"Error: {str(e)}"
            }), 500

