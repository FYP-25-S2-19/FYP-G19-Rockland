from flask import Blueprint, request, jsonify
from app.entity.faq import Faq
# Temporarily comment out the permission_required import
from app.controller.authentication.permission_required import permission_required

view_faq_blueprint = Blueprint('view_faq', __name__)

class ViewFaqController:
    
    # Get all FAQs for admin view
    @staticmethod
    @view_faq_blueprint.route('/api/faqs/all', methods=['GET'])
    @permission_required('has_admin_permission')  # Only admins can view all FAQs
    def get_all_faqs(**kwargs):
        try:
            faqs = Faq.getAllFaqs()
            
            if faqs is not None:
                # Convert to list of dictionaries
                faqs_data = []
                for faq in faqs:
                    faq_dict = {
                        'faq_id': faq.faq_id,
                        'question': faq.question,
                        'answer': faq.answer,
                        'user_id': faq.user_id,
                        'user_name': f"{faq.user.first_name} {faq.user.last_name}" if faq.user else "Unknown"
                    }
                    faqs_data.append(faq_dict)
                
                return jsonify({"success": True, "faqs": faqs_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch FAQs"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get all FAQs for public view (no authentication required)
    @staticmethod
    @view_faq_blueprint.route('/api/faqs/public', methods=['GET'])
    def get_public_faqs():
        try:
            faqs = Faq.getAllFaqs()
            
            if faqs is not None:
                # Convert to list of dictionaries (only public fields)
                faqs_data = [faq.to_dict() for faq in faqs]
                
                return jsonify({"success": True, "faqs": faqs_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch FAQs"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get FAQ by ID
    @staticmethod
    @view_faq_blueprint.route('/api/faqs/<int:faq_id>', methods=['GET'])
    def get_faq_by_id(faq_id):
        try:
            faq = Faq.getFaqById(faq_id)
            
            if faq:
                return jsonify({"success": True, "faq": faq.to_dict()}), 200
            else:
                return jsonify({"success": False, "error": "FAQ not found"}), 404
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500