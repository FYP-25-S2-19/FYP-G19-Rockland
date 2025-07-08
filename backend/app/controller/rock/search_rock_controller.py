# app/controller/rock/search_rock_controller.py
from flask import Blueprint, request, jsonify
from app.entity.rock import Rock
from app.controller.authentication.permission_required import permission_required

search_rock_blueprint: Blueprint = Blueprint('search_rock_bp', __name__)

@search_rock_blueprint.route('/api/rocks/search', methods=['GET'])
# All authenticated users can search
def search_rocks():
    try:
        query_params = request.args

        # Extract filter parameters from query string
        rock_type = query_params.get('rock_type')
        rarity = query_params.get('rarity')
        location = query_params.get('location')
        sort_by = query_params.get('sort_by')

        # Perform filtered search
        rocks = Rock.search_rocks(
            rock_type=rock_type,
            rarity=rarity,
            location=location,
            sort_by=sort_by
        )

        return jsonify({
            "success": True,
            "total": len(rocks),
            "rocks": [rock.to_dict() for rock in rocks]
        }), 200

    except Exception as e:
        print(f"Error in search_rocks: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
