from flask import Blueprint, request, jsonify
from datetime import datetime

# Update imports to match your project structure
from app.models import db
from app.entity.categories import Categories

create_categories_blueprint = Blueprint('create_categories', __name__)

class CreateCategoriesController:
    @staticmethod
    @create_categories_blueprint.route('/api/categories/create_category', methods=['POST'])
    def create_category():
        """Create a new category"""
        try:
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
            return jsonify({
                'success': False,
                'message': f'Error creating category: {str(e)}'
            }), 500