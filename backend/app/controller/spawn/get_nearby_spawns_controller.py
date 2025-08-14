# app/controller/spawn/get_nearby_spawns.py
from flask import Blueprint, jsonify, request
from app.entity.rock_spawn import RockSpawn
from app.controller.authentication.permission_required import permission_required

get_nearby_spawns_blueprint = Blueprint("get_nearby_spawns", __name__)

@get_nearby_spawns_blueprint.route("/api/spawns/nearby", methods=["GET"])
@permission_required([])
def get_nearby_spawns(current_user):
    try:
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
        radius = float(request.args.get("radius", 1000))

        success, status, payload = RockSpawn.nearby_with_zone_and_autospawn(
            user_id=current_user.user_id,
            lat=lat,
            lng=lng,
            radius_m=radius
        )
        return jsonify(payload), status
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e),
            "zone": None,
            "spawns": [],
            "spawn_count": 0
        }), 500
