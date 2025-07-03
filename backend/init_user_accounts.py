from app import create_app
from app.models import db
# Import ALL entities to ensure tables are created
from app.entity.user import User
from app.entity.usertype import UserType
from app.entity.token import Token
from datetime import datetime

app = create_app()

# Define user types to create
user_types_data = [
    {
        "user_type_id": 0,
        "name": "Admin",
        "description": "System Administrator with full access",
        "has_admin_permission": True,
        "has_freeuser_permission": True,
        "has_premium_permission": True,
        "has_expert_permission": True
    },
    {
        "user_type_id": 1,
        "name": "Free",
        "description": "Free tier user with basic access",
        "has_admin_permission": False,
        "has_freeuser_permission": True,
        "has_premium_permission": False,
        "has_expert_permission": False
    },
    {
        "user_type_id": 2,
        "name": "Premium",
        "description": "Premium subscriber with enhanced features",
        "has_admin_permission": False,
        "has_freeuser_permission": True,
        "has_premium_permission": True,
        "has_expert_permission": False
    },
    {
        "user_type_id": 3,
        "name": "Expert",
        "description": "Expert user with advanced features",
        "has_admin_permission": False,
        "has_freeuser_permission": True,
        "has_premium_permission": True,
        "has_expert_permission": True
    }
]

# Sample users to create (one for each type)
sample_users = [
    {
        "email": "admin@rockland.com",
        "password": "admin123",
        "first_name": "Admin",
        "last_name": "User",
        "user_type": 0,
        "status": "Active",
        "date_of_birth": "1990-01-01"
    },
    {
        "email": "free@rockland.com",
        "password": "rock123",
        "first_name": "Free",
        "last_name": "User",
        "user_type": 1,
        "status": "Active",
        "date_of_birth": "1995-05-15"
    },
    {
        "email": "premium@rockland.com",
        "password": "rock123",
        "first_name": "Premium",
        "last_name": "User",
        "user_type": 2,
        "status": "Active",
        "date_of_birth": "1988-08-20"
    },
    {
        "email": "expert@rockland.com",
        "password": "rock123",
        "first_name": "Expert",
        "last_name": "User",
        "user_type": 3,
        "status": "Active",
        "date_of_birth": "1985-12-10"
    }
]

with app.app_context():
    print("🔄 Dropping existing tables...")
    db.drop_all()  # Drop all tables first
    
    print("🔄 Creating database tables...")
    db.create_all()  # Create all tables fresh
    
    # Verify which tables were created
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"📋 Created tables: {tables}")
    
    # First, create UserTypes
    print("📋 Creating UserTypes...")
    for user_type_data in user_types_data:
        user_type = UserType(
            user_type_id=user_type_data["user_type_id"],
            name=user_type_data["name"],
            description=user_type_data["description"],
            has_admin_permission=user_type_data["has_admin_permission"],
            has_freeuser_permission=user_type_data["has_freeuser_permission"],
            has_premium_permission=user_type_data["has_premium_permission"],
            has_expert_permission=user_type_data["has_expert_permission"]
        )
        db.session.add(user_type)
        print(f"✅ Created UserType: {user_type_data['name']}")
    
    # Commit UserTypes first
    db.session.commit()
    
    # Then create Users
    print("👥 Creating sample users...")
    for user_data in sample_users:
        new_user = User(
            email=user_data["email"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            user_type_id=user_data["user_type"],
            status=user_data["status"],
            created_date=datetime.utcnow(),
            date_of_birth=datetime.strptime(user_data["date_of_birth"], '%Y-%m-%d').date()
        )
        
        # Use the entity's password hashing method
        new_user.set_password(user_data["password"])
        
        db.session.add(new_user)
        print(f"✅ Created user: {user_data['email']} as {user_types_data[user_data['user_type']]['name']}")

    db.session.commit()
    print("🎉 Database initialized with UserTypes and sample users!")
    
    # Display created data
    print("\n📊 Created UserTypes:")
    for user_type in UserType.query.all():
        print(f"  - {user_type.user_type_id}: {user_type.name}")
    
    print("\n👥 Created Users:")
    for user in User.query.all():
        user_type_name = user.user_type.name if user.user_type else "Unknown"
        print(f"  - {user.email} ({user_type_name})")
    
    print("\n🎫 Token table status:")
    if 'token' in tables:
        print("✅ Token table created successfully!")
    else:
        print("❌ Token table not found!")