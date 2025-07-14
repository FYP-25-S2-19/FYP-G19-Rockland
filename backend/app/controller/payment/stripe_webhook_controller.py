import os
import stripe
from flask import request
from datetime import datetime
from app.models import db
from app.entity.payment import Payment
from app.entity.user_subscription import UserSubscription
from app.entity.user import User
from app.entity.usertype import UserType

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")  # move secret to .env

def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        print("❌ Invalid payload")
        return "Invalid payload", 400
    except stripe.error.SignatureVerificationError:
        print("❌ Invalid signature")
        return "Invalid signature", 400

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = int(session["metadata"]["user_id"])
        plan_id = int(session["metadata"]["plan_id"])

        print(f"🎯 Payment completed for user_id={user_id}, plan_id={plan_id}")

        # Record payment
        payment = Payment(
            user_id=user_id,
            subscription_plan_id=plan_id,
            amount=session["amount_total"] / 100,
            currency=session["currency"],
            description="Premium Subscription",
            payment_method="card",
            status="paid",
            date=datetime.utcnow()
        )
        db.session.add(payment)

        # Create or update user subscription
        subscription = UserSubscription.query.filter_by(user_id=user_id).first()
        if subscription:
            subscription.subscription_plan_id = plan_id
            subscription.status = "active"
            subscription.start_date = datetime.utcnow()
        else:
            db.session.add(UserSubscription(
                user_id=user_id,
                subscription_plan_id=plan_id,
                start_date=datetime.utcnow(),
                status="active"
            ))

        # Upgrade user_type_id to "Premium"
        user = User.query.get(user_id)
        premium_type = UserType.queryUserTypeByName("Premium")

        if user and premium_type:
            user.user_type_id = premium_type.user_type_id
            print(f"✅ Upgraded user {user_id} to 'Premium' (user_type_id={premium_type.user_type_id})")
        else:
            print(f"⚠️ Could not upgrade user {user_id} — user or Premium type missing")

        db.session.commit()
        print("✅ Webhook processing complete")

    return "", 200
