from flask import Blueprint, request, jsonify
from app.entity.user import User

search_user_blueprint = Blueprint('search_user', __name__)

class SearchUserController:
    @search_user_blueprint.route('/api/users/search_user', methods=['POST'])
    def search_user():
        """
        Search users by first name, email, or date of birth using a single search term
        
        Expected JSON payload:
        {
            "search_term": "search value (can be email, first name, or DOB)"
        }
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    "success": False, 
                    "error": "No search data provided"
                }), 400
            
            # Extract search term
            search_term = data.get('search_term', '').strip() if data.get('search_term') else None
            
            # If no search term provided, return error
            if not search_term:
                return jsonify({
                    "success": False, 
                    "error": "Search term is required"
                }), 400
            
            # Call entity method to search users
            account_list, status_code = User.searchUserAccount(search_term=search_term)
            
            if status_code != 200:
                return jsonify({
                    "success": False, 
                    "error": "Error occurred while searching users"
                }), status_code
            
            return jsonify({
                "success": True, 
                "account_list": account_list,
                "total_results": len(account_list),
                "search_term": search_term
            }), 200
            
        except Exception as e:
            print(f"Error in search_user controller: {e}")
            return jsonify({
                "success": False, 
                "error": "Internal server error occurred during search"
            }), 500