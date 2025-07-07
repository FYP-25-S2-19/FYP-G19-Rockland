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
            
            applink, status_code = AppLink.viewAppLink(applink_id)

            if applink:
                return jsonify({
                    "success": True, 
                    "applink": applink,
                    "message": f"AppLink details retrieved for ID {applink_id}"
                }), status_code
            else:
                return jsonify({
                    "success": False, 
                    "error": "AppLink not found"
                }), status_code
        except Exception as e:
            print(f"Error in view_applink: {e}")
            return jsonify({
                "success": False, 
                "error": f"Error: {str(e)}"
            }), 500