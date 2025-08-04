from flask import Blueprint, request, jsonify
from app.entity.user import User
from app.controller.authentication.permission_required import permission_required


change_password_bp = Blueprint("change_password_bp", __name__)

@change_password_bp.route("/api/users/change_password", methods=["POST"])
@permission_required([])
def change_password(current_user):
    data = request.get_json()

    # Extract fields
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    # Pass to entity
    success, code, message, user = User.changePassword(current_user, current_password, new_password)
    return jsonify({"success": success, "message": message}), code
