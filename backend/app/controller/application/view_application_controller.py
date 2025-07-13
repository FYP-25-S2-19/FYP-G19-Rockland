from flask import Blueprint, request, jsonify
from app.entity.application import Application
from app.controller.authentication.permission_required import permission_required

view_application_blueprint = Blueprint('view_application', __name__)

class ViewApplicationController:
    
    # Get all applications for admin view (both pending and past)
    @staticmethod
    @view_application_blueprint.route('/api/applications/all', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_all_applications(**kwargs):
        """Get all applications for admin dashboard"""
        try:
            applications = Application.getAllApplications()
            
            if applications is not None:
                # Use to_dict_detailed() to include user information
                applications_data = [app.to_dict_detailed() for app in applications]
                return jsonify({"success": True, "applications": applications_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch applications"}), 500
        except Exception as e:
            print(f"Error in get_all_applications: {e}")
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get pending applications only
    @staticmethod
    @view_application_blueprint.route('/api/applications/pending', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_pending_applications(**kwargs):
        """Get only pending applications"""
        try:
            applications = Application.getApplicationsByStatus('Pending')
            
            if applications is not None:
                # Use to_dict_detailed() to include user information
                applications_data = [app.to_dict_detailed() for app in applications]
                return jsonify({"success": True, "applications": applications_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch pending applications"}), 500
        except Exception as e:
            print(f"Error in get_pending_applications: {e}")
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get past applications (approved/rejected)
    @staticmethod
    @view_application_blueprint.route('/api/applications/past', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_past_applications(**kwargs):
        """Get processed applications (approved/rejected)"""
        try:
            applications = Application.getPastApplications()
            
            if applications is not None:
                # Use to_dict_detailed() to include user information
                applications_data = [app.to_dict_detailed() for app in applications]
                return jsonify({"success": True, "applications": applications_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch past applications"}), 500
        except Exception as e:
            print(f"Error in get_past_applications: {e}")
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get specific application details by ID
    @staticmethod
    @view_application_blueprint.route('/api/applications/view/<int:application_id>', methods=['GET'])
    @permission_required('has_admin_permission')
    def view_application_details(application_id, **kwargs):
        """Get detailed application information including answers and files"""
        try:
            application, status_code = Application.viewApplicationDetails(application_id)
            
            if application:
                return jsonify({
                    "success": True, 
                    "application": application
                }), status_code
            else:
                return jsonify({
                    "success": False, 
                    "error": "Application not found"
                }), status_code
            
        except Exception as e:
            print(f"Error in view_application_details: {e}")
            return jsonify({
                "success": False, 
                "error": f"Error: {str(e)}"
            }), 500
    
    # Alternative endpoint using query parameter
    @staticmethod
    @view_application_blueprint.route('/api/applications/view', methods=['GET'])
    @permission_required('has_admin_permission')
    def view_application_by_param(**kwargs):
        """Get application details using query parameter"""
        try:
            application_id = request.args.get('id')

            if not application_id:
                return jsonify({
                    "success": False, 
                    "error": "Application ID parameter not provided"
                }), 400
            
            # Try to convert to integer
            try:
                application_id = int(application_id)
            except (ValueError, TypeError):
                return jsonify({
                    "success": False, 
                    "error": "Invalid application ID format"
                }), 400
            
            # Use entity method
            application, status_code = Application.viewApplicationDetails(application_id)
            
            if application:
                return jsonify({
                    "success": True, 
                    "application": application
                }), status_code
            else:
                return jsonify({
                    "success": False, 
                    "error": "Application not found"
                }), status_code
            
        except Exception as e:
            print(f"Error in view_application_by_param: {e}")
            return jsonify({
                "success": False, 
                "error": f"Error: {str(e)}"
            }), 500

    # Accept application endpoint
    @staticmethod
    @view_application_blueprint.route('/api/applications/accept', methods=['POST'])
    @permission_required('has_admin_permission')
    def accept_application(**kwargs):
        """Accept an application"""
        try:
            data = request.get_json()
            application_id = data.get('application_id')
            admin_email = kwargs.get('email', 'admin')
            
            if not application_id:
                return jsonify({
                    "success": False,
                    "error": "Application ID is required"
                }), 400
            
            success, status_code, message = Application.acceptApplication(application_id, admin_email)
            
            return jsonify({
                "success": success,
                "message": message
            }), status_code
            
        except Exception as e:
            print(f"Error in accept_application: {e}")
            return jsonify({
                "success": False,
                "error": f"Error: {str(e)}"
            }), 500

    # Reject application endpoint
    @staticmethod
    @view_application_blueprint.route('/api/applications/reject', methods=['POST'])
    @permission_required('has_admin_permission')
    def reject_application(**kwargs):
        """Reject an application"""
        try:
            data = request.get_json()
            application_id = data.get('application_id')
            admin_email = kwargs.get('email', 'admin')
            
            if not application_id:
                return jsonify({
                    "success": False,
                    "error": "Application ID is required"
                }), 400
            
            success, status_code, message = Application.rejectApplication(application_id, admin_email)
            
            return jsonify({
                "success": success,
                "message": message
            }), status_code
            
        except Exception as e:
            print(f"Error in reject_application: {e}")
            return jsonify({
                "success": False,
                "error": f"Error: {str(e)}"
            }), 500