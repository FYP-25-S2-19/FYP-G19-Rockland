from flask import Blueprint, jsonify, request
from app.entity.zone_profile import ZoneProfile
from app.utils.spawn_generator import generate_dynamic_spawn
from app.controller.authentication.permission_required import permission_required

refresh_spawn_blueprint = Blueprint("refresh_spawn", __name__)

@refresh_spawn_blueprint.route("/api/spawns/refresh", methods=["POST"])
@permission_required([])  # Any logged-in user can trigger
def refresh_spawn(current_user):
    try:
        data = request.get_json()
        lat = data.get("latitude")
        lng = data.get("longitude")

        if lat is None or lng is None:
            return jsonify({"success": False, "message": "Latitude and longitude required"}), 400

        # Convert to float
        lat = float(lat)
        lng = float(lng)

        # Find zone for current coordinates
        zone = ZoneProfile.get_zone_by_coordinates(lat, lng)
        if not zone:
            return jsonify({"success": False, "message": "No zone found for this location"}), 404

        # Trigger dynamic spawn
        generate_dynamic_spawn(lat, lng, zone)

        return jsonify({"success": True, "message": "Spawn refresh triggered successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
