# backend/app/utils/auth.py

from functools import wraps
from flask import request, jsonify
from app.entity.user import User
import jwt
import os

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
            current_user = User.query.filter_by(user_id=data["user_id"]).first()
        except Exception as e:
            return jsonify({"message": f"Token is invalid: {str(e)}"}), 401

        return f(current_user, *args, **kwargs)

    return decorated
