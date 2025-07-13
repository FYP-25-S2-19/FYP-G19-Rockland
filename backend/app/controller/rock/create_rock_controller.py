from flask import Blueprint, request, jsonify
from app.entity.rock import Rock
from app.controller.authentication.permission_required import permission_required

create_rock_blueprint = Blueprint('create_rock', __name__)

class CreateRockController:
    @staticmethod
    @create_rock_blueprint.route('/api/rocks/create', methods=['POST'])
    @permission_required('has_expert_permission')  # Only experts allowed
    def create_rock(current_user=None):
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400

            # ✅ Inject current user's ID into the data dict
            data['user_id'] = current_user.user_id

            # ✅ Call logic inside the entity
            success, status_code, message, rock = Rock.create_rock(**data)

            if success:
                return jsonify({
                    'success': True,
                    'message': message,
                    'rock': rock.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code

        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error creating rock: {str(e)}'
            }), 500
