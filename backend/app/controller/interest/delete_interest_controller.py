from flask import Blueprint, request, jsonify
from app.entity.interest import Interest
# Temporarily comment out the permission_required import
from app.controller.authentication.permission_required import permission_required

delete_interest_blueprint = Blueprint('delete_interest', __name__)

class DeleteInterestController:
    
    @staticmethod
    @delete_interest_blueprint.route('/api/interests/delete_interest', methods=['POST'])
    @permission_required('has_admin_permission')  # Temporarily commented out
    def delete_interest(**kwargs):
        try:
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({"success": False, "message": "No data provided"}), 400
            
            # Extract interest ID
            interest_id = data.get('id')
            
            # Validate interest ID
            if not interest_id:
                return jsonify({"success": False, "message": "Interest ID is required"}), 400
            
            # Try to convert interest_id to integer
            try:
                interest_id = int(interest_id)
            except (ValueError, TypeError):
                return jsonify({"success": False, "message": "Invalid interest ID format"}), 400
            
            # Use the entity's deleteInterest method
            success, status_code, message = Interest.deleteInterest(interest_id)
            
            if success:
                # Return success response
                return jsonify({
                    "success": True,
                    "message": message
                }), status_code
            else:
                # Return error response
                return jsonify({
                    "success": False,
                    "message": message
                }), status_code
                
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Error deleting interest: {str(e)}"
            }), 500