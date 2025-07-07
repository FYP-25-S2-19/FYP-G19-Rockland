from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.user import User
from app.entity.token import Token

login_blueprint = Blueprint("login", __name__)

# 🔐 USER Login Endpoint
@login_blueprint.route('/api/login/user', methods=['POST'])
def login_user():
    try:
        data = request.get_json()

        if not data or 'email' not in data or 'password' not in data:
            return jsonify({ "success": False, "error": "Email and password required" }), 400

        email = data['email']
        password = data['password']

        if not User.checkLogin(email, password):
            return jsonify({ "success": False, "error": User.getLoginError(email, password) }), 401

        user = User.queryUserAccount(email)

        # Create JWT Token
        success, token = Token.createAccessToken(user)

        if not success:
            return jsonify({ "success": False, "error": "Failed to create access token" }), 500

        return jsonify({
            "success": True,
            "access_token": token,
            "user": user.to_dict(),
            "message": f"Login successful. Welcome, {user.first_name}!"
        }), 200

    except Exception as e:
        print(f"User login error: {e}")
        return jsonify({ "success": False, "error": "Login failed", "details": str(e) }), 500


# 🛡️ ADMIN Login Endpoint
@login_blueprint.route('/api/login/admin', methods=['POST'])
def login_admin():
    try:
        data = request.get_json()

        if not data or 'email' not in data or 'password' not in data:
            return jsonify({ "success": False, "error": "Email and password required" }), 400

        email = data['email']
        password = data['password']

        print(f"🔐 Admin login attempt: {email}")

        if not User.checkLogin(email, password):
            return jsonify({ "success": False, "error": User.getLoginError(email, password) }), 401

        user = User.queryUserAccount(email)
        if not user:
            return jsonify({ "success": False, "error": "User not found" }), 404

        user_type = user.user_type
        if not user_type or not user_type.has_admin_permission:
            return jsonify({ "success": False, "error": "Access denied. Admin privileges required." }), 403

        # Create JWT Token
        success, token = Token.createAccessToken(user)

        if not success:
            return jsonify({ "success": False, "error": "Failed to create access token" }), 500

        return jsonify({
            "success": True,
            "access_token": token,
            "user": user.to_dict(),
            "message": f"Admin login successful. Welcome, {user.first_name}!"
        }), 200

    except Exception as e:
        print(f"Admin login error: {e}")
        return jsonify({ "success": False, "error": "Login failed", "details": str(e) }), 500