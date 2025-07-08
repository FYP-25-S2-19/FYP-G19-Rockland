from flask import Blueprint, jsonify
from app.entity.rock import Rock
from app.controller.authentication.permission_required import permission_required

delete_rock_blueprint = Blueprint('delete_rock', __name__)

class DeleteRockController:
    @staticmethod
    @delete_rock_blueprint.route('/api/rocks/delete/<int:rock_id>', methods=['DELETE'])
    @permission_required(['has_expert_permission', 'has_admin_permission'])  # Expert OR Admin
    def delete_rock(rock_id, current_user=None):
        """Delete a rock (Expert or Admin only)"""
        try:
            success, status_code, message = Rock.delete_rock(rock_id)

            return jsonify({
                'success': success,
                'message': message
            }), status_code

        except Exception as e:
            return jsonify({
                'success': False,
                'message': f"Error deleting rock: {str(e)}"
            }), 500
