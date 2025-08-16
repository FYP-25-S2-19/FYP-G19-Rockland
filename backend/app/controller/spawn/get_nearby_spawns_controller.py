# app/controller/spawn/get_nearby_spawns.py
from flask import Blueprint, jsonify, request
from app.entity.rock_spawn import RockSpawn
from app.controller.authentication.permission_required import permission_required
import traceback

get_nearby_spawns_blueprint = Blueprint("get_nearby_spawns", __name__)

@get_nearby_spawns_blueprint.route("/api/spawns/nearby", methods=["GET"])
@permission_required([])
def get_nearby_spawns(current_user):
    try:
        # Log the incoming request
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
        radius = float(request.args.get("radius", 1000))
        
        print(f"🔍 SPAWN REQUEST: user_id={current_user.user_id}, lat={lat}, lng={lng}, radius={radius}")
        
        # Call the method with detailed error tracking
        success, status, payload = RockSpawn.nearby_with_zone_and_autospawn(
            user_id=current_user.user_id,
            lat=lat,
            lng=lng,
            radius_m=radius
        )
        
        print(f"✅ SPAWN RESPONSE: success={success}, status={status}")
        return jsonify(payload), status
        
    except ValueError as e:
        # Specific handling for parameter conversion issues
        error_msg = f"Invalid parameters: {str(e)}"
        print(f"❌ PARAM ERROR: {error_msg}")
        return jsonify({
            "success": False,
            "message": error_msg,
            "zone": None,
            "spawns": [],
            "spawn_count": 0
        }), 400
        
    except Exception as e:
        # Full stack trace for debugging
        error_msg = str(e)
        print(f"❌ SPAWN ERROR: {error_msg}")
        print(f"❌ FULL TRACEBACK:\n{traceback.format_exc()}")
        
        return jsonify({
            "success": False,
            "message": error_msg,
            "zone": None,
            "spawns": [],
            "spawn_count": 0
        }), 500