# zone_controller/create_zone.py
from flask import Blueprint, request, jsonify
from app.entity.zone_profile import ZoneProfile
from app.controller.authentication.permission_required import permission_required

create_zone_blueprint = Blueprint('create_zone', __name__)

@create_zone_blueprint.route('/api/zones/create', methods=['POST'])
@permission_required('has_admin_permission', 'has_expert_permission')
def create_zone(current_user=None):
    data = request.get_json()
    success, status, msg, zone = ZoneProfile.create_zone(data)
    if success:
        return jsonify({"success": True, "zone": zone, "message": msg}), status
    return jsonify({"success": False, "message": msg}), status