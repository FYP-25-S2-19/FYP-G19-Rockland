# zone_controller/update_zone.py
from flask import Blueprint, request, jsonify
from app.entity.zone_profile import ZoneProfile
from app.controller.authentication.permission_required import permission_required

update_zone_blueprint = Blueprint('update_zone', __name__)

@update_zone_blueprint.route('/api/zones/update/<int:zone_id>', methods=['PUT'])
@permission_required('has_admin_permission', 'has_expert_permission')
def update_zone(zone_id, current_user=None):
    data = request.get_json()
    success, status, msg, zone = ZoneProfile.update_zone(zone_id, data)
    if success:
        return jsonify({"success": True, "zone": zone, "message": msg}), status
    return jsonify({"success": False, "message": msg}), status