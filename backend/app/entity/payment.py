# app/entity/payment.py

from app.models import db

class Payment(db.Model):
    __tablename__ = 'payment'

    transaction_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    subscription_plan_id = db.Column(db.Integer, db.ForeignKey('subscription_plan.subscription_plan_id'), nullable=False)
    amount = db.Column(db.Float)
    currency = db.Column(db.String(10))
    description = db.Column(db.String(255))
    payment_method = db.Column(db.String(50))
    status = db.Column(db.String(50))
    date = db.Column(db.DateTime)

    user = db.relationship('User', back_populates='payments')
    plan = db.relationship('SubscriptionPlan', back_populates='payments')
