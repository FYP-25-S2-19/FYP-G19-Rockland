from flask import Blueprint, request, jsonify
from app.entity.faq import Faq
from app.controller.authentication.permission_required import permission_required

view_faq_blueprint = Blueprint('view_faq', __name__)

class ViewFaqController:
    
    # Get all FAQs for admin view (all statuses)
    @staticmethod
    @view_faq_blueprint.route('/api/faqs/all', methods=['GET'])
    # @permission_required('has_admin_permission')  # Only admins can view all FAQs
    def get_all_faqs(**kwargs):
        """Get all FAQs for admin management (all statuses)"""
        try:
            # Optional status filter
            status = request.args.get('status')  # pending, answered, published, rejected
            
            faqs = Faq.getAllFaqs(status=status)
            
            if faqs is not None:
                # Convert to list of dictionaries
                faqs_data = [faq.to_dict() for faq in faqs]
                
                return jsonify({
                    "success": True, 
                    "faqs": faqs_data,
                    "count": len(faqs_data)
                }), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch FAQs"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get pending FAQs for admin review
    @staticmethod
    @view_faq_blueprint.route('/api/faqs/pending', methods=['GET'])
    @permission_required('has_admin_permission')  # Only admins can view pending FAQs
    def get_pending_faqs(**kwargs):
        """Get FAQs pending admin response"""
        try:
            faqs = Faq.getPendingFaqs()
            
            if faqs is not None:
                faqs_data = [faq.to_dict() for faq in faqs]
                
                return jsonify({
                    "success": True, 
                    "faqs": faqs_data,
                    "count": len(faqs_data)
                }), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch pending FAQs"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get published FAQs for public view (no authentication required)
    @staticmethod
    @view_faq_blueprint.route('/api/faqs/public', methods=['GET'])
    def get_public_faqs():
        """Get only published FAQs for public display"""
        try:
            faqs = Faq.getPublishedFaqs()
            
            if faqs is not None:
                # Use public dict (only published info, no admin details)
                faqs_data = []
                for faq in faqs:
                    public_faq = faq.to_public_dict()
                    if public_faq:  # Only include published FAQs
                        faqs_data.append(public_faq)
                
                return jsonify({
                    "success": True, 
                    "faqs": faqs_data,
                    "count": len(faqs_data)
                }), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch public FAQs"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get user's own submitted FAQs
    @staticmethod
    @view_faq_blueprint.route('/api/faqs/my-questions', methods=['GET'])
    @permission_required('has_freeuser_permission')  # All authenticated users can view their own questions
    def get_user_faqs(**kwargs):
        """Get FAQs submitted by the current user"""
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False, 
                    'message': 'Authentication required'
                }), 401
            
            # Optional status filter
            status = request.args.get('status')  # pending, answered, published, rejected
            
            faqs = Faq.getUserFaqs(current_user.user_id, status=status)
            
            if faqs is not None:
                faqs_data = [faq.to_dict() for faq in faqs]
                
                return jsonify({
                    "success": True, 
                    "faqs": faqs_data,
                    "count": len(faqs_data)
                }), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch user FAQs"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get FAQ by ID (public or admin)
    @staticmethod
    @view_faq_blueprint.route('/api/faqs/<int:faq_id>', methods=['GET'])
    def get_faq_by_id(faq_id):
        """Get specific FAQ by ID"""
        try:
            faq = Faq.getFaqById(faq_id)
            
            if faq:
                # Check if this is an admin request or public request
                auth_header = request.headers.get('Authorization')
                is_admin_request = bool(auth_header)  # Simple check, you might want to validate the token
                
                if is_admin_request:
                    # Return full details for admin
                    return jsonify({"success": True, "faq": faq.to_dict()}), 200
                else:
                    # Return only public info for regular users
                    public_faq = faq.to_public_dict()
                    if public_faq:
                        return jsonify({"success": True, "faq": public_faq}), 200
                    else:
                        return jsonify({"success": False, "error": "FAQ not available"}), 404
            else:
                return jsonify({"success": False, "error": "FAQ not found"}), 404
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"})