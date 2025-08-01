from flask import Blueprint, request, jsonify
from app.entity.faq import Faq
from app.controller.authentication.permission_required import permission_required

update_faq_blueprint = Blueprint('update_faq', __name__)

class UpdateFaqController:
    @staticmethod
    @update_faq_blueprint.route('/api/faqs/update/<int:faq_id>', methods=['PUT'])
    @permission_required('has_admin_permission')
    def update_faq(faq_id, **kwargs):
        try:
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({
                    "success": False, 
                    "message": "No data provided"
                }), 400
            
            # Extract required fields
            question = data.get('question')
            answer = data.get('answer')
            
            # Get FAQ by ID using entity method
            existing_faq = Faq.getFaqById(faq_id)
            if not existing_faq:
                return jsonify({
                    "success": False,
                    "message": "FAQ not found"
                }), 404
            
            # Use the entity method to update FAQ
            success, status_code, message = existing_faq.updateFaq(
                question=question.strip() if question else None,
                answer=answer.strip() if answer else None
            )
            
            if success:
                return jsonify({
                    "success": True, 
                    "message": message,
                    "faq": existing_faq.to_dict()
                }), status_code
            else:
                return jsonify({
                    "success": False, 
                    "message": message
                }), status_code
                
        except Exception as e:
            return jsonify({
                "success": False, 
                "message": f"Error updating FAQ: {str(e)}"
            }), 500