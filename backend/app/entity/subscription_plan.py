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

    # Add these methods to your SubscriptionPlan class in app/entity/subscription_plan.py

    def to_dict(self):
        """Convert SubscriptionPlan instance to dictionary"""
        return {
            'subscription_plan_id': self.subscription_plan_id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'currency': self.currency,
            'feature_a': self.feature_a,
            'feature_b': self.feature_b,
            'feature_c': self.feature_c,
            'feature_d': self.feature_d
        }

    @classmethod
    def getAllSubscriptionPlans(cls):
        """Get all subscription plans"""
        try:
            return cls.query.order_by(cls.subscription_plan_id).all()
        except Exception as e:
            print(f"Error fetching all subscription plans: {str(e)}")
            return None

    @classmethod
    def getSubscriptionPlanById(cls, plan_id: int):
        """Get subscription plan by ID"""
        try:
            return cls.query.get(plan_id)
        except Exception as e:
            print(f"Error fetching subscription plan by ID {plan_id}: {str(e)}")
            return None

    @classmethod
    def createSubscriptionPlan(cls, name: str, description: str = None, 
                            price: float = None, currency: str = None,
                            feature_a: str = None, feature_b: str = None,
                            feature_c: str = None, feature_d: str = None):
        """Create a new subscription plan"""
        try:
            # Validate required fields
            if not name or not name.strip():
                return False, 400, "Name is required", None
            
            if price is None or price < 0:
                return False, 400, "Valid price is required", None
                
            if not currency or not currency.strip():
                return False, 400, "Currency is required", None
            
            # Check if subscription plan with this name already exists
            existing_plan = cls.query.filter_by(name=name.strip()).first()
            if existing_plan:
                return False, 409, f"Subscription plan with name '{name}' already exists", None
            
            # Create new subscription plan instance
            new_plan = cls(
                name=name.strip(),
                description=description.strip() if description else None,
                price=float(price),
                currency=currency.strip(),
                feature_a=feature_a.strip() if feature_a else None,
                feature_b=feature_b.strip() if feature_b else None,
                feature_c=feature_c.strip() if feature_c else None,
                feature_d=feature_d.strip() if feature_d else None
            )
            
            # Save to database
            db.session.add(new_plan)
            db.session.commit()
            
            return True, 201, "Subscription plan created successfully", new_plan
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating subscription plan: {str(e)}")
            return False, 500, f"Error creating subscription plan: {str(e)}", None
    
    @classmethod
    def deleteSubscriptionPlanById(cls, plan_id: int):
        """Delete subscription plan by ID"""
        try:
            existing_plan = cls.getSubscriptionPlanById(plan_id)
            
            if not existing_plan:
                return False, 404, "Subscription plan not found", None
            
            plan_name = existing_plan.name
            
            # Store plan info for response
            plan_data = existing_plan.to_dict()
            
            # Delete the subscription plan from database
            db.session.delete(existing_plan)
            db.session.commit()
            
            return True, 200, f"Subscription plan '{plan_name}' deleted successfully", plan_data
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting subscription plan by ID: {str(e)}")
            return False, 500, f"Error deleting subscription plan: {str(e)}", None
