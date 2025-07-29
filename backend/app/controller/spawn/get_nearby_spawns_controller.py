# app/controller/spawn/get_nearby_spawns.py
from flask import Blueprint, jsonify, request
from app.entity.rock_spawn import RockSpawn
from app.entity.zone_profile import ZoneProfile
from app.controller.authentication.permission_required import permission_required
from app.utils.spawn_generator import generate_dynamic_spawn

get_nearby_spawns_blueprint = Blueprint('get_nearby_spawns', __name__)

@get_nearby_spawns_blueprint.route("/api/spawns/nearby", methods=["GET"])
@permission_required([])
def get_nearby_spawns(current_user):
    """
    Fetch nearby spawns.
    Auto-spawn if none found (respects zone cooldown).
    Always return zone info.
    """
    try:
        # -----------------------
        # Parse Query Params
        # -----------------------
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
        radius = float(request.args.get("radius", 1000))

        # -----------------------
        # Determine Zone
        # -----------------------
        zone = ZoneProfile.get_zone_by_coordinates(lat, lng)
        if not zone:
            print(f"⚠ No zone found for coordinates ({lat}, {lng})")
            return jsonify({
                "success": True,
                "message": "No zone found for location",
                "zone": None,
                "spawns": []
            }), 200

        print(f"\n🌍 Request in Zone: {zone.zone_name} | Radius: {radius}m")

        # -----------------------
        # Fetch Existing Spawns
        # -----------------------
        success, status, message, data = RockSpawn.get_nearby_spawns(
            current_user.user_id, lat, lng, radius
        )

        # Count initial spawns
        initial_count = len(data.get("spawns", [])) if data else 0
        print(f"Initial spawns found: {initial_count}")

        # -----------------------
        # Auto-Respawn if none
        # -----------------------
        if initial_count == 0:
            print(f"🔄 No active spawns. Attempting dynamic generation for {zone.zone_name}")
            generate_dynamic_spawn(lat, lng, zone)

            # Re-fetch after generation
            success, status, message, data = RockSpawn.get_nearby_spawns(
                current_user.user_id, lat, lng, radius
            )

            respawn_count = len(data.get("spawns", [])) if data else 0
            print(f"Post-generation spawns: {respawn_count}")

        # Always include zone info in response
        return jsonify({
            "success": success,
            "message": message,
            "zone": zone.to_dict(),
            "spawns": data.get("spawns", []),
            "spawn_count": len(data.get("spawns", []))  # Debug info
        }), status

    except Exception as e:
        print(f"❌ Error in /spawns/nearby: {e}")
        return jsonify({"success": False, "message": str(e), "zone": None, "spawns": []}), 500
