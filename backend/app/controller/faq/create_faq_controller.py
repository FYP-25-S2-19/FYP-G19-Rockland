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
            
            # Basic validation
            if not question or not question.strip():
                return jsonify({
                    'success': False,
                    'message': 'Question is required'
                }), 400
            
            if not answer or not answer.strip():
                return jsonify({
                    'success': False,
                    'message': 'Answer is required'
                }), 400
            
            # Create new FAQ
            new_faq = Faq(
                question=question.strip(),
                answer=answer.strip(),
                user_id=user_id
            )
            
            # Save to database
            try:
                db.session.add(new_faq)
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'FAQ created successfully',
                    'faq': new_faq.to_dict()
                }), 201
                
            except Exception as db_error:
                db.session.rollback()
                return jsonify({
                    'success': False,
                    'message': f'Database error: {str(db_error)}'
                }), 500
                
        except Exception as e:
            print(f"Error in create_faq controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating FAQ: {str(e)}'
            }), 500