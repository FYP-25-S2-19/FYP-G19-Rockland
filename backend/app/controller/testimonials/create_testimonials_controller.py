# create_testimonials_controller.py
from flask import Blueprint, request, jsonify
from app.entity.testimonials import Testimonials
from app.controller.authentication.permission_required import permission_required

create_testimonials_blueprint = Blueprint('create_testimonials', __name__)

class CreateTestimonialsController:
    
    @staticmethod
    @create_testimonials_blueprint.route('/api/testimonials/create', methods=['POST'])
    @permission_required()  # Allow all authenticated users
    def create_testimonial(**kwargs):
        """Create a new Testimonial - Available to all authenticated users"""
        try:
            current_user = kwargs.get('current_user')
            user_id = current_user.user_id if current_user else None
            
            if current_user:
                print(f"🗨️ User {current_user.email} is creating a new testimonial")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            # Extract fields from request data (removed name)
            rating = data.get('rating')
            testimony = data.get('testimony')
            
            # Use entity method to handle creation (removed name parameter)
            success, status_code, message, new_testimonial = Testimonials.createTestimonial(
                rating=rating,
                testimony=testimony,
                user_id=user_id
            )
            
            if success and new_testimonial:
                return jsonify({
                    'success': True,
                    'message': message,
                    'testimonial': new_testimonial.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in create_testimonial controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating testimonial: {str(e)}'
            }), 500