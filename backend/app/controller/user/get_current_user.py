from flask import Blueprint, jsonify
from app.controller.authentication.jwt_required import jwt_required

# 📄 Route: GET /api/users/me
# 🔐 Description: Returns the profile of the currently authenticated user.
# ⚠️ Requires a valid JWT token in the Authorization header.

get_current_user_blueprint = Blueprint('get_current_user', __name__)

@get_current_user_blueprint.route('/api/users/me', methods=['GET'])
@jwt_required
def get_current_user(current_user=None):
    """
    Get current logged-in user's profile based on JWT token.

    Returns:
        JSON response with user data if authenticated, or 401 if unauthorized.
    """
    try:
        if not current_user:
            return jsonify({
                "success": False,
                "error": "Unauthorized: No current user found"
            }), 401

        return jsonify({
            "success": True,
            "user": current_user.to_dict(),
            "message": "User profile loaded successfully"
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get current user: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve profile",
            "details": str(e)
        }), 500
