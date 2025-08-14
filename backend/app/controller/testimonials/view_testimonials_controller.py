from flask import Blueprint, request, jsonify
from app.entity.testimonials import Testimonials
from app.controller.authentication.permission_required import permission_required

view_testimonials_blueprint = Blueprint('view_testimonials', __name__)

class ViewTestimonialsController:
    
    # Get all testimonials for admin view (unchanged)
    @staticmethod
    @view_testimonials_blueprint.route('/api/testimonials/all', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_all_testimonials(**kwargs):
        try:
            testimonials = Testimonials.getAllTestimonials()
            
            if testimonials is not None:
                # Convert to list of dictionaries
                testimonials_data = [testimonial.to_dict() for testimonial in testimonials]
                return jsonify({"success": True, "testimonials": testimonials_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch testimonials"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # MODIFIED: Get only SELECTED testimonials for public view
    @staticmethod
    @view_testimonials_blueprint.route('/api/testimonials/public', methods=['GET'])
    def get_public_testimonials():
        try:
            # CHANGED: Get only selected testimonials instead of all
            testimonials = Testimonials.getSelectedTestimonials()
            
            if testimonials is not None:
                # Convert to list of dictionaries (only public fields)
                testimonials_data = [testimonial.to_dict() for testimonial in testimonials]
                
                return jsonify({"success": True, "testimonials": testimonials_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch testimonials"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Admin endpoint to get specific testimonial by ID (unchanged)
    @staticmethod
    @view_testimonials_blueprint.route('/api/testimonials/view_testimonial', methods=['GET'])
    @permission_required('has_admin_permission')
    def view_testimonial(**kwargs):
        try:
            testimonial_id = request.args.get('id')

            if not testimonial_id:
                return jsonify({
                    "success": False, 
                    "error": "ID parameter not provided"
                }), 400
            
            # Try to convert to integer
            try:
                testimonial_id = int(testimonial_id)
            except (ValueError, TypeError):
                return jsonify({
                    "success": False, 
                    "error": "Invalid ID format"
                }), 400
            
            testimonial, status_code = Testimonials.viewTestimonial(testimonial_id)

            if testimonial:
                return jsonify({
                    "success": True, 
                    "testimonial": testimonial,
                    "message": f"Testimonial details retrieved for ID {testimonial_id}"
                }), status_code
            else:
                return jsonify({
                    "success": False, 
                    "error": "Testimonial not found"
                }), status_code
        except Exception as e:
            print(f"Error in view_testimonial: {e}")
            return jsonify({
                "success": False, 
                "error": f"Error: {str(e)}"
            }), 500

    # NEW: Admin endpoint to toggle testimonial selection
    @staticmethod
    @view_testimonials_blueprint.route('/api/testimonials/toggle-selection/<int:testimonial_id>', methods=['POST'])
    @permission_required('has_admin_permission')
    def toggle_testimonial_selection(testimonial_id, **kwargs):
        """Toggle testimonial selection for landing page display"""
        try:
            success, status_code, message = Testimonials.toggleTestimonialSelection(testimonial_id)
            
            if success:
                testimonial = Testimonials.getTestimonialById(testimonial_id)
                return jsonify({
                    'success': True,
                    'message': message,
                    'testimonial': testimonial.to_dict() if testimonial else None
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error: {str(e)}'
            }), 500