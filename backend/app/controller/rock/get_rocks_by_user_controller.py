# app/controller/rock/get_rocks_by_user_controller.py
from flask import Blueprint, jsonify
from app.entity.rock import Rock
from app.controller.authentication.permission_required import permission_required

login_required = permission_required([])

get_rocks_by_user_blueprint = Blueprint("get_rocks_by_user_blueprint", __name__)

@get_rocks_by_user_blueprint.route("/api/rocks/user/<int:user_id>", methods=["GET"])
@login_required
def get_rocks_by_user(user_id, **kwargs):
    try:
        current_user = kwargs.get("current_user")
        if not current_user:
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        # Optional: only allow experts/admins to query arbitrary user_id,
        # or require user_id == current_user.user_id
        # if user_id != current_user.user_id and not current_user.has_admin_permission:
        #     return jsonify({"success": False, "message": "Forbidden"}), 403

        rocks = Rock.get_rocks_by_user(user_id)
        return jsonify({
            "success": True,
            "total": len(rocks),
            "rocks": [rock.to_dict() for rock in rocks]
        }), 200
    except Exception as e:
        print(f"Error in get_rocks_by_user: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@get_rocks_by_user_blueprint.route("/api/rocks/user/me", methods=["GET"])
@login_required
def get_my_recent_rocks(**kwargs):
    try:
        current_user = kwargs.get("current_user")
        if not current_user:
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        rocks = Rock.get_recent_rocks_by_user(current_user.user_id, limit=6)
        return jsonify({
            "success": True,
            "total": len(rocks),
            "rocks": [rock.to_dict() for rock in rocks]
        }), 200
    except Exception as e:
        print(f"❌ Error in get_my_recent_rocks: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
