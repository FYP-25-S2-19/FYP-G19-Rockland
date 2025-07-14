import os
import stripe
from flask import request, jsonify
from app.models import db
from app.entity.subscription_plan import SubscriptionPlan

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL")  # ✅ pull your .env IP

def create_checkout_session():
    try:
        data = request.get_json()
        print("➡️ Received data:", data)

        user_id = data.get("user_id")
        plan_id = data.get("plan_id")

        plan = SubscriptionPlan.query.get(plan_id)
        if not plan:
            print("❌ Plan not found for ID:", plan_id)
            return jsonify({"error": "Subscription plan not found"}), 404

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": plan.currency,
                    "product_data": {
                        "name": plan.name,
                    },
                    "unit_amount": int(plan.price * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{FRONTEND_BASE_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_BASE_URL}/cancel",
            metadata={
                "user_id": user_id,
                "plan_id": plan_id
            }
        )
        print("✅ Stripe session created:", session.id)
        return jsonify({"url": session.url})

    except Exception as e:
        print("❌ Error in create_checkout_session:", str(e))
        return jsonify({"error": "Internal server error"}), 500
