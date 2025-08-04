from flask import Blueprint, request, jsonify
from app.entity.rock_scan_history import RockScanHistory
from app.controller.authentication.permission_required import permission_required

save_scan_result_blueprint = Blueprint("save_scan_result", __name__)
login_required = permission_required([])  # Only login required

@save_scan_result_blueprint.route("/api/scan/save", methods=["POST"])
@login_required
def save_scan_result(current_user):
    data = request.get_json() or {}

    success, code, message, scan = RockScanHistory.save_scan_and_add_to_collection(
        user_id=current_user.user_id,
        data=data
    )

    return jsonify({
        "success": success,
        "message": message,
        "scan": scan.to_dict() if scan else None
    }), code
