# /api/zones/public
from flask import Blueprint, jsonify, request
from app.entity.zone_profile import ZoneProfile

zones_public_blueprint = Blueprint("zones_public", __name__)

@zones_public_blueprint.route("/api/zones/public", methods=["GET"])
def zones_public():
    include_polygon = str(request.args.get("include_polygon", "0")).lower() in ("1","true","yes")
    only_active = str(request.args.get("active", "true")).lower() not in ("0","false","no")

    q = ZoneProfile.query
    if only_active:
        q = q.filter(ZoneProfile.is_active.is_(True))

    zones = q.order_by(ZoneProfile.priority.desc(), ZoneProfile.zone_id.asc()).all()
    return jsonify({"success": True, "zones": [z.to_dict(include_polygon=include_polygon) for z in zones]}), 200
