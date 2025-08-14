# app/controller/spawn/refresh_spawn.py
from flask import Blueprint, jsonify, request
from app.entity.rock_spawn import RockSpawn
from app.controller.authentication.permission_required import permission_required

refresh_spawn_blueprint = Blueprint("refresh_spawn", __name__)

@refresh_spawn_blueprint.route("/api/spawns/refresh", methods=["POST"])
@permission_required([])  # Any logged-in user can trigger
def refresh_spawn(current_user):
    try:
        data = request.get_json() or {}
        lat = float(data.get("latitude"))
        lng = float(data.get("longitude"))
    except Exception:
        return jsonify({"success": False, "message": "Latitude and longitude required"}), 400

    success, status, payload = RockSpawn.refresh_at(lat, lng)
    return jsonify(payload), status
