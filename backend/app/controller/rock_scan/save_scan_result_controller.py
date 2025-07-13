from flask import Blueprint, request, jsonify
from app.entity.rock_scan_history import RockScanHistory
from app.controller.authentication.permission_required import permission_required

save_scan_result_blueprint = Blueprint("save_scan_result", __name__)
login_required = permission_required([])  # Only login required

@save_scan_result_blueprint.route("/api/scan/save", methods=["POST"])
@login_required
def save_scan_result(current_user):
    try:
        data = request.get_json()

        if not data:
            return jsonify({ "success": False, "error": "No data provided" }), 400

        rock_name = data.get("rock_name", "").strip()
        rock_type = data.get("rock_type", "").strip()

        if not rock_name or not rock_type:
            return jsonify({ "success": False, "error": "rock_name and rock_type are required" }), 400

        success, code, message, scan = RockScanHistory.create_scan_record(
            user_id=current_user.user_id,
            rock_id=data.get("rock_id"),
            rock_name=rock_name,
            rock_type=rock_type,
            rarity=data.get("rarity"),
            image_url=data.get("image_url"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            location_name=data.get("location_name")
        )

        return jsonify({
            "success": success,
            "message": message,
            "scan": scan.to_dict() if scan else None
        }), code

    except Exception as e:
        print(f"Error in save_scan_result: {e}")
        return jsonify({ "success": False, "error": str(e) }), 500
