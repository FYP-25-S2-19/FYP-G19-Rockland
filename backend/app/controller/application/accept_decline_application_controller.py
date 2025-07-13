from flask import Blueprint, request, jsonify
from app.entity.application import Application
from app.controller.authentication.permission_required import permission_required

accept_decline_application_blueprint = Blueprint('accept_decline_application', __name__)

class AcceptDeclineApplicationController:
    
    # Accept an application
    @staticmethod
    @accept_decline_application_blueprint.route('/api/applications/accept', methods=['POST'])
    @permission_required('has_admin_permission')
    def accept_application(**kwargs):
        """Accept a pending application"""
        try:
            # Access current admin user
            current_user = kwargs.get('current_user')
            admin_id = current_user.user_id if current_user else None
            
            if current_user:
                print(f"✅ Admin {current_user.email} is accepting an application")
            
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            # Extract application ID
            application_id = data.get('application_id') or data.get('id')
            
            # Validate application ID
            if not application_id:
                return jsonify({
                    'success': False,
                    'message': 'Application ID is required'
                }), 400
            
            # Try to convert to integer
            try:
                application_id = int(application_id)
            except (ValueError, TypeError):
                return jsonify({
                    'success': False,
                    'message': 'Invalid Application ID format'
                }), 400
            
            # Use entity method to accept application
            success, status_code, message = Application.acceptApplication(
                application_id, 
                admin_id
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in accept_application controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error accepting application: {str(e)}'
            }), 500
    
    # Reject/Decline an application
    @staticmethod
    @accept_decline_application_blueprint.route('/api/applications/reject', methods=['POST'])
    @permission_required('has_admin_permission')
    def reject_application(**kwargs):
        """Reject a pending application"""
        try:
            # Access current admin user
            current_user = kwargs.get('current_user')
            admin_id = current_user.user_id if current_user else None
            
            if current_user:
                print(f"❌ Admin {current_user.email} is rejecting an application")
            
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            # Extract application ID
            application_id = data.get('application_id') or data.get('id')
            
            # Optional rejection reason
            rejection_reason = data.get('reason', '').strip()
            
            # Validate application ID
            if not application_id:
                return jsonify({
                    'success': False,
                    'message': 'Application ID is required'
                }), 400
            
            # Try to convert to integer
            try:
                application_id = int(application_id)
            except (ValueError, TypeError):
                return jsonify({
                    'success': False,
                    'message': 'Invalid Application ID format'
                }), 400
            
            # Use entity method to reject application
            success, status_code, message = Application.rejectApplication(
                application_id, 
                admin_id,
                rejection_reason
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in reject_application controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error rejecting application: {str(e)}'
            }), 500
    
    # Update application status (generic endpoint)
    @staticmethod
    @accept_decline_application_blueprint.route('/api/applications/update-status', methods=['POST'])
    @permission_required('has_admin_permission')
    def update_application_status(**kwargs):
        """Update application status (accept/reject/under review)"""
        try:
            # Access current admin user
            current_user = kwargs.get('current_user')
            admin_id = current_user.user_id if current_user else None
            
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            # Extract required fields
            application_id = data.get('application_id') or data.get('id')
            new_status = data.get('status', '').strip()
            
            # Validate inputs
            if not application_id or not new_status:
                return jsonify({
                    'success': False,
                    'message': 'Application ID and status are required'
                }), 400
            
            # Validate status values
            valid_statuses = ['Pending', 'Approved', 'Rejected', 'Under Review']
            if new_status not in valid_statuses:
                return jsonify({
                    'success': False,
                    'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
                }), 400
            
            # Try to convert ID to integer
            try:
                application_id = int(application_id)
            except (ValueError, TypeError):
                return jsonify({
                    'success': False,
                    'message': 'Invalid Application ID format'
                }), 400
            
            # Use entity method to update status
            success, status_code, message = Application.updateApplicationStatus(
                application_id, 
                new_status,
                admin_id
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in update_application_status controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error updating application status: {str(e)}'
            }), 500