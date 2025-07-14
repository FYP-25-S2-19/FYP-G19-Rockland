from flask import Blueprint, request, jsonify
from datetime import datetime

# Update imports to match your project structure
from app.models import db
from app.entity.subscription_plan import SubscriptionPlan
from app.controller.authentication.permission_required import permission_required

create_subscription_plan_blueprint = Blueprint('create_subscription_plan', __name__)

class CreateSubscriptionPlanController:
    @staticmethod
    @create_subscription_plan_blueprint.route('/api/subscription-plans/create', methods=['POST'])
    @permission_required('has_admin_permission')  
    def create_subscription_plan(**kwargs):  # ✅ Added **kwargs
        """Create a new subscription plan"""
        try:
            # Access current user if needed
            current_user = kwargs.get('current_user')
            
            if current_user:
                print(f"🎯 Admin user {current_user.email} is creating a new subscription plan")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract subscription plan data from request
            name = data.get('name')
            description = data.get('description')
            price = data.get('price')
            currency = data.get('currency')
            feature_a = data.get('feature_a')
            feature_b = data.get('feature_b')
            feature_c = data.get('feature_c')
            feature_d = data.get('feature_d')
            
            # Call entity method to create subscription plan
            success, status_code, message, subscription_plan = SubscriptionPlan.createSubscriptionPlan(
                name=name,
                description=description,
                price=price,
                currency=currency,
                feature_a=feature_a,
                feature_b=feature_b,
                feature_c=feature_c,
                feature_d=feature_d
            )
            
            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'subscription_plan': subscription_plan.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in create_subscription_plan controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating subscription plan: {str(e)}'
            }), 500