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
                print(f"📋 Request method: {request.method}")
                print(f"📋 Request URL: {request.url}")
                
                # Get the token from the Authorization header
                auth_header = request.headers.get('Authorization')
                print(f"📋 Auth header present: {bool(auth_header)}")
                print(f"📋 All headers: {dict(request.headers)}")
                
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
                    print(f"🎫 Token payload: {payload}")
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
                except Exception as e:
                    print(f"❌ Error decoding JWT: {e}")
                    return jsonify({
                        'success': False,
                        'error': f'Token decode error: {str(e)}'
                    }), 401
                
                # Check if token exists in database and is active
                print(f"🔍 Checking token in database...")
                try:
                    db_token = Token.queryAccessToken(token_string)
                    print(f"✅ Token query result: {db_token}")
                except Exception as e:
                    print(f"❌ Error querying token: {e}")
                    return jsonify({
                        'success': False,
                        'error': f'Database error: {str(e)}'
                    }), 500
                
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
                
                try:
                    user = User.queryUserById(user_id)
                    print(f"✅ User query result: {user}")
                except Exception as e:
                    print(f"❌ Error querying user: {e}")
                    return jsonify({
                        'success': False,
                        'error': f'User lookup error: {str(e)}'
                    }), 500
                
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
                        try:
                            db_token.is_active = False
                            db.session.commit()
                            print("🔒 Token deactivated")
                        except Exception as e:
                            print(f"❌ Error deactivating token: {e}")
                            db.session.rollback()
                    
                    return jsonify({
                        'success': False,
                        'error': f'User account is {user.status}. Please contact administrator.',
                        'status': user.status,
                        'redirect': '/login'  # Frontend can use this to redirect
                    }), 403
                
                # Check if user has the required permission
                print(f"🔍 Getting user type...")
                try:
                    user_type = user.user_type
                    print(f"✅ User type object: {user_type}")
                except Exception as e:
                    print(f"❌ Error getting user type: {e}")
                    return jsonify({
                        'success': False,
                        'error': f'User type lookup error: {str(e)}'
                    }), 500
                
                if not user_type:
                    print("❌ User type not found")
                    return jsonify({
                        'success': False,
                        'error': 'User type not found'
                    }), 403
                
                print(f"✅ User type: {user_type.name}")
                print(f"✅ User type dict: {user_type.to_dict()}")
                
                # Check the specific permission
                print(f"🔍 Checking permission '{permission_name}'...")
                try:
                    permission_value = getattr(user_type, permission_name, None)
                    print(f"✅ Permission '{permission_name}' value: {permission_value}")
                    print(f"✅ Has attribute: {hasattr(user_type, permission_name)}")
                except Exception as e:
                    print(f"❌ Error checking permission: {e}")
                    return jsonify({
                        'success': False,
                        'error': f'Permission check error: {str(e)}'
                    }), 500
                
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