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
            try:
                print(f"🔐 Starting authentication check for permission: {permission_name}")
                
                # Get the token from the Authorization header
                auth_header = request.headers.get('Authorization')
                print(f"📋 Auth header present: {bool(auth_header)}")
                
                if not auth_header or not auth_header.startswith('Bearer '):
                    print("❌ No valid authorization header found")
                    return jsonify({
                        'success': False,
                        'error': 'No valid authorization header'
                    }), 401
                
                token_string = auth_header.split(' ')[1]
                print(f"🎫 Token extracted: {token_string[:20]}..." if len(token_string) > 20 else token_string)
                
                # First, decode the JWT to get user info
                secret = os.getenv("JWT_SECRET", "fallback-secret")
                print(f"🔑 Using JWT secret: {secret[:10]}..." if len(secret) > 10 else secret)
                
                try:
                    payload = jwt.decode(token_string, secret, algorithms=["HS256"])
                    print(f"✅ JWT decoded successfully. User ID: {payload.get('user_id')}")
                except jwt.ExpiredSignatureError:
                    print("❌ JWT token has expired")
                    return jsonify({
                        'success': False,
                        'error': 'Token has expired'
                    }), 401
                except jwt.InvalidTokenError as e:
                    print(f"❌ Invalid JWT token: {e}")
                    return jsonify({
                        'success': False,
                        'error': 'Invalid token'
                    }), 401
                
                # Check if token exists in database and is active
                print(f"🔍 Checking token in database...")
                db_token = Token.queryAccessToken(token_string)
                
                if not db_token:
                    print("❌ Token not found in database or expired")
                    return jsonify({
                        'success': False,
                        'error': 'Token not found or expired'
                    }), 401
                
                print(f"✅ Token found in database. Active: {db_token.is_active}")
                
                # Get user from database using the user_id from token payload
                user_id = payload.get('user_id')
                print(f"🔍 Looking up user with ID: {user_id}")
                
                user = User.queryUserById(user_id)
                if not user:
                    print(f"❌ User with ID {user_id} not found in database")
                    return jsonify({
                        'success': False,
                        'error': 'User not found'
                    }), 404
                
                print(f"✅ User found: {user.email}, Status: {user.status}")
                
                # CRITICAL: Check if user is suspended or inactive
                if user.status != 'Active':
                    print(f"❌ User account is {user.status}, deactivating token")
                    # Deactivate the token if user is not active
                    if db_token.is_active:
                        db_token.is_active = False
                        db.session.commit()
                        print("🔒 Token deactivated")
                    
                    return jsonify({
                        'success': False,
                        'error': f'User account is {user.status}. Please contact administrator.',
                        'status': user.status,
                        'redirect': '/login'  # Frontend can use this to redirect
                    }), 403
                
                # Check if user has the required permission
                user_type = user.user_type
                if not user_type:
                    print("❌ User type not found")
                    return jsonify({
                        'success': False,
                        'error': 'User type not found'
                    }), 403
                
                print(f"✅ User type: {user_type.name}")
                
                # Check the specific permission
                permission_value = getattr(user_type, permission_name, None)
                print(f"🔍 Checking permission '{permission_name}': {permission_value}")
                
                if not hasattr(user_type, permission_name) or not getattr(user_type, permission_name):
                    print(f"❌ User lacks required permission: {permission_name}")
                    return jsonify({
                        'success': False,
                        'error': 'Insufficient permissions'
                    }), 403
                
                print("✅ Authentication successful!")
                
                # Add user info to kwargs for the route to use
                kwargs['current_user'] = user
                return f(*args, **kwargs)
                
            except Exception as e:
                print(f"💥 Error in permission_required: {e}")
                import traceback
                traceback.print_exc()
                return jsonify({
                    'success': False,
                    'error': 'Authentication error',
                    'details': str(e)
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
        try:
            print("🔐 Starting basic auth check...")
            
            # Extract token from Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                print("❌ Token missing or invalid format")
                return jsonify({
                    'success': False, 
                    'error': 'Token missing or invalid format'
                }), 401
            
            token = auth_header.split(' ')[1]
            print(f"🎫 Token: {token[:20]}...")
            
            # Verify token exists in database and is active
            token_record = Token.queryAccessToken(token)
            if not token_record:
                print("❌ Token not found in database")
                return jsonify({
                    'success': False,
                    'error': 'Invalid or expired token'
                }), 401
            
            print(f"✅ Token found, active: {token_record.is_active}")
            
            # Get user
            user = User.queryUserById(token_record.user_id)
            if not user:
                print(f"❌ User with ID {token_record.user_id} not found")
                return jsonify({
                    'success': False,
                    'error': 'User not found'
                }), 401
            
            print(f"✅ User found: {user.email}, Status: {user.status}")
            
            # Check if user is active
            if user.status != 'Active':
                print(f"❌ User account is {user.status}")
                # Deactivate token if user is suspended
                if token_record.is_active:
                    token_record.is_active = False
                    db.session.commit()
                    print("🔒 Token deactivated")
                
                return jsonify({
                    'success': False,
                    'error': f'Account {user.status.lower()}. Please contact administrator.',
                    'status': user.status,
                    'redirect': '/login'
                }), 403
            
            print("✅ Basic auth successful!")
            
            # Add user to kwargs
            kwargs['current_user'] = user
            
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f"💥 Error in auth_required: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'error': 'Authentication failed', 
                'details': str(e)
            }), 401
    
    return decorated_function