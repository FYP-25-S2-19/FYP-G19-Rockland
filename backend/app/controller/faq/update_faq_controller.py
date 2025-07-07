from flask import Blueprint, request, jsonify
from app.entity.faq import Faq
# Temporarily comment out the permission_required import
from app.controller.authentication.permission_required import permission_required

update_faq_blueprint = Blueprint('update_faq', __name__)

class UpdateFaqController:
    # Update FAQ (admin permission required)
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
            
            # Basic request validation
            if not question or not question.strip():
                return jsonify({
                    "success": False, 
                    "message": "Question is required"
                }), 400
            
            if not answer or not answer.strip():
                return jsonify({
                    "success": False, 
                    "message": "Answer is required"
                }), 400
            
            # Check if FAQ exists
            existing_faq = Faq.getFaqById(faq_id)
            if not existing_faq:
                return jsonify({
                    "success": False,
                    "message": "FAQ not found"
                }), 404
            
            # Update the FAQ
            existing_faq.question = question.strip()
            existing_faq.answer = answer.strip()
            
            # Save changes to database
            from app.models import db
            try:
                db.session.commit()
                
                return jsonify({
                    "success": True, 
                    "message": "FAQ updated successfully",
                    "faq": existing_faq.to_dict()
                }), 200
                
            except Exception as db_error:
                db.session.rollback()
                return jsonify({
                    "success": False, 
                    "message": f"Database error: {str(db_error)}"
                }), 500
                
        except Exception as e:
            return jsonify({
                "success": False, 
                "message": f"Error updating FAQ: {str(e)}"
            }), 500