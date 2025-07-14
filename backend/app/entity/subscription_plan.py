# app/entity/subscription_plan.py

from app.models import db

class SubscriptionPlan(db.Model):
    __tablename__ = 'subscription_plan'

    subscription_plan_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False)
    feature_a = db.Column(db.String(100))
    feature_b = db.Column(db.String(100))
    feature_c = db.Column(db.String(100))
    feature_d = db.Column(db.String(100))

    # Clean one-way relationship
    # No back_populates to avoid issues with UserSubscription/Payment
