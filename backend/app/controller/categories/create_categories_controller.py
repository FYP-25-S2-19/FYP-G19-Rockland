from flask import Blueprint, request, jsonify
from datetime import datetime

# Update imports to match your project structure
from app.models import db
from app.entity.categories import Categories
from app.controller.authentication.permission_required import permission_required

create_categories_blueprint = Blueprint('create_categories', __name__)

class CreateCategoriesController:
    @staticmethod
    @create_categories_blueprint.route('/api/categories/create_category', methods=['POST'])
    @permission_required('has_admin_permission')  
    def create_category(**kwargs):  # ✅ Added **kwargs
        """Create a new category"""
        try:
            # Access current user if needed
            current_user = kwargs.get('current_user')
            if current_user:
                print(f"🎯 Admin user {current_user.email} is creating a new category")
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False, 
                    'message': 'No data provided'
                }), 400
            
            # Extract category data from request
            title = data.get('title')
            description = data.get('description')
            
            # Use the entity method to create category
            success, status_code, message, new_category = Categories.createCategory(
                title=title,
                description=description
            )
            
            if success and new_category:
                return jsonify({
                    'success': True,
                    'message': message,
                    'category': new_category.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in create_category controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating category: {str(e)}'
            }), 500