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
            
            # Check if subscription plan exists
            existing_plan = SubscriptionPlan.getSubscriptionPlanById(plan_id)
            
            if not existing_plan:
                return jsonify({
                    "success": False,
                    "message": "Subscription plan not found"
                }), 404
            
            # Delete the subscription plan
            try:
                db.session.delete(existing_plan)
                db.session.commit()
                
                return jsonify({
                    "success": True,
                    "message": "Subscription plan deleted successfully"
                }), 200
                
            except Exception as db_error:
                db.session.rollback()
                return jsonify({
                    "success": False,
                    "message": f"Database error: {str(db_error)}"
                }), 500
                
        except Exception as e:
            print(f"Error in delete_subscription_plan controller: {e}")
            return jsonify({
                "success": False,
                "message": f"Error deleting subscription plan: {str(e)}"
            }), 500