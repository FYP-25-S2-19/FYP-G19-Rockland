# zone_controller/delete_zone.py
from flask import Blueprint, jsonify
from app.entity.zone_profile import ZoneProfile
from app.controller.authentication.permission_required import permission_required

delete_zone_blueprint = Blueprint('delete_zone', __name__)

@delete_zone_blueprint.route('/api/zones/delete/<int:zone_id>', methods=['DELETE'])
@permission_required('has_admin_permission', 'has_expert_permission')
def delete_zone(zone_id, current_user=None):
    success, status, msg = ZoneProfile.delete_zone(zone_id)
    return jsonify({"success": success, "message": msg}), status

@delete_zone_blueprint.route('/api/zones/admin/delete/<int:zone_id>', methods=['DELETE'])
@permission_required('has_admin_permission')
def delete_zone_admin(zone_id, current_user=None):
    """Admin delete zone for management page"""
    try:
        print(f"🗑️ Admin {current_user.email if current_user else 'Unknown'} is deleting zone {zone_id}")
        
        success, status, msg = ZoneProfile.delete_zone(zone_id)
        return jsonify({"success": success, "message": msg}), status
        
    except Exception as e:
        print(f"Error in delete_zone_admin controller: {e}")
        return jsonify({
            'success': False,
            'message': f'Error deleting zone: {str(e)}'
        }), 500