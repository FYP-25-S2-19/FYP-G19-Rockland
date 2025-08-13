# app/controller/rock/search_rock_controller.py
from flask import Blueprint, request, jsonify
from app.entity.rock import Rock
from app.controller.authentication.permission_required import permission_required

search_rock_blueprint: Blueprint = Blueprint('search_rock_bp', __name__)

@search_rock_blueprint.route('/api/rocks/search', methods=['GET'])
def search_rocks():
    try:
        query_params = request.args

        filters = {
            "rock_name": query_params.get("rock_name", ""),  
            "rock_type": query_params.getlist('rock_type[]'),
            "rarity": query_params.getlist('rarity[]'),
            "common_location": query_params.getlist('location[]'),
            "sort": query_params.get('sort_by')
        }

        # ⬇️ This is where all business logic happens (inside entity)
        rocks = Rock.search_rocks(filters)
        print("Received rock_name:", query_params.get("rock_name"))

        return jsonify({
            "success": True,
            "total": len(rocks),
            "rocks": [rock.to_dict() for rock in rocks]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@search_rock_blueprint.route('/api/rocks/filter-options-v2', methods=['GET'])
def get_filter_options_v2():
    try:
        filter_options = Rock.get_filter_options()
        return jsonify({
            "success": True,
            "filter_options": filter_options
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)
        }), 500
