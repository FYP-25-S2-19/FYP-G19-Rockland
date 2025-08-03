from flask import Blueprint, request, jsonify
from urllib.parse import urlparse
from app.entity.rock_scan_history import RockScanHistory
from app.entity.user_rock_collection import UserRockCollection
from app.entity.rock import Rock
from app.controller.authentication.permission_required import permission_required

save_scan_result_blueprint = Blueprint("save_scan_result", __name__)
login_required = permission_required([])  # Only login required

@save_scan_result_blueprint.route("/api/scan/save", methods=["POST"])
@login_required
def save_scan_result(current_user):
    try:
        data = request.get_json()

        if not data:
            print("❌ No data received in request")
            return jsonify({ "success": False, "error": "No data provided" }), 400

        rock_name = data.get("rock_name", "").strip()
        rock_type = data.get("rock_type", "").strip()

        if not rock_name or not rock_type:
            print("❌ Missing rock_name or rock_type")
            return jsonify({ "success": False, "error": "rock_name and rock_type are required" }), 400

        print(f"📥 Incoming scan data from user {current_user.user_id}:")
        print(f"  Rock Name: {rock_name}")
        print(f"  Rock Type: {rock_type}")
        print(f"  Lat/Lng: {data.get('latitude')}, {data.get('longitude')}")
        print(f"  Location: {data.get('location_name')}")

        signed_url = data.get("image_url")

        # ✅ Extract blob path from signed URL, removing bucket name
        def extract_blob_path(signed_url: str) -> str:
            parsed = urlparse(signed_url)
            path_parts = parsed.path.lstrip("/").split("/", 1)
            return path_parts[1] if len(path_parts) > 1 else ""

        blob_path = extract_blob_path(signed_url)

        # Save scan history (keep signed URL)
        success, code, message, scan = RockScanHistory.create_scan_record(
            user_id=current_user.user_id,
            rock_id=None,
            rock_name=rock_name,
            rock_type=rock_type,
            rarity=data.get("rarity"),
            image_url=signed_url,
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            location_name=data.get("location_name")
        )

        print("✅ Scan record created:", scan.to_dict() if scan else "None")
        print("🪨 Scan.rock_id =", scan.rock_id if scan else "None")

        if success and scan:
            rock = Rock.query.filter_by(rock_name=rock_name).first()
            if rock:
                print("🧱 Matched rock ID from rock table:", rock.rock_id)

                collection_success, collection_code, collection_msg, collection_entry = UserRockCollection.add_to_collection(
                    user_id=current_user.user_id,
                    rock_id=rock.rock_id,
                    source="scanned",
                    latitude=data.get("latitude"),
                    longitude=data.get("longitude"),
                    location_name=data.get("location_name"),
                    photo_url=blob_path  # ✅ Save correct GCS path
                )
                print("📤 Add to collection result:", collection_success, collection_code, collection_msg)
            else:
                print("❌ Could not find rock in rock table with name:", rock_name)
        else:
            print("⚠️ Skipped adding to collection. Scan or rock lookup failed.")

        return jsonify({
            "success": success,
            "message": message,
            "scan": scan.to_dict() if scan else None
        }), code

    except Exception as e:
        print(f"❌ Exception in save_scan_result: {e}")
        return jsonify({ "success": False, "error": str(e) }), 500
