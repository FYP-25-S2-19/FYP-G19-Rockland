# zone_controller/get_all_zones.py
from flask import Blueprint, jsonify
from app.entity.zone_profile import ZoneProfile
from app.controller.authentication.permission_required import permission_required

get_all_zones_blueprint = Blueprint('get_all_zones', __name__)

@get_all_zones_blueprint.route('/api/zones/all', methods=['GET'])
@permission_required([])
def get_all_zones():
    success, status, msg, zones = ZoneProfile.get_all_zones()
    return jsonify({"success": success, "zones": zones, "message": msg}), status