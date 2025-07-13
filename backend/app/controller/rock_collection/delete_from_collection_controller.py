# app/controller/rock_collection/delete_from_collection_controller.py

from flask import Blueprint, jsonify
from app.entity.user_rock_collection import UserRockCollection
from app.controller.authentication.permission_required import permission_required

login_required = permission_required([])

delete_from_collection_bp = Blueprint("delete_from_collection_bp", __name__)

@delete_from_collection_bp.route("/api/collection/delete/<int:collection_id>", methods=["DELETE"])
@login_required
def delete_from_collection(current_user, collection_id):
    success, code, message = UserRockCollection.delete_from_collection(
        collection_id=collection_id,
        user_id=current_user.user_id
    )
    return jsonify({"message": message}), code
