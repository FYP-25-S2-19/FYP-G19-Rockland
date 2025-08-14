from flask import Blueprint, request, jsonify
from app.entity.rock_scan_history import RockScanHistory
from app.controller.authentication.permission_required import permission_required
from app.entity.user import User

save_scan_result_blueprint = Blueprint("save_scan_result", __name__)
login_required = permission_required([])  # Only login required

DAILY_FREE_LIMIT = 3  # Safety net; entity keeps its own (5) but we block at 3 first

@save_scan_result_blueprint.route("/api/scan/save", methods=["POST"])
@login_required
def save_scan_result(current_user):
    """
    Saves a scan result to history + collection.
    Safety guard: re-check 3/day for Free users to prevent direct-calls bypass.
    Treat "already scanned nearby" as a soft success (duplicate=True).
    """
    data = request.get_json() or {}

    # ---- Safety: re-check limit for Free users ----
    try:
        user = User.queryUserById(current_user.user_id)
        if user and user.user_type and user.user_type.name == "Free":
            todays = RockScanHistory.get_today_scan_count(current_user.user_id)
            if todays >= DAILY_FREE_LIMIT:
                return jsonify({
                    "success": False,
                    "limit_reached": True,
                    "message": "Daily scan limit reached for Free users.",
                    "scan": None
                }), 403
    except Exception as e:
        print("⚠️ Warning: limit safety check failed:", str(e))
        # Don't fail hard here; proceed to entity which also checks (at 5) as a last resort.

    # ---- Call entity method to persist ----
    success, code, message, scan = RockScanHistory.save_scan_and_add_to_collection(
        user_id=current_user.user_id,
        data=data
    )

<<<<<<< HEAD
    # Shape the scan object for client
    scan_json = scan.to_dict() if hasattr(scan, "to_dict") and scan else scan

    # ---- Handle duplicate nearby scan as soft success (200, duplicate=True) ----
    is_duplicate_msg = (message or "").lower().find("already scanned") != -1
    if not success and (code in (400, 409) or is_duplicate_msg):
        return jsonify({
            "success": True,          # soft success
            "duplicate": True,        # flag so UI can show “already scanned nearby”
=======
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
>>>>>>> origin/Ken14Aug
            "message": message,
            "scan": scan_json
        }), 200

    # ---- Keep daily limit as a real error ----
    if not success and (message or "").lower() == "limit_reached":
        return jsonify({
            "success": False,
            "limit_reached": True,
            "message": "Daily scan limit reached for Free users.",
<<<<<<< HEAD
            "scan": None
        }), 403

    # ---- Other errors ----
    if not success:
        return jsonify({
            "success": False,
            "error": message or "Failed to save scan",
            "scan": scan_json
        }), code or 500

    # ---- Success ----
    return jsonify({
        "success": True,
        "message": message or "Scan saved successfully",
        "scan": scan_json
    }), code or 200
=======
            "scan": scan_json
        }), 403

    # ---- Default passthrough ----
    return jsonify({
        "success": success,
        "message": message,
        "scan": scan_json
    }), code
>>>>>>> origin/Ken14Aug
