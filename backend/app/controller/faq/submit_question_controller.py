from flask import Blueprint, request, jsonify
from datetime import datetime

# Update imports to match your project structure
from app.models import db
from app.entity.faq import Faq


submit_question_blueprint = Blueprint('submit_question', __name__)

class SubmitQuestionController:
    @staticmethod
    @submit_question_blueprint.route('/api/faqs/submit-question', methods=['POST'])
    def submit_question(**kwargs):
        """Allow any authenticated user to submit a question"""
        try:
            # Access current user
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False, 
                    'message': 'Authentication required'
                }), 401
            
            user_id = current_user.user_id
            print(f"🎯 User {current_user.email} is submitting a new question")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract question from request
            question = data.get('question')
            
            if not question or not question.strip():
                return jsonify({
                    'success': False, 
                    'message': 'Question is required'
                }), 400
            
            # Use the entity method to submit question
            success, status_code, message, new_faq = Faq.submitQuestion(
                question=question.strip(),
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
            print(f"Error in submit_question controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error submitting question: {str(e)}'
            }), 500