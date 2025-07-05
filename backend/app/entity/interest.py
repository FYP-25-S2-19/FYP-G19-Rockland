from app.models import db
from typing import Tuple, Optional

class Interest(db.Model):
    __tablename__ = 'interest'
    
    interest_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(255))

    # Foreign key to Categories
    categories_id = db.Column(db.Integer, db.ForeignKey('categories.categories_id'), nullable=False, default=1)
    
    # Relationship with Categories model
    category = db.relationship('Categories', backref='interests')

    def to_dict(self) -> dict:
        """Return a dictionary representation of the interest."""
        return {
            'interest_id': self.interest_id,
            'title': self.title,
            'description': self.description,
            'categories_id': self.categories_id,
            'category_title': self.category.title if self.category else None
        }

    @classmethod
    def getAllInterests(cls):
        """Get all interests"""
        try:
            return cls.query.all()
        except Exception as e:
            print(f"Error fetching all interests: {e}")
            return None

    @classmethod
    def createInterest(cls, title: str, description: str, categories_id: int) -> Tuple[bool, int, str, Optional['Interest']]:
        """Create a new interest"""
        try:
            # Validate required fields
            if not title or not title.strip():
                return False, 400, "Interest title is required", None
            
            if not description or not description.strip():
                return False, 400, "Interest description is required", None
            
            if not categories_id:
                return False, 400, "Category ID is required", None
            
            # Check if category exists
            from app.entity.categories import Categories
            category = Categories.query.get(categories_id)
            if not category:
                return False, 404, f"Category with ID {categories_id} not found", None
            
            # Check if interest already exists
            existing_interest = cls.query.filter_by(title=title.strip()).first()
            if existing_interest:
                return False, 409, f"Interest with title '{title}' already exists", None
            
            # Create new interest
            new_interest = cls(
                title=title.strip(),
                description=description.strip(),
                categories_id=categories_id
            )
            
            db.session.add(new_interest)
            db.session.commit()
            
            return True, 201, f"Interest '{title}' created successfully", new_interest
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating interest: {e}")
            return False, 500, f"Error creating interest: {str(e)}", None

    @classmethod
    def deleteInterest(cls, interest_id: int) -> Tuple[bool, int, str]:
        """Delete an interest"""
        try:
            # Find the interest
            interest = cls.query.get(interest_id)
            if not interest:
                return False, 404, "Interest not found"
            
            # Store interest name for success message
            interest_name = interest.title
            
            # Delete the interest
            db.session.delete(interest)
            db.session.commit()
            
            return True, 200, f"Interest '{interest_name}' deleted successfully"
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting interest: {e}")
            return False, 500, f"Error deleting interest: {str(e)}"