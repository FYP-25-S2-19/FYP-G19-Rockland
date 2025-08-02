# zone_controller/view_zone.py
from flask import Blueprint, jsonify
from app.entity.zone_profile import ZoneProfile
from app.controller.authentication.permission_required import permission_required

view_zone_blueprint = Blueprint('view_zone', __name__)

class ViewZoneController:
    
    @staticmethod
    @view_zone_blueprint.route('/api/zones/admin/all', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_all_zones_admin(**kwargs):
        """Fetch all zones for admin view"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"🌍 Admin {current_user.email} is viewing all zones")
            
            # Use the entity method to get all zones
            zones_data, status_code = ZoneProfile.getAllZonesForAdmin()
            
            if zones_data is not None:
                return jsonify({
                    'success': True,
                    'message': 'Zones fetched successfully',
                    'zones': zones_data,
                    'total_count': len(zones_data)
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to fetch zones'
                }), status_code
                
        except Exception as e:
            print(f"Error in get_all_zones_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching zones: {str(e)}'
            }), 500
    
    @staticmethod
    @view_zone_blueprint.route('/api/zones/view/<int:zone_id>', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_zone_detail_admin(zone_id, **kwargs):
        """When admin click view, shows the detail of the zone"""
        try:
            # Access current admin user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Admin authentication required'
                }), 401
            
            print(f"👁️ Admin {current_user.email} is viewing zone details {zone_id}")
            
            # Use the entity method to get zone details
            zone_data, status_code, message = ZoneProfile.getZoneById(zone_id)
            
            if zone_data is not None:
                return jsonify({
                    'success': True,
                    'message': message,
                    'zone': zone_data
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
                
        except Exception as e:
            print(f"Error in get_zone_detail_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching zone: {str(e)}'
            }), 500