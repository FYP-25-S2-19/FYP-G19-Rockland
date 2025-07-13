# 📂 app/controller/user/upload_profile_picture.py

from flask import Blueprint, request, jsonify
from app.controller.authentication.permission_required import permission_required
from app.entity.user import User

upload_profile_picture_blueprint = Blueprint("upload_profile_picture", __name__)

class UploadProfilePictureController:
    @upload_profile_picture_blueprint.route("/api/upload/profile_picture", methods=["POST"])
    @permission_required([])
    def upload_profile_picture(current_user):
        if "file" not in request.files:
            return jsonify({"success": False, "error": "No file uploaded"}), 400

        file = request.files["file"]

        # ✅ Delegate all logic to entity method
        success, code, message, updated_user = User.updateProfilePicture(
            current_user=current_user,
            file=file,
            filename=file.filename
        )

        if not success:
            return jsonify({"success": False, "error": message}), code

        # ✅ Only return blob path — no signed URL or user dict
        return jsonify({
            "success": True,
            "blob_path": updated_user.profile_picture
        }), 200
