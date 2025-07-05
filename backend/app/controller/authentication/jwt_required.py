from functools import wraps
from flask import request, jsonify
from app.models import db
from app.entity.token import Token
from app.entity.user import User
import jwt
import os

def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({ 'success': False, 'error': 'Authorization header missing or invalid' }), 401

            token = auth_header.split(" ")[1]
            secret = os.getenv("JWT_SECRET", "fallback-secret")
            payload = jwt.decode(token, secret, algorithms=["HS256"])

            db_token = Token.queryAccessToken(token)
            if not db_token or not db_token.is_active:
                return jsonify({ 'success': False, 'error': 'Token is invalid or inactive' }), 401

            user_id = payload.get('user_id')
            user = User.queryUserById(user_id)
            if not user or user.status != "Active":
                return jsonify({ 'success': False, 'error': 'User is not active or not found' }), 403

            kwargs['current_user'] = user
            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({ 'success': False, 'error': 'Token has expired' }), 401
        except jwt.InvalidTokenError:
            return jsonify({ 'success': False, 'error': 'Invalid token' }), 401
        except Exception as e:
            return jsonify({ 'success': False, 'error': f'Unexpected error: {str(e)}' }), 500

    return decorated_function
