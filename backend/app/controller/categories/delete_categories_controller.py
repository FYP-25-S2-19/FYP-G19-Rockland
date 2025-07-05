# Libraries
from flask import Blueprint, request, jsonify

# Local dependencies
from app.entity.categories import Categories
# Temporarily comment out the permission_required import
from app.controller.authentication.permission_required import permission_required

delete_categories_blueprint = Blueprint('delete_categories', __name__)

class DeleteCategoriesController:
    @staticmethod
    @delete_categories_blueprint.route('/api/categories/delete_category', methods=['POST'])
    @permission_required('has_admin_permission')  # Temporarily commented out
    def delete_category(**kwargs):
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    "success": False,
                    "error": "No data provided"
                }), 400
            
            category_id = data.get("id")
            
            if not category_id:
                return jsonify({
                    "success": False,
                    "error": "Category ID is required"
                }), 400
            
            # Convert category_id to integer if it's a string
            try:
                category_id = int(category_id)
            except (ValueError, TypeError):
                return jsonify({
                    "success": False,
                    "error": "Invalid category ID format"
                }), 400
            
            # Use the entity method to delete category
            success, status_code, message = Categories.deleteCategory(category_id)
            
            if success:
                return jsonify({
                    "success": True,
                    "message": message
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "error": message
                }), status_code
                
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Error deleting category: {str(e)}"
            }), 500