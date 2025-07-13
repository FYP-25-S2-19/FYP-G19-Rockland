from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.user import User, UserType
from app.controller.authentication.permission_required import permission_required
import stripe
import os

self_upgrade_blueprint = Blueprint('self_upgrade', __name__)

# Set your Stripe secret key (ensure you use an env var in production)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Initiate Stripe Checkout Session
@self_upgrade_blueprint.route('/api/user/upgrade/initiate', methods=['POST'])
@permission_required('has_freeuser_permission')
def initiate_upgrade(current_user):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Rockland Premium Plan",
                    },
                    "unit_amount": 499,  # $4.99 in cents
                },
                "quantity": 1,
            }],
            metadata={"user_id": str(current_user.user_id)},
            success_url="https://yourfrontend.com/upgrade-success",
            cancel_url="https://yourfrontend.com/upgrade-cancel",
        )
        return jsonify({"checkout_url": session.url}), 200

    except Exception as e:
        print(f"💥 Error creating Stripe session: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


# Stripe webhook to confirm and process upgrade
@self_upgrade_blueprint.route('/api/user/upgrade/webhook', methods=['POST'])
def upgrade_webhook():
    payload = request.data
    sig_header = request.headers.get('stripe-signature')
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except stripe.error.SignatureVerificationError:
        print("❌ Invalid Stripe signature")
        return 'Invalid signature', 400
    except Exception as e:
        print(f"💥 Stripe webhook error: {e}")
        return 'Webhook error', 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = int(session['metadata']['user_id'])

        print(f"💳 Payment successful for user {user_id}. Upgrading to Premium...")

        user = User.query.get(user_id)
        premium_type = UserType.query.filter_by(user_type_name='Premium').first()

        if user and premium_type:
            user.user_type_id = premium_type.user_type_id
            db.session.commit()
            print(f"✅ User {user.email} upgraded to Premium")

    return '', 200
