# Libraries
from flask import Blueprint, request, jsonify

# Local dependencies
from app.entity.subscription_plan import SubscriptionPlan
from app.models import db
# Temporarily comment out the permission_required import
from app.controller.authentication.permission_required import permission_required

delete_subscription_plan_blueprint = Blueprint('delete_subscription_plan', __name__)

class DeleteSubscriptionPlanController:
    @staticmethod
    @delete_subscription_plan_blueprint.route('/api/subscription-plans/delete/<int:plan_id>', methods=['DELETE'])
    @permission_required('has_admin_permission')  
    def delete_subscription_plan(plan_id, **kwargs):
        """Delete a subscription plan by ID"""
        try:
            # Access current user if needed
            current_user = kwargs.get('current_user')
            if current_user:
                print(f"🎯 Admin user {current_user.email} is deleting subscription plan ID: {plan_id}")
            
            # Use entity method to handle subscription plan deletion
            success, status_code, message, plan_data = SubscriptionPlan.deleteSubscriptionPlanById(plan_id)
            
            if success:
                return jsonify({
                    "success": True,
                    "message": message,
                    "deleted_plan": plan_data
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "message": message
                }), status_code
                
        except Exception as e:
            print(f"Error in delete_subscription_plan controller: {e}")
            return jsonify({
                "success": False,
                "message": f"Error deleting subscription plan: {str(e)}"
            }), 500