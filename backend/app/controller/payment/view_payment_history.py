from flask import Blueprint, request, jsonify

# Update imports to match your project structure
from app.models import db
from app.entity.payment import Payment
from app.controller.authentication.permission_required import permission_required

view_payment_history_blueprint = Blueprint('view_payment_history', __name__)

class ViewPaymentHistoryController:
    
    @staticmethod
    @view_payment_history_blueprint.route('/api/payments/history', methods=['GET'])
    @permission_required('has_user_permission')
    def get_user_payment_history(**kwargs):
        """Fetch payment history for the authenticated user"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401
            
            print(f"💳 User {current_user.email} is viewing payment history")
            
            # Use the entity method to get payment history for the user
            payments_data, status_code = Payment.getPaymentHistoryByUserId(current_user.user_id)
            
            if payments_data is not None:
                return jsonify({
                    'success': True,
                    'message': 'Payment history fetched successfully',
                    'payments': payments_data,
                    'total_count': len(payments_data)
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to fetch payment history'
                }), status_code
                
        except Exception as e:
            print(f"Error in get_user_payment_history controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching payment history: {str(e)}'
            }), 500



    @staticmethod
    @view_payment_history_blueprint.route('/api/payments/history/<int:user_id>', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_user_payment_history_admin(user_id, **kwargs):
        """Fetch payment history for a specific user (admin only)"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"👤 Admin {current_user.email} is viewing payment history for user {user_id}")
            
            # Use the entity method to get payment history for specific user
            payments_data, status_code = Payment.getPaymentHistoryByUserId(user_id)
            
            if payments_data is not None:
                return jsonify({
                    'success': True,
                    'message': f'Payment history for user {user_id} fetched successfully',
                    'payments': payments_data,
                    'total_count': len(payments_data)
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': f'Failed to fetch payment history for user {user_id}'
                }), status_code
                
        except Exception as e:
            print(f"Error in get_user_payment_history_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching payment history: {str(e)}'
            }), 500