from flask import Blueprint, jsonify
from app.entity.rock import Rock

get_rock_by_id_blueprint = Blueprint('get_rock_by_id', __name__)

class GetRockByIdController:
    @staticmethod
    @get_rock_by_id_blueprint.route('/api/rocks/<int:rock_id>', methods=['GET'])
    def get_rock_by_id(rock_id):
        """Get a single rock by ID (public access)"""
        try:
            rock = Rock.get_rock_by_id(rock_id)
            if not rock:
                return jsonify({
                    'success': False,
                    'message': f"Rock with ID {rock_id} not found"
                }), 404

            return jsonify({
                'success': True,
                'rock': rock.to_dict()
            }), 200

        except Exception as e:
            return jsonify({
                'success': False,
                'message': f"Error retrieving rock: {str(e)}"
            }), 500
