# zone_controller/active_state.py
from flask import Blueprint, jsonify, request
from app.entity.zone_profile import ZoneProfile
from app.controller.authentication.permission_required import permission_required

active_state_blueprint = Blueprint('zone_active_state', __name__)

@active_state_blueprint.route('/api/zones/<int:zone_id>/suspend', methods=['POST'])
@permission_required('has_admin_permission')
def suspend_zone(zone_id, current_user=None):
    reason = (request.get_json() or {}).get("reason")
    ok, status, msg, zone = ZoneProfile.set_active(zone_id, False, reason=reason)
    return jsonify({"success": ok, "message": msg, "zone": zone}), status

@active_state_blueprint.route('/api/zones/<int:zone_id>/activate', methods=['POST'])
@permission_required('has_admin_permission')
def activate_zone(zone_id, current_user=None):
    ok, status, msg, zone = ZoneProfile.set_active(zone_id, True)
    return jsonify({"success": ok, "message": msg, "zone": zone}), status
