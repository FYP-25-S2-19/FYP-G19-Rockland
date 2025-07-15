# app/controller/subscription/get_subscription_plans_controller.py

from flask import jsonify
from app.models import db
from app.entity.subscription_plan import SubscriptionPlan

def get_subscription_plans():
    plans = SubscriptionPlan.query.all()

    result = []
    for plan in plans:
        result.append({
            "id": plan.subscription_plan_id,
            "name": plan.name,
            "description": plan.description,
            "price": plan.price,
            "currency": plan.currency,
            "features": list(filter(None, [
                plan.feature_a,
                plan.feature_b,
                plan.feature_c,
                plan.feature_d
            ]))
        })

    return jsonify(result)
