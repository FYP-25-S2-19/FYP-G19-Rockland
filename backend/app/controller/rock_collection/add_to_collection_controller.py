from flask import Blueprint, request, jsonify
from app.entity.user_rock_collection import UserRockCollection
from app.controller.authentication.permission_required import permission_required

add_to_collection_bp = Blueprint("add_to_collection_bp", __name__)
login_required = permission_required([])

@add_to_collection_bp.route("/api/collection/add", methods=["POST"])
@login_required
def add_to_collection(current_user):
    try:
        data = request.get_json()
        print("👤 Current user ID:", current_user.user_id)
        print("🪨 Rock ID:", data.get("rock_id"))

        rock_data = {
            "user_id": current_user.user_id,
            "rock_id": data.get("rock_id"),
            "source": data.get("source"),
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),
            "location_name": data.get("location_name"),
        }

        print("📥 Incoming rock data:", rock_data)

        success, code, message, new_entry = UserRockCollection.add_to_collection(**rock_data)

        if success:
            return jsonify({
                "message": message,
                "collection": new_entry.to_dict()
            }), code

        return jsonify({"message": message}), code

    except Exception as e:
        import traceback
        print(f"❌ Unhandled controller error: {e}")
        traceback.print_exc()
        return jsonify({"message": f"Unhandled Error: {str(e)}"}), 500
