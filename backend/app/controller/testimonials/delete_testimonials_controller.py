from flask import Blueprint, request, jsonify
from app.entity.testimonials import Testimonials
from app.controller.authentication.permission_required import permission_required

delete_testimonials_blueprint = Blueprint('delete_testimonials', __name__)

class DeleteTestimonialsController:
    
    @staticmethod
    @delete_testimonials_blueprint.route('/api/testimonials/delete_testimonial', methods=['POST'])
    @permission_required('has_admin_permission')
    def delete_testimonial(**kwargs):
        try:
            # Access current user
            current_user = kwargs.get('current_user')
            
            # Get JSON data from request
            data = request.get_json()
            
            if not data:
                return jsonify({"success": False, "message": "No data provided"}), 400
            
            # Extract testimonial ID
            testimonial_id = data.get('id')
            
            # Validate testimonial ID
            if not testimonial_id:
                return jsonify({"success": False, "message": "Testimonial ID is required"}), 400
            
            # Try to convert testimonial_id to integer
            try:
                testimonial_id = int(testimonial_id)
            except (ValueError, TypeError):
                return jsonify({"success": False, "message": "Invalid Testimonial ID format"}), 400
            
            # Use the entity's deleteTestimonial method
            success, status_code, message = Testimonials.deleteTestimonial(
                testimonial_id, 
                current_user.user_id if current_user else None
            )
            
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
                "message": f"Error deleting testimonial: {str(e)}"
            }), 500