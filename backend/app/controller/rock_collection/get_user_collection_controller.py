# app/controller/rock_collection/get_user_collection_controller.py

from flask import Blueprint, jsonify
from app.entity.user_rock_collection import UserRockCollection
from app.controller.authentication.permission_required import permission_required

login_required = permission_required([])

get_user_collection_blueprint = Blueprint("get_user_collection_bp", __name__)

@get_user_collection_blueprint.route("/api/collection/user/<int:user_id>", methods=["GET"])
@login_required
def get_user_collection(current_user, user_id):
    # Ensure user can only view their own collection
    if current_user.user_id != user_id:
        return jsonify({
            "success": False,
            "error": "Access denied: You can only view your own collection."
        }), 403

    try:
        collection = UserRockCollection.get_user_collection(user_id)
        return jsonify({
            "success": True,
            "total": len(collection),
            "collection": [item.to_dict() for item in collection]
        }), 200
    except Exception as e:
        print(f"Error in get_user_collection: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
