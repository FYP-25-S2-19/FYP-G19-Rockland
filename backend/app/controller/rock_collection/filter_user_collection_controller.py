from flask import Blueprint, jsonify, request
from app.entity.user_rock_collection import UserRockCollection
from app.controller.authentication.permission_required import permission_required

filter_user_collection_blueprint = Blueprint("filter_user_collection_bp", __name__)
login_required = permission_required([])

@filter_user_collection_blueprint.route("/api/collection/filter", methods=["POST"])
@login_required
def filter_user_collection(current_user):
    try:
        filters = request.get_json()

        # Format dates from string to datetime
        from datetime import datetime
        if filters.get("startDate"):
            filters["startDate"] = datetime.fromisoformat(filters["startDate"])
        if filters.get("endDate"):
            filters["endDate"] = datetime.fromisoformat(filters["endDate"])

        collection = UserRockCollection.filter_user_collection(current_user.user_id, filters)
        return jsonify({
            "success": True,
            "total": len(collection),
            "collection": [item.to_dict() for item in collection]
        }), 200
    except Exception as e:
        print(f"Error in filter_user_collection: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
