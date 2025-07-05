from flask import Blueprint, request, jsonify
from app.entity.categories import Categories
# Temporarily comment out the permission_required import
# from app.controller.authentication.permission_required import permission_required

view_categories_blueprint = Blueprint('view_categories', __name__)

class ViewCategoriesController:
    
    # Get all categories for admin view
    @staticmethod
    @view_categories_blueprint.route('/api/categories/all', methods=['GET'])
    # @permission_required('has_admin_permission')  # Temporarily commented out
    def get_all_categories(**kwargs):
        try:
            categories = Categories.getAllCategories()
            
            if categories is not None:
                # Convert to list of dictionaries
                categories_data = [category.to_dict() for category in categories]
                return jsonify({"success": True, "categories": categories_data}), 200
            else:
                return jsonify({"success": False, "error": "Failed to fetch categories"}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error: {str(e)}"}), 500