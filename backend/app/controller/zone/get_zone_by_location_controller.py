# zone_controller/get_zone_by_location.py
from flask import Blueprint, request, jsonify
from app.entity.zone_profile import ZoneProfile
from app.controller.authentication.permission_required import permission_required

get_zone_by_location_blueprint = Blueprint('get_zone_by_location', __name__)

@get_zone_by_location_blueprint.route('/api/zones/match_location', methods=['GET'])
@permission_required([])
def get_zone_by_location():
    try:
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
        zone = ZoneProfile.get_zone_by_coordinates(lat, lng)
        if zone:
            return jsonify({"success": True, "zone": zone.to_dict()}), 200
        return jsonify({"success": False, "message": "No matching zone"}), 404
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400
