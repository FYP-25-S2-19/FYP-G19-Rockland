from flask import Blueprint, jsonify, request
from app.entity.rock_spawn import RockSpawn
from app.controller.authentication.permission_required import permission_required

get_nearby_spawns_blueprint = Blueprint('get_nearby_spawns', __name__)

@get_nearby_spawns_blueprint.route("/api/spawns/nearby", methods=["GET"])
@permission_required([])
def get_nearby_spawns(current_user):
    try:
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
        radius = float(request.args.get("radius", 10000))

        success, status, message, data = RockSpawn.get_nearby_spawns(current_user.user_id, lat, lng, radius)

        return jsonify({
            "success": success,
            "message": message,
            **data  # ✅ This unpacks both 'zone' and 'spawns' correctly
        }), status

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500