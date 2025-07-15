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

    # Clean one-way relationships
    user = db.relationship('User')
    plan = db.relationship('SubscriptionPlan')

    @staticmethod
    def getPaymentHistoryByUserId(user_id):
        """Get payment history for a specific user"""
        try:
            print(f"💳 Fetching payment history for user {user_id}")
            
            # Query payments for the specific user, ordered by date (newest first)
            payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.date.desc()).all()
            
            if not payments:
                print(f"No payments found for user {user_id}")
                return [], 200
            
            # Convert payments to dictionary format
            payments_data = []
            for payment in payments:
                payment_dict = {
                    'transaction_id': payment.transaction_id,
                    'user_id': payment.user_id,
                    'subscription_plan_id': payment.subscription_plan_id,
                    'amount': payment.amount,
                    'currency': payment.currency,
                    'description': payment.description,
                    'payment_method': payment.payment_method,
                    'status': payment.status,
                    'date': payment.date.strftime('%d/%m/%Y') if payment.date else None,
                    'formatted_amount': f"${payment.amount:.2f}" if payment.amount else None
                }
                payments_data.append(payment_dict)
            
            print(f"✅ Found {len(payments_data)} payments for user {user_id}")
            return payments_data, 200
            
        except Exception as e:
            print(f"❌ Error fetching payment history for user {user_id}: {e}")
            return None, 500