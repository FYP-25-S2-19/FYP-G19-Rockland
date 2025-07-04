from functools import wraps
from flask import request, jsonify
from app.entity.token import Token
from app.entity.user import User
import jwt
import os

# app/controller/authentication/permission_required.py
from functools import wraps
from flask import request, jsonify
import jwt
import os
from app.models import db
from app.entity.token import Token
from app.entity.user import User

def permission_required(permission_name):
    """
    Decorator to check if user has required permission and is active
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get the token from the Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({
                    'success': False,
                    'error': 'No valid authorization header'
                }), 401
            
            token_string = auth_header.split(' ')[1]
            
            try:
                # Decode the token
                secret = os.getenv("JWT_SECRET", "fallback-secret")
                payload = jwt.decode(token_string, secret, algorithms=["HS256"])
                
                # Check if token exists in database and is active
                db_token = Token.queryAccessToken(token_string)
                if not db_token:
                    return jsonify({
                        'success': False,
                        'error': 'Token not found or expired'
                    }), 401
                
                # Check if user exists and is active
                user = User.queryUserById(payload['user_id'])
                if not user:
                    return jsonify({
                        'success': False,
                        'error': 'User not found'
                    }), 404
                
                # IMPORTANT: Check if user is suspended
                if user.status != 'Active':
                    # Deactivate the token if user is not active
                    if db_token.is_active:
                        db_token.is_active = False
                        db.session.commit()
                    
                    return jsonify({
                        'success': False,
                        'error': f'User account is {user.status}. Please contact administrator.'
                    }), 403
                
                # Check if user has the required permission
                user_type = user.user_type
                if not user_type:
                    return jsonify({
                        'success': False,
                        'error': 'User type not found'
                    }), 403
                
                # Check the specific permission
                if not hasattr(user_type, permission_name) or not getattr(user_type, permission_name):
                    return jsonify({
                        'success': False,
                        'error': 'Insufficient permissions'
                    }), 403
                
                # Add user info to kwargs for the route to use
                kwargs['current_user'] = user
                return f(*args, **kwargs)
                
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'error': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid token'
                }), 401
            except Exception as e:
                print(f"Error in permission_required: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Authentication error'
                }), 500
                
        return decorated_function
    return decorator

def admin_required(f):
    """Decorator that requires admin permissions"""
    return permission_required('has_admin_permission')(f)

def premium_required(f):
    """Decorator that requires premium permissions"""
    return permission_required('has_premium_permission')(f)

def expert_required(f):
    """Decorator that requires expert permissions"""
    return permission_required('has_expert_permission')(f)

def auth_required(f):
    """Decorator that just requires valid authentication (any user type)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token missing or invalid format'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Verify token
            token_record = Token.queryAccessToken(token)
            if not token_record:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            # Get user
            user = User.queryUserById(token_record.user_id)  # Updated to lowercase
            if not user:
                return jsonify({'error': 'User not found'}), 401
            
            if user.status != 'Active':
                return jsonify({'error': 'Account suspended'}), 403
            
            # Add user to kwargs
            kwargs['current_user'] = user
            
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Authentication failed', 'details': str(e)}), 401
    
    return decorated_function