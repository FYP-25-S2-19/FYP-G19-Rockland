# Libraries
from flask import Blueprint, request, jsonify

# Local dependencies
from app.entity.faq import Faq
from app.controller.authentication.permission_required import permission_required

delete_faq_blueprint = Blueprint('delete_faq', __name__)

class DeleteFaqController:
    @staticmethod
    @delete_faq_blueprint.route('/api/faqs/delete/<int:faq_id>', methods=['DELETE'])
    @permission_required('has_admin_permission')  
    def delete_faq(faq_id, **kwargs):
        """Delete an FAQ by ID"""
        try:
            # Access current user if needed
            current_user = kwargs.get('current_user')
            if current_user:
                print(f"🎯 Admin user {current_user.email} is deleting FAQ ID: {faq_id}")
            
            # Get FAQ by ID using entity method
            existing_faq = Faq.getFaqById(faq_id)
            
            if not existing_faq:
                return jsonify({
                    "success": False,
                    "message": "FAQ not found"
                }), 404
            
            # Use the entity method to delete FAQ
            success, status_code, message = existing_faq.deleteFaq()
            
            if success:
                return jsonify({
                    "success": True,
                    "message": message
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "message": message
                }), status_code
                
        except Exception as e:
            print(f"Error in delete_faq controller: {e}")
            return jsonify({
                "success": False,
                "message": f"Error deleting FAQ: {str(e)}"
            }), 500