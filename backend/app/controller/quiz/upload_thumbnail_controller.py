from flask import Blueprint, request, jsonify
import os
from app.controller.authentication.permission_required import permission_required

upload_thumbnail_blueprint = Blueprint('upload_thumbnail', __name__)

@upload_thumbnail_blueprint.route('/api/upload-thumbnail', methods=['POST'])
@permission_required("has_expert_permission")
def upload_thumbnail(current_user):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = file.filename
    upload_folder = os.path.join('static', 'thumbnails')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    return jsonify({"blob_path": f"/static/thumbnails/{filename}"}), 200
