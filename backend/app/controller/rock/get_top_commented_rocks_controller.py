# app/controller/rock/get_top_commented_rocks_controller.py

from flask import Blueprint, jsonify
from app.entity.rock import Rock
from app.controller.authentication.permission_required import permission_required
login_required = permission_required([])

get_top_commented_rocks_blueprint = Blueprint("get_top_commented_rocks", __name__)

@get_top_commented_rocks_blueprint.route("/api/rocks/top-commented", methods=["GET"])
@login_required
def get_top_commented_rocks(current_user):
    try:
        rocks = Rock.get_top_commented_rocks(limit=4)
        return jsonify({
            "success": True,
            "total": len(rocks),
            "rocks": [rock.to_dict(include_comment_count=True) for rock in rocks]
        }), 200
    except Exception as e:
        print(f"Error fetching top commented rocks: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
