from flask import Blueprint, jsonify
from app.entity.rock import Rock  # Adjust path if needed

filter_options_blueprint = Blueprint("filter_options", __name__)

@filter_options_blueprint.route("/api/rocks/filter-options", methods=["GET"])
def get_filter_options():
    try:
        data = Rock.get_filter_options()
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500