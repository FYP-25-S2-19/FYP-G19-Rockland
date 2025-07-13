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

    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=True)

    users = db.relationship('User', back_populates='created_plans', foreign_keys=[user_id])
    subscriptions = db.relationship('UserSubscription', back_populates='plan', cascade='all, delete-orphan')
    payments = db.relationship('Payment', back_populates='plan', cascade='all, delete-orphan')
