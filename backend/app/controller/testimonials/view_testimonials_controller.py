from flask import Blueprint, request, jsonify
from app.entity.testimonials import Testimonials
from app.controller.authentication.permission_required import permission_required

view_testimonials_blueprint = Blueprint('view_testimonials', __name__)

class ViewTestimonialsController:
    
    # Get all testimonials for admin view
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
    
    # Get all testimonials for public view (no authentication required)
    @staticmethod
    @view_testimonials_blueprint.route('/api/testimonials/public', methods=['GET'])
    def get_public_testimonials():
        try:
            testimonials = Testimonials.getAllTestimonials()
            
            if testimonials is not None:
                # Convert to list of dictionaries (only public fields)
                testimonials_data = [testimonial.to_dict() for testimonial in testimonials]
                
                return jsonify({"success": True, "testimonials": testimonials_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch testimonials"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Admin endpoint to get specific testimonial by ID
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
    
    # Get testimonial by ID (public endpoint)
    @staticmethod
    @view_testimonials_blueprint.route('/api/testimonials/<int:testimonial_id>', methods=['GET'])
    def get_testimonial_by_id(testimonial_id):
        try:
            testimonial = Testimonials.getTestimonialById(testimonial_id)
            
            if testimonial:
                return jsonify({"success": True, "testimonial": testimonial.to_dict()}), 200
            else:
                return jsonify({"success": False, "error": "Testimonial not found"}), 404
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500