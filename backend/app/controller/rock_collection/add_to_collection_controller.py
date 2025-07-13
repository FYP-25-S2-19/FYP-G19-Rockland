# app/controller/rock_collection/add_to_collection_controller.py

from flask import Blueprint, request, jsonify
from app.entity.user_rock_collection import UserRockCollection
from app.controller.authentication.permission_required import permission_required

login_required = permission_required([])

add_to_collection_bp = Blueprint("add_to_collection_bp", __name__)

@add_to_collection_bp.route("/api/collection/add", methods=["POST"])
@login_required
def add_to_collection(current_user):
    data = request.get_json()

    rock_data = {
        "user_id": current_user.user_id,
        "rock_id": data.get("rock_id"),
        "source": data.get("source"),
        "image_url": data.get("image_url"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "location_name": data.get("location_name"),
    }

    success, code, message, new_entry = UserRockCollection.add_to_collection(**rock_data)
    if success:
        return jsonify({"message": message, "collection": new_entry.to_dict()}), code
    return jsonify({"message": message}), code
