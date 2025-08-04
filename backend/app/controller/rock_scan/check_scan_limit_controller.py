from flask import Blueprint, jsonify
from app.entity.rock_scan_history import RockScanHistory
from app.controller.authentication.permission_required import permission_required

check_scan_limit_blueprint = Blueprint("check_scan_limit", __name__)
login_required = permission_required([])

@check_scan_limit_blueprint.route("/api/scan/check-limit", methods=["GET"])
@login_required
def check_scan_limit(current_user):
    result = RockScanHistory.check_user_scan_limit(current_user.user_id)
    return jsonify(result), 200
