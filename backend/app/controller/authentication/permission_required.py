from functools import wraps
from flask import request, jsonify
from app.entity.token import Token
from app.entity.user import User
import jwt
import os

def permission_required(*permissions):
    """Decorator to check if the current user has at least one of the required permissions."""
    
    def decorator(f):  # 'f' is the function being decorated
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Extract token from Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Token missing or invalid format'}), 401
            
            token = auth_header.split(' ')[1]
            
            try:
                # Verify token exists in database and is active
                token_record = Token.queryAccessToken(token)
                if not token_record:
                    return jsonify({'error': 'Invalid or expired token'}), 401
                
                # Get user from token
                user = User.queryUserById(token_record.user_id)  # Updated to lowercase
                if not user:
                    return jsonify({'error': 'User not found'}), 401
                
                # Check if user account is active
                if user.status != 'Active':
                    return jsonify({'error': 'Account suspended'}), 403
                
                # Get user type and permissions
                user_type = user.user_type
                if not user_type:
                    return jsonify({'error': 'User type not found'}), 403
                
                # Check permissions - if any required permission matches user's permissions
                user_permissions = {
                    'has_admin_permission': user_type.has_admin_permission,
                    'has_freeuser_permission': user_type.has_freeuser_permission,
                    'has_premium_permission': user_type.has_premium_permission,
                    'has_expert_permission': user_type.has_expert_permission
                }
                
                # Check if user has at least one of the required permissions
                if not any(user_permissions.get(permission, False) for permission in permissions):
                    return jsonify({
                        'error': f'At least one of the following permissions is required: {list(permissions)}',
                        'current_permissions': user_permissions,
                        'user_type': user_type.name
                    }), 403
                
                # Add user to kwargs so the decorated function can access it
                kwargs['current_user'] = user
                
                return f(*args, **kwargs)  # Call the original function
                
            except jwt.ExpiredSignatureError:
                return jsonify({'error': 'Token has expired'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'error': 'Invalid token'}), 401
            except Exception as e:
                return jsonify({'error': 'Authentication failed', 'details': str(e)}), 401
        
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