from app import create_app
from app.models import db, User
from flask_bcrypt import Bcrypt
from datetime import datetime

app = create_app()
bcrypt = Bcrypt(app)

# Define user types (manually mapped since no UserType model was uploaded)
user_types = {
    0: "Admin",
    1: "Free",
    2: "Premium",
    3: "Expert"
}

# Sample users to create (one for each type)
sample_users = [
    {
        "email": "admin@rockland.com",
        "password": "admin123",
        "firstName": "Admin",
        "lastName": "User",
        "user_type": 0,
        "status": "Active"
    },
    {
        "email": "free@rockland.com",
        "password": "rock123",
        "firstName": "Free",
        "lastName": "User",
        "user_type": 1,
        "status": "Active"
    },
    {
        "email": "premium@rockland.com",
        "password": "rock123",
        "firstName": "Premium",
        "lastName": "User",
        "user_type": 2,
        "status": "Active"
    },
    {
        "email": "expert@rockland.com",
        "password": "rock123",
        "firstName": "Expert",
        "lastName": "User",
        "user_type": 3,
        "status": "Active"
    }
]

with app.app_context():
    db.create_all()  # Ensure tables exist

    for user_data in sample_users:
        exists = User.query.filter_by(Email=user_data["email"]).first()
        if not exists:
            hashed_pw = bcrypt.generate_password_hash(user_data["password"]).decode("utf-8")
            new_user = User(
                Email=user_data["email"],
                Password=hashed_pw,
                firstName=user_data["firstName"],
                lastName=user_data["lastName"],
                UserTypeID=user_data["user_type"],
                Status=user_data["status"],
                CreatedDate=datetime.utcnow()
            )
            db.session.add(new_user)
            print(f"✅ Created user: {user_data['email']} as {user_types[user_data['user_type']]}")
        else:
            print(f"⚠️ User already exists: {user_data['email']}")

    db.session.commit()
    print("🎉 Database initialized with user types and test users.")
