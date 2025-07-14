from datetime import datetime
from flask import Blueprint, jsonify, request
from app.entity.rock_spawn import RockSpawn
from app.entity.user_rock_spawn import UserRockSpawn
from app.controller.authentication.permission_required import permission_required
from app.utils.geo import haversine
from app.models import db

collect_spawn_blueprint = Blueprint('collect_spawn', __name__)


@collect_spawn_blueprint.route("/api/spawns/collect/<int:rock_spawn_id>", methods=["POST"])
@permission_required([])
def collect_spawn(current_user, rock_spawn_id):
    try:
        data = request.get_json()
        user_lat = float(data.get("latitude"))
        user_lng = float(data.get("longitude"))

        spawn = RockSpawn.query.get(rock_spawn_id)
        if not spawn:
            return jsonify({"success": False, "message": "Spawn not found"}), 404

        if spawn.expires_at < datetime.utcnow():
            return jsonify({"success": False, "message": "Spawn expired"}), 400

        distance = haversine(user_lat, user_lng, spawn.latitude, spawn.longitude)
        if distance > 30:
            return jsonify({"success": False, "message": "Too far to collect this rock"}), 403

        if UserRockSpawn.has_already_collected(current_user.user_id, rock_spawn_id):
            return jsonify({"success": False, "message": "Already collected"}), 409

        success, status, msg, new_entry = UserRockSpawn.create(current_user.user_id, rock_spawn_id)
        if not success:
            return jsonify({"success": False, "message": msg}), status

        return jsonify({
            "success": True,
            "message": "Rock collected",
            "collected_at": new_entry.collected_at.isoformat()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
