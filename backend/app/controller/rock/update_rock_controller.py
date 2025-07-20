from flask import Blueprint, request, jsonify
from app.entity.rock import Rock
from app.controller.authentication.permission_required import permission_required
from app.utils.spawn_logic import get_all_rocks  # ✅ Added

update_rock_blueprint = Blueprint('update_rock', __name__)

class UpdateRockController:
    @staticmethod
    @update_rock_blueprint.route('/api/rocks/update/<int:rock_id>', methods=['PUT'])
    @permission_required('has_expert_permission')
    def update_rock(rock_id, current_user=None):
        """Update an existing rock (Expert only)"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400

            data["user_id"] = current_user.user_id
            success, status_code, message, updated_rock = Rock.update_rock(rock_id, **data)

            if success:
                get_all_rocks.cache_clear()  # ✅ Clear cache after update
                return jsonify({
                    'success': True,
                    'message': message,
                    'rock': updated_rock.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code

        except Exception as e:
            return jsonify({
                'success': False,
                'message': f"Error updating rock: {str(e)}"
            }), 500
