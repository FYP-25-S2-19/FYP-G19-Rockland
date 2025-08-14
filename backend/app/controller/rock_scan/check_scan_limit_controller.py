from flask import Blueprint, jsonify, request
from app.entity.rock_scan_history import RockScanHistory
from app.controller.authentication.permission_required import permission_required
from app.entity.user import User

check_scan_limit_blueprint = Blueprint("check_scan_limit", __name__)
login_required = permission_required([])  # login only

DAILY_FREE_LIMIT = 3  # Source of truth for Free users (entity remains untouched)

@check_scan_limit_blueprint.route("/api/scan/check-limit", methods=["GET"])
@login_required
def check_scan_limit(current_user):
    """
    Returns the shape the mobile app expects:
    {
      success: True,
      allowed: bool,
      remaining: int | None,
      limit: int | None,
      # back-compat:
      limit_exceeded: bool,
      scan_count: int
    }
    """
    try:
        # If you also pass user_id via query args, we ignore it and trust the token.
        user = User.queryUserById(current_user.user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404

        scan_count = RockScanHistory.get_today_scan_count(current_user.user_id)

        is_free = bool(user.user_type and user.user_type.name == "Free")
        limit = DAILY_FREE_LIMIT if is_free else None

        if limit is None:
            allowed = True
            remaining = None
            limit_exceeded = False
        else:
            allowed = scan_count < limit
            remaining = max(limit - scan_count, 0)
            limit_exceeded = not allowed

        return jsonify({
            "success": True,
            "allowed": allowed,
            "remaining": remaining,
            "limit": limit,
            # old fields for back-compat with any older screens:
            "limit_exceeded": limit_exceeded,
            "scan_count": scan_count
        }), 200

    except Exception as e:
        print("❌ /api/scan/check-limit error:", str(e))
        return jsonify({"success": False, "error": "Internal server error"}), 500
