# app/entity/user_subscription.py

from app.models import db

class UserSubscription(db.Model):
    __tablename__ = 'user_subscription'

    user_subscription_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    subscription_plan_id = db.Column(db.Integer, db.ForeignKey('subscription_plan.subscription_plan_id'), nullable=False)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    status = db.Column(db.String(50))

    # Clean one-way relationships
    user = db.relationship('User')
    plan = db.relationship('SubscriptionPlan')
