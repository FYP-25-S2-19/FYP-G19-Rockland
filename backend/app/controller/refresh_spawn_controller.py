# app/controllers/refresh_spawn_controller.py
from flask import Blueprint, jsonify, request
from app.utils.refresh_spawns import run_refresh_spawn
import os

refresh_spawn_bp = Blueprint("refresh_spawn", __name__)

@refresh_spawn_bp.route("/api/cron/refresh_spawn", methods=["POST"])
def refresh_spawn():
    """Trigger rock spawn refresh securely (used by Cloud Scheduler)."""
    # Validate secret token
    secret_token = os.getenv("CRON_SECRET", "my-secret-token")  # set in env
    auth_header = request.headers.get("Authorization")

    if not auth_header or auth_header != f"Bearer {secret_token}":
        return jsonify({"error": "Unauthorized"}), 401

    # Run refresh logic
    result = run_refresh_spawn()
    return jsonify(result), 200
