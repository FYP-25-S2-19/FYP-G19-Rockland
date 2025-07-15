from flask import Blueprint, request, jsonify
from app.entity.subscription_plan import SubscriptionPlan
from app.controller.authentication.permission_required import permission_required

view_subscription_plan_blueprint = Blueprint('view_subscription_plan', __name__)

class ViewSubscriptionPlanController:
    
    # Get all subscription plans for admin view
    @staticmethod
    @view_subscription_plan_blueprint.route('/api/subscription-plans/all', methods=['GET'])
    @permission_required('has_admin_permission')  # Only admins can view all subscription plans
    def get_all_subscription_plans(**kwargs):
        try:
            plans = SubscriptionPlan.getAllSubscriptionPlans()
            
            if plans is not None:
                # Convert to list of dictionaries
                plans_data = []
                for plan in plans:
                    plan_dict = {
                        'subscription_plan_id': plan.subscription_plan_id,
                        'name': plan.name,
                        'description': plan.description,
                        'price': plan.price,
                        'currency': plan.currency,
                        'feature_a': plan.feature_a,
                        'feature_b': plan.feature_b,
                        'feature_c': plan.feature_c,
                        'feature_d': plan.feature_d
                    }
                    plans_data.append(plan_dict)
                
                return jsonify({"success": True, "subscription_plans": plans_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch subscription plans"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get all subscription plans for public view (no authentication required)
    @staticmethod
    @view_subscription_plan_blueprint.route('/api/subscription-plans/public', methods=['GET'])
    def get_public_subscription_plans():
        try:
            plans = SubscriptionPlan.getAllSubscriptionPlans()
            
            if plans is not None:
                # Convert to list of dictionaries (only public fields)
                plans_data = [plan.to_dict() for plan in plans]
                
                return jsonify({"success": True, "subscription_plans": plans_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch subscription plans"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500
    
    # Get subscription plan by ID
    @staticmethod
    @view_subscription_plan_blueprint.route('/api/subscription-plans/<int:plan_id>', methods=['GET'])
    def get_subscription_plan_by_id(plan_id):
        try:
            plan = SubscriptionPlan.getSubscriptionPlanById(plan_id)
            
            if plan:
                return jsonify({"success": True, "subscription_plan": plan.to_dict()}), 200
            else:
                return jsonify({"success": False, "error": "Subscription plan not found"}), 404
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500