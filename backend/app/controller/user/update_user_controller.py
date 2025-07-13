# 📂 app/controller/user/update_user.py
from flask import Blueprint, request, jsonify
from app.entity.user import User
from app.controller.authentication.permission_required import permission_required

update_user_blueprint = Blueprint('update_user', __name__)

class UpdateUserController:
    @update_user_blueprint.route('/api/users/update_user', methods=['POST'])
    @permission_required([])  # Logic inside entity handles admin vs normal user
    def update_user(current_user):
        updated_details = request.get_json()

        success, status_code, message, updated_user = User.updateUserAccount(
            current_user=current_user,
            data=updated_details
        )

        if not success:
            return jsonify({"success": False, "error": message}), status_code

        return jsonify({
            "success": True,
            "message": message,
            "user": updated_user.to_dict()
        }), status_code
