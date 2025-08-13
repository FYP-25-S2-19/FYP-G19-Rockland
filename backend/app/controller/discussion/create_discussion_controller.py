from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.discussion import Discussion
from app.controller.authentication.permission_required import permission_required

create_discussion_blueprint = Blueprint('create_discussion', __name__)

class CreateDiscussionController:
    
    @staticmethod
    @create_discussion_blueprint.route('/api/discussions/create', methods=['POST'])
    @permission_required('has_premium_permission')
    def create_discussion(**kwargs):
        """Create a new discussion - requires premium permission"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    "success": False,
                    "message": "Premium authentication required"
                }), 401

            data = request.get_json()
            if not data:
                return jsonify({
                    "success": False,
                    "message": "No data provided"
                }), 400

            # Required
            text = (data.get('text') or '').strip()
            if not text:
                return jsonify({
                    "success": False,
                    "message": "Discussion text is required"
                }), 400

            # ✅ NEW: Optional category + interest tags
            categories_id = data.get('categories_id', None)
            interest_ids = data.get('interest_ids', None)

            if categories_id is not None and str(categories_id).isdigit():
                categories_id = int(categories_id)
            else:
                categories_id = None

            if isinstance(interest_ids, list):
                interest_ids = [int(x) for x in interest_ids if str(x).isdigit()]
            else:
                interest_ids = None  # None = ignore at create

            # Call entity method (entity handles validation & commit)
            success, status_code, message, discussion_data = Discussion.createDiscussion(
                user_id=current_user.user_id,
                text=text,
                categories_id=categories_id,
                interest_ids=interest_ids
            )

            if success:
                return jsonify({
                    "success": True,
                    "message": message,
                    "discussion": discussion_data
                }), status_code
            else:
                return jsonify({
                    "success": False,
                    "message": message
                }), status_code
            
        except Exception as e:
            db.session.rollback()
            print(f"Error in create_discussion controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating discussion: {str(e)}'
            }), 500
