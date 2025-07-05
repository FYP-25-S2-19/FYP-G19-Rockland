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

    # View individual user detail by email (temporarily without auth for testing)
    @staticmethod
    @view_user_blueprint.route('/api/users/view_user', methods=['GET'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
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

    # Search users - Add this new endpoint (without auth)
    @staticmethod
    @view_user_blueprint.route('/api/users/search_user', methods=['POST'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
    def search_users(**kwargs):
        try:
            request_data = request.get_json()
            
            if not request_data:
                return jsonify({
                    "success": False,
                    "error": "No search data provided"
                }), 400
            
            search_term = request_data.get('search_term', '').strip()
            
            # Use the searchUserAccount method from User entity
            users_data, status_code = User.searchUserAccount(search_term)
            
            if users_data is not None:
                return jsonify({
                    "success": True,
                    "account_list": users_data,
                    "total_found": len(users_data),
                    "search_term": search_term,
                    "message": f"Found {len(users_data)} users matching '{search_term}'"
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "error": "Failed to search users"
                }), status_code
                
        except Exception as e:
            print(f"Error in search_users: {e}")
            return jsonify({
                "success": False,
                "error": f"Search failed: {str(e)}"
            }), 500