from flask import Blueprint, request, jsonify
from app.models import db, User, Token
from app.utils.jwt_helper import generate_token
import bcrypt
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(Email=data['email']).first()

    if not user or not bcrypt.checkpw(data['password'].encode(), user.Password.encode()):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = generate_token(user.UserID)
    db.session.add(Token(access_token=token, UserID=user.UserID))
    db.session.commit()

    return jsonify({'token': token, 'user_id': user.UserID})


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(Email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    hashed_pw = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()

    user = User(
        Email=data['email'],
        Password=hashed_pw,
        firstName=data.get('first_name'),
        lastName=data.get('last_name'),
        dateOfBirth=datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d') if data.get('date_of_birth') else None,
        contactNumber=data.get('contact_number'),
        UserTypeID=data.get('user_type_id', 1),  # default user type
        Gender=data.get('gender'),
        Region=data.get('region'),
        Status='Active',
        CreatedDate=datetime.utcnow()
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User created successfully', 'user_id': user.UserID})
