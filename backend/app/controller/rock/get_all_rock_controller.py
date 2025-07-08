from flask import Blueprint, jsonify
from app.entity.rock import Rock

get_all_rock_blueprint = Blueprint('get_all_rock', __name__)

class GetAllRockController:
    @staticmethod
    @get_all_rock_blueprint.route('/api/rocks', methods=['GET'])
    def get_all_rocks():
        """Get all rocks (public access)"""
        try:
            rocks = Rock.get_all_rocks()
            rock_data = [rock.to_dict() for rock in rocks]

            return jsonify({
                'success': True,
                'data': rock_data,
                'count': len(rock_data)
            }), 200

        except Exception as e:
            return jsonify({
                'success': False,
                'message': f"Error fetching rocks: {str(e)}"
            }), 500
