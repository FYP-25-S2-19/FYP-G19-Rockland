from flask import Blueprint, jsonify, request
from app.entity.user_rock_spawn import UserRockSpawn
from app.controller.authentication.permission_required import permission_required

collect_spawn_blueprint = Blueprint('collect_spawn', __name__)


@collect_spawn_blueprint.route("/api/spawns/collect/<int:rock_spawn_id>", methods=["POST"])
@permission_required([])
def collect_spawn(current_user, rock_spawn_id):
    """
    Controller: passes data to entity method (logic-free).
    """
    try:
        data = request.get_json()
        user_lat = float(data.get("latitude"))
        user_lng = float(data.get("longitude"))

        success, status, msg, new_entry = UserRockSpawn.collect_spawn_flow(
            current_user.user_id,
            rock_spawn_id,
            user_lat,
            user_lng
        )

        return jsonify({
            "success": success,
            "message": msg,
            "collected_at": new_entry.collected_at.isoformat() if new_entry else None
        }), status

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
