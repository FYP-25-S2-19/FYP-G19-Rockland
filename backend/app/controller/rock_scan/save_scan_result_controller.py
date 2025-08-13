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

    # Normalize scan object (supports model or dict)
    scan_json = scan.to_dict() if hasattr(scan, "to_dict") else scan

    # ---- Soft-handle duplicates so the frontend doesn't treat it as an error ----
    msg_l = (message or "").lower()
    is_duplicate_msg = any(
        key in msg_l for key in ("duplicate", "already scanned", "already-scanned", "already_scanned", "nearby")
    )
    if not success and (code in (400, 409) or is_duplicate_msg):
        return jsonify({
            "success": True,          # treat as soft success
            "duplicate": True,        # flag for UI to show the “already scanned nearby” notice
            "message": message,
            "scan": scan_json
        }), 200

    # ---- Keep daily limit as a real error ----
    if not success and (message or "").lower() == "limit_reached":
        return jsonify({
            "success": False,
            "limit_reached": True,
            "message": "Daily scan limit reached for Free users.",
            "scan": scan_json
        }), 403

    # ---- Default passthrough ----
    return jsonify({
        "success": success,
        "message": message,
        "scan": scan_json
    }), code
