# categories.py
from app.models import db
from typing import Tuple, Optional

class Categories(db.Model):
    __tablename__ = 'categories'
    
    categories_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(255))

    def to_dict(self) -> dict:
        """Return a dictionary representation of the category."""
        return {
            'categories_id': self.categories_id,
            'title': self.title,
            'description': self.description,
            'interest_count': len(self.interests) if hasattr(self, 'interests') and self.interests else 0
        }

    @classmethod
    def getAllCategories(cls):
        """Get all categories"""
        try:
            return cls.query.all()
        except Exception as e:
            print(f"Error fetching all categories: {e}")
            return None

    @classmethod
    def createCategory(cls, title: str, description: str) -> Tuple[bool, int, str, Optional['Categories']]:
        """Create a new category"""
        try:
            # Validate required fields
            if not title or not title.strip():
                return False, 400, "Category title is required", None
            
            if not description or not description.strip():
                return False, 400, "Category description is required", None
            
            # Check if category already exists
            existing_category = cls.query.filter_by(title=title.strip()).first()
            if existing_category:
                return False, 409, f"Category with title '{title}' already exists", None
            
            # Create new category
            new_category = cls(
                title=title.strip(),
                description=description.strip()
            )
            
            db.session.add(new_category)
            db.session.commit()
            
            return True, 201, f"Category '{title}' created successfully", new_category
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating category: {e}")
            return False, 500, f"Error creating category: {str(e)}", None

    @classmethod
    def deleteCategory(cls, category_id: int) -> Tuple[bool, int, str]:
        """Delete a category"""
        try:
            category = cls.query.get(category_id)
            if not category:
                return False, 404, "Category not found"
            
            # Check if category has interests (business rule)
            if hasattr(category, 'interests') and category.interests:
                interest_count = len(category.interests)
                return False, 400, f"Cannot delete category. It has {interest_count} associated interests."
            
            category_name = category.title
            db.session.delete(category)
            db.session.commit()
            
            return True, 200, f"Category '{category_name}' deleted successfully"
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting category: {e}")
            return False, 500, f"Error deleting category: {str(e)}"
    
    # Add this method to your Categories entity class

    @classmethod
    def getCategoryDemandStatistics(cls):
        """Get category demand statistics based on user interest selections"""
        try:
            from app.entity.user import User, user_interest_association
            from app.entity.interest import Interest
            from app.models import db
            from sqlalchemy import func
            
            # Get total users count
            total_users, _, _ = User.getTotalUserCount()
            
            # Get all categories
            all_categories = cls.query.all()
            categories_data = [{'id': cat.categories_id, 'name': cat.title} for cat in all_categories]
            
            # Get category usage counts (how many users selected interests in each category)
            category_usage_query = db.session.query(
                cls.categories_id,
                cls.title.label('category_name'),
                func.count(func.distinct(user_interest_association.c.user_id)).label('user_count')
            ).join(
                Interest, cls.categories_id == Interest.categories_id
            ).join(
                user_interest_association, Interest.interest_id == user_interest_association.c.interest_id
            ).group_by(
                cls.categories_id, cls.title
            ).all()
            
            # Format category usage data
            category_usage = []
            for cat_id, cat_name, user_count in category_usage_query:
                category_usage.append({
                    'category_id': cat_id,
                    'category_name': cat_name,
                    'user_count': user_count
                })
            
            # Get users with interests count
            total_users_with_interests = db.session.query(
                func.count(func.distinct(user_interest_association.c.user_id))
            ).scalar() or 0
            
            return {
                'total_users': total_users,
                'total_users_with_interests': total_users_with_interests,
                'all_categories': categories_data,
                'category_usage': category_usage
            }, 200, "Category demand statistics retrieved successfully"
            
        except Exception as e:
            print(f"Error in getCategoryDemandStatistics: {e}")
            return None, 500, f"Error: {str(e)}"