from flask import Blueprint, request, jsonify
from app.entity.interest import Interest
# Temporarily comment out the permission_required import
# from app.controller.authentication.permission_required import permission_required

create_interest_blueprint = Blueprint('create_interest', __name__)

class CreateInterestController:
    
    @staticmethod
    @create_interest_blueprint.route('/api/interests/create_interest', methods=['POST'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
    def create_interest(**kwargs):
        try:
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({"success": False, "message": "No data provided"}), 400
            
            # Extract required fields
            title = data.get('title', '').strip()
            description = data.get('description', '').strip()
            categories_id = data.get('categories_id')
            
            # Validate required fields
            if not title:
                return jsonify({"success": False, "message": "Interest title is required"}), 400
            
            if not description:
                return jsonify({"success": False, "message": "Interest description is required"}), 400
            
            if not categories_id:
                return jsonify({"success": False, "message": "Category ID is required"}), 400
            
            # Try to convert categories_id to integer
            try:
                categories_id = int(categories_id)
            except (ValueError, TypeError):
                return jsonify({"success": False, "message": "Invalid category ID format"}), 400
            
            # Use the entity's createInterest method
            success, status_code, message, new_interest = Interest.createInterest(
                title=title,
                description=description,
                categories_id=categories_id
            )
            
            if success:
                # Return success response with created interest data
                return jsonify({
                    "success": True,
                    "message": message,
                    "interest": new_interest.to_dict() if new_interest else None
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
                "message": f"Error creating interest: {str(e)}"
            }), 500