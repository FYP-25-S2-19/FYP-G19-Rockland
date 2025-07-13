from flask import Blueprint, request, jsonify
from app.entity.applink import AppLink
from app.controller.authentication.permission_required import permission_required

delete_applink_blueprint = Blueprint('delete_applink', __name__)

class DeleteAppLinkController:
    
    @staticmethod
    @delete_applink_blueprint.route('/api/applinks/delete_applink', methods=['POST'])
    @permission_required('has_admin_permission')
    def delete_applink(**kwargs):
        try:
            # Access current user
            current_user = kwargs.get('current_user')
            
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({"success": False, "message": "No data provided"}), 400
            
            # Extract applink ID
            applink_id = data.get('id')
            
            # Validate applink ID
            if not applink_id:
                return jsonify({"success": False, "message": "AppLink ID is required"}), 400
            
            # Try to convert applink_id to integer
            try:
                applink_id = int(applink_id)
            except (ValueError, TypeError):
                return jsonify({"success": False, "message": "Invalid AppLink ID format"}), 400
            
            # Use the entity's deleteAppLink method
            success, status_code, message = AppLink.deleteAppLink(applink_id, current_user.user_id if current_user else None)
            
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
                "message": f"Error deleting app link: {str(e)}"
            }), 500