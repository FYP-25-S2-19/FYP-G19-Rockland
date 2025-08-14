from flask import Blueprint, request, jsonify
from datetime import datetime

# Update imports to match your project structure
from app.models import db
from app.entity.faq import Faq
from app.controller.authentication.permission_required import permission_required

respond_faq_blueprint = Blueprint('respond_faq', __name__)

class RespondFaqController:
    
    @staticmethod
    @respond_faq_blueprint.route('/api/faqs/answer', methods=['POST'])
    @permission_required('has_admin_permission')  # Only admins can answer questions
    def answer_question(**kwargs):
        """Admin answers a pending question"""
        try:
            # Access current admin user
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False, 
                    'message': 'Admin authentication required'
                }), 401
            
            admin_id = current_user.user_id
            print(f"🎯 Admin {current_user.email} is answering a question")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract data from request
            faq_id = data.get('faq_id')
            answer = data.get('answer')
            admin_notes = data.get('admin_notes', '')
            
            if not faq_id:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ ID is required'
                }), 400
            
            if not answer or not answer.strip():
                return jsonify({
                    'success': False, 
                    'message': 'Answer is required'
                }), 400
            
            # Get the FAQ
            faq = Faq.getFaqById(faq_id)
            if not faq:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ not found'
                }), 404
            
            # Answer the question
            success, status_code, message = faq.answerQuestion(
                answer=answer.strip(),
                admin_id=admin_id,
                admin_notes=admin_notes.strip() if admin_notes else None
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'faq': faq.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in answer_question controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error answering question: {str(e)}'
            }), 500
    
    @staticmethod
    @respond_faq_blueprint.route('/api/faqs/publish', methods=['POST'])
    @permission_required('has_admin_permission')  # Only admins can publish FAQs
    def publish_faq(**kwargs):
        """Admin publishes an answered FAQ to make it visible to all users"""
        try:
            # Access current admin user
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False, 
                    'message': 'Admin authentication required'
                }), 401
            
            admin_id = current_user.user_id
            print(f"🎯 Admin {current_user.email} is publishing an FAQ")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract FAQ ID from request
            faq_id = data.get('faq_id')
            
            if not faq_id:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ ID is required'
                }), 400
            
            # Get the FAQ
            faq = Faq.getFaqById(faq_id)
            if not faq:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ not found'
                }), 404
            
            # Publish the FAQ
            success, status_code, message = faq.publishAnswer(admin_id)
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'faq': faq.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in publish_faq controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error publishing FAQ: {str(e)}'
            }), 500
    
    @staticmethod
    @respond_faq_blueprint.route('/api/faqs/reject', methods=['POST'])
    @permission_required('has_admin_permission')  # Only admins can reject questions
    def reject_question(**kwargs):
        """Admin rejects a pending question"""
        try:
            # Access current admin user
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False, 
                    'message': 'Admin authentication required'
                }), 401
            
            admin_id = current_user.user_id
            print(f"🎯 Admin {current_user.email} is rejecting a question")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract data from request
            faq_id = data.get('faq_id')
            admin_notes = data.get('admin_notes', '')
            
            if not faq_id:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ ID is required'
                }), 400
            
            # Get the FAQ
            faq = Faq.getFaqById(faq_id)
            if not faq:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ not found'
                }), 404
            
            # Reject the question
            success, status_code, message = faq.rejectQuestion(
                admin_id=admin_id,
                admin_notes=admin_notes.strip() if admin_notes else None
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'faq': faq.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in reject_question controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error rejecting question: {str(e)}'
            }), 500
    
    @staticmethod
    @respond_faq_blueprint.route('/api/faqs/update-answer', methods=['PUT'])
    @permission_required('has_admin_permission')  # Only admins can update answers
    def update_answer(**kwargs):
        """Admin updates an existing answer"""
        try:
            # Access current admin user
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False, 
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"🎯 Admin {current_user.email} is updating an answer")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract data from request
            faq_id = data.get('faq_id')
            answer = data.get('answer')
            admin_notes = data.get('admin_notes')
            
            if not faq_id:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ ID is required'
                }), 400
            
            # Get the FAQ
            faq = Faq.getFaqById(faq_id)
            if not faq:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ not found'
                }), 404
            
            # Update the answer
            success, status_code, message = faq.updateAnswer(
                answer=answer.strip() if answer else None,
                admin_notes=admin_notes.strip() if admin_notes is not None else None
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'faq': faq.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in update_answer controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error updating answer: {str(e)}'
            }), 500
    
    @staticmethod
    @respond_faq_blueprint.route('/api/faqs/unpublish', methods=['POST'])
    @permission_required('has_admin_permission')  # Only admins can unpublish FAQs
    def unpublish_faq(**kwargs):
        """Admin unpublishes a FAQ (removes from public view)"""
        try:
            # Access current admin user
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False, 
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"🎯 Admin {current_user.email} is unpublishing an FAQ")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract FAQ ID from request
            faq_id = data.get('faq_id')
            
            if not faq_id:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ ID is required'
                }), 400
            
            # Get the FAQ
            faq = Faq.getFaqById(faq_id)
            if not faq:
                return jsonify({
                    'success': False, 
                    'message': 'FAQ not found'
                }), 404
            
            # Unpublish the FAQ
            success, status_code, message = faq.unpublishFaq()
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'faq': faq.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in unpublish_faq controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error unpublishing FAQ: {str(e)}'
            }), 500