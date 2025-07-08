# app/controller/rock/get_rocks_by_user_controller.py

from flask import Blueprint, request, jsonify
from app.entity.rock import Rock
from app.controller.authentication.permission_required import permission_required
login_required = permission_required([])

get_rocks_by_user_blueprint = Blueprint("get_rocks_by_user_blueprint", __name__)

@get_rocks_by_user_blueprint.route("/api/rocks/user/<int:user_id>", methods=["GET"])
@login_required
def get_rocks_by_user(current_user, user_id):
    try:
        rocks = Rock.get_rocks_by_user(user_id)
        return jsonify({
            "success": True,
            "total": len(rocks),
            "rocks": [rock.to_dict() for rock in rocks]
        }), 200
    except Exception as e:
        print(f"Error in get_rocks_by_user: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
