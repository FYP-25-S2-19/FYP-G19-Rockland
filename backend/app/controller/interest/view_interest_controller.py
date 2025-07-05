from flask import Blueprint, request, jsonify
from app.entity.interest import Interest
# Temporarily comment out the permission_required import
from app.controller.authentication.permission_required import permission_required

view_interest_blueprint = Blueprint('view_interest', __name__)

class ViewInterestController:
    
    # Get all interests for admin view
    @staticmethod
    @view_interest_blueprint.route('/api/interests/all', methods=['GET'])
    @permission_required('has_admin_permission')  # Temporarily commented out
    def get_all_interests(**kwargs):
        try:
            interests = Interest.getAllInterests()
            
            if interests is not None:
                # Convert to list of dictionaries
                interests_data = [interest.to_dict() for interest in interests]
                return jsonify({"success": True, "interests": interests_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch interests"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500