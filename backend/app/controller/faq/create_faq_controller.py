from flask import Blueprint, request, jsonify
from datetime import datetime

# Update imports to match your project structure
from app.models import db
from app.entity.faq import Faq
from app.controller.authentication.permission_required import permission_required

create_faq_blueprint = Blueprint('create_faq', __name__)

class CreateFaqController:
    @staticmethod
    @create_faq_blueprint.route('/api/faqs/create', methods=['POST'])
    @permission_required('has_admin_permission')  
    def create_faq(**kwargs):  # ✅ Added **kwargs
        """Create a new FAQ"""
        try:
            # Access current user if needed
            current_user = kwargs.get('current_user')
            user_id = current_user.user_id if current_user else 1  # Default to user_id 1 if no current user
            
            if current_user:
                print(f"🎯 Admin user {current_user.email} is creating a new FAQ")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract FAQ data from request
            question = data.get('question')
            answer = data.get('answer')
            
            # Use the entity method to create FAQ
            success, status_code, message, new_faq = Faq.createFaq(
                question=question.strip() if question else "",
                answer=answer.strip() if answer else "",
                user_id=user_id
            )
            
            if success and new_faq:
                return jsonify({
                    'success': True,
                    'message': message,
                    'faq': new_faq.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in create_faq controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating FAQ: {str(e)}'
            }), 500