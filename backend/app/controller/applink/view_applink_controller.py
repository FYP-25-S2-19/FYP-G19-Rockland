from flask import Blueprint, request, jsonify, redirect
from app.entity.applink import AppLink
from app.controller.authentication.permission_required import permission_required

view_applink_blueprint = Blueprint('view_applink', __name__)

class ViewAppLinkController:
    
    # Get all applinks for admin view
    @staticmethod
    @view_applink_blueprint.route('/api/applinks/all', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_all_applinks(**kwargs):
        try:
            applinks = AppLink.getAllAppLinks()
            
            if applinks is not None:
                # Convert to list of dictionaries
                applinks_data = [applink.to_dict() for applink in applinks]
                return jsonify({"success": True, "applinks": applinks_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch app links"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Public endpoint to get all app links (no authentication required)
    @staticmethod
    @view_applink_blueprint.route('/api/applinks', methods=['GET'])
    def get_public_applinks():
        """Get all app links for public use (no authentication required)"""
        try:
            applinks = AppLink.getAllAppLinks()
            
            if applinks is not None:
                # Convert to list of dictionaries
                applinks_data = [applink.to_dict() for applink in applinks]
                return jsonify({
                    "success": True, 
                    "applinks": applinks_data,
                    "count": len(applinks_data)
                }), 200
            else:
                return jsonify({
                    "success": False, 
                    "error": "Failed to fetch app links",
                    "applinks": []
                }), 500
        except Exception as e:
            return jsonify({
                "success": False, 
                "error": f"Error: {str(e)}",
                "applinks": []
            }), 500
    
    # Public redirect endpoint for app store links
    @staticmethod
    @view_applink_blueprint.route('/appstore/<platform>', methods=['GET'])
    def redirect_to_appstore(platform):
        try:
            # Get the applink based on platform (ios/android)
            success, status_code, message, applink = AppLink.getAppLinkByPlatform(platform.lower())
            
            if success and applink and applink.link_attached:
                # Redirect to the app store URL
                return redirect(applink.link_attached, code=302)
            else:
                return jsonify({
                    "success": False,
                    "message": f"App store link not found for platform: {platform}"
                }), 404
                
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Error redirecting to app store: {str(e)}"
            }), 500
    
    # Admin endpoint to get specific applink by ID
    @staticmethod
    @view_applink_blueprint.route('/api/applinks/view_applink', methods=['GET'])
    @permission_required('has_admin_permission')
    def view_applink(**kwargs):
        try:
            applink_id = request.args.get('id')

            if not applink_id:
                return jsonify({
                    "success": False, 
                    "error": "ID parameter not provided"
                }), 400
            
            # Try to convert to integer
            try:
                applink_id = int(applink_id)
            except (ValueError, TypeError):
                return jsonify({
                    "success": False, 
                    "error": "Invalid ID format"
                }), 400
            
            # Entity handles validation
            applink, status_code = AppLink.viewAppLink(applink_id)

            if applink:
                return jsonify({
                    "success": True, 
                    "applink": applink,
                    "message": f"AppLink details retrieved for ID {applink_id}"
                }), status_code
            else:
                error_message = "Invalid ID format" if status_code == 400 else "AppLink not found"
                return jsonify({
                    "success": False, 
                    "error": error_message
                }), status_code
        except Exception as e:
            print(f"Error in view_applink: {e}")
            return jsonify({
                "success": False, 
                "error": f"Error: {str(e)}"
            }), 500
    
    # Admin endpoint to create new app link
    @staticmethod
    @view_applink_blueprint.route('/api/applinks/create', methods=['POST'])
    @permission_required('has_admin_permission')
    def create_applink(**kwargs):
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    "success": False,
                    "error": "No data provided"
                }), 400
            
            # Get user_id from the permission_required decorator
            user_id = kwargs.get('user_id', 1)  # Default to 1 if not available
            
            # Entity handles all validation
            success, status_code, message, applink = AppLink.createAppLink(
                name=data.get('name'),
                user_id=user_id,
                link_attached=data.get('link_attached')
            )
            
            if success:
                return jsonify({
                    "success": True,
                    "message": message,
                    "applink": applink.to_dict()
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "error": message
                }), status_code
                
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Error creating app link: {str(e)}"
            }), 500
    
    # Admin endpoint to delete app link
    @staticmethod
    @view_applink_blueprint.route('/api/applinks/delete/<int:applink_id>', methods=['DELETE'])
    @permission_required('has_admin_permission')
    def delete_applink(applink_id, **kwargs):
        try:
            user_id = kwargs.get('user_id', None)
            
            success, status_code, message = AppLink.deleteAppLink(applink_id, user_id)
            
            return jsonify({
                "success": success,
                "message": message
            }), status_code
                
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Error deleting app link: {str(e)}"
            }), 500