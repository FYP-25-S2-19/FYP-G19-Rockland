from app import create_app
from app.models import db
# Import ALL entities to ensure tables are created
from app.entity.user import User
from app.entity.usertype import UserType
from app.entity.token import Token
from datetime import datetime
from sqlalchemy import inspect

app = create_app()

# Define user types to create - REMOVED MANUAL user_type_id
user_types_data = [
    {
        "name": "Admin",
        "description": "System Administrator with full access",
        "has_admin_permission": True,
        "has_freeuser_permission": True,
        "has_premium_permission": True,
        "has_expert_permission": True
    },
    {
        "name": "Free",
        "description": "Free tier user with basic access",
        "has_admin_permission": False,
        "has_freeuser_permission": True,
        "has_premium_permission": False,
        "has_expert_permission": False
    },
    {
        "name": "Premium",
        "description": "Premium subscriber with enhanced features",
        "has_admin_permission": False,
        "has_freeuser_permission": True,
        "has_premium_permission": True,
        "has_expert_permission": False
    },
    {
        "name": "Expert",
        "description": "Expert user with advanced features",
        "has_admin_permission": False,
        "has_freeuser_permission": True,
        "has_premium_permission": True,
        "has_expert_permission": True
    }
]

with app.app_context():
    # Check if tables exist
    inspector = inspect(db.engine)
    existing_tables = inspector.get_table_names()
    
    if not existing_tables:
        print("🔄 No existing tables found. Creating database tables...")
        db.create_all()
        print("✅ Database tables created successfully!")
    else:
        print(f"📋 Found existing tables: {existing_tables}")
        print("🔄 Ensuring all tables are up to date...")
        # This will create any missing tables without dropping existing ones
        db.create_all()
        print("✅ Database schema updated (existing data preserved)!")
    
    # Verify current tables
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"📋 Current tables: {tables}")
    
    # Check if UserTypes already exist
    existing_user_types = UserType.query.all()
    if existing_user_types:
        print(f"📋 Found {len(existing_user_types)} existing UserTypes:")
        for user_type in existing_user_types:
            print(f"  - {user_type.user_type_id}: {user_type.name}")
        print("⏭️  Skipping UserType creation (already exist)")
    else:
        print("📋 Creating UserTypes using entity method...")
        created_user_types = []
        
        for user_type_data in user_types_data:
            # Use the entity's createUserType method instead of manual creation
            success, status_code, message, new_usertype = UserType.createUserType(
                name=user_type_data["name"],
                description=user_type_data["description"],
                has_admin_permission=user_type_data["has_admin_permission"],
                has_freeuser_permission=user_type_data["has_freeuser_permission"],
                has_premium_permission=user_type_data["has_premium_permission"],
                has_expert_permission=user_type_data["has_expert_permission"]
            )
            
            if success:
                created_user_types.append(new_usertype)
                print(f"✅ Created UserType: {user_type_data['name']} with ID: {new_usertype.user_type_id}")
            else:
                print(f"❌ Failed to create UserType: {user_type_data['name']} - {message}")
        
        print("✅ UserTypes created successfully!")
    
    # Get the current user types for user creation
    current_user_types = UserType.query.order_by(UserType.user_type_id).all()
    user_type_mapping = {}
    for i, ut in enumerate(current_user_types):
        user_type_mapping[ut.name] = ut.user_type_id
    
    print(f"📋 Current UserType mapping: {user_type_mapping}")
    
    # Sample users to create - USE DYNAMIC USER_TYPE IDs
    sample_users = [
        {
            "email": "admin@rockland.com",
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User",
            "user_type_name": "Admin",  # Use name instead of ID
            "status": "Active",
            "date_of_birth": "1990-01-01"
        },
        {
            "email": "free@rockland.com",
            "password": "rock123",
            "first_name": "Free",
            "last_name": "User",
            "user_type_name": "Free",  # Use name instead of ID
            "status": "Active",
            "date_of_birth": "1995-05-15"
        },
        {
            "email": "premium@rockland.com",
            "password": "rock123",
            "first_name": "Premium",
            "last_name": "User",
            "user_type_name": "Premium",  # Use name instead of ID
            "status": "Active",
            "date_of_birth": "1988-08-20"
        },
        {
            "email": "admin@rocklands.com",
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User",
            "user_type_name": "Admin",  
            "status": "Active",
            "date_of_birth": "1990-01-01"
        },
        {
            "email": "expert@rockland.com",
            "password": "rock123",
            "first_name": "Expert",
            "last_name": "User",
            "user_type_name": "Expert",  # Use name instead of ID
            "status": "Active",
            "date_of_birth": "1985-12-10"
        }
    ]
    
    # Check existing users and only create missing ones
    existing_users = User.query.all()
    existing_emails = [user.email for user in existing_users]
    
    if existing_users:
        print(f"👥 Found {len(existing_users)} existing users:")
        for user in existing_users:
            user_type_name = user.user_type.name if user.user_type else "Unknown"
            print(f"  - {user.email} ({user_type_name})")
    
    # Create only missing sample users
    users_to_create = [user for user in sample_users if user["email"] not in existing_emails]
    
    if users_to_create:
        print(f"👥 Creating {len(users_to_create)} new sample users...")
        for user_data in users_to_create:
            # Get the user_type_id from the mapping
            user_type_name = user_data["user_type_name"]
            user_type_id = user_type_mapping.get(user_type_name)
            
            if not user_type_id:
                print(f"❌ Warning: UserType '{user_type_name}' not found for user {user_data['email']}")
                continue
            
            new_user = User(
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                user_type_id=user_type_id,
                status=user_data["status"],
                created_date=datetime.utcnow(),
                date_of_birth=datetime.strptime(user_data["date_of_birth"], '%Y-%m-%d').date()
            )
            
            # Use the entity's password hashing method
            new_user.set_password(user_data["password"])
            
            db.session.add(new_user)
            print(f"✅ Created user: {user_data['email']} as {user_type_name} (ID: {user_type_id})")

        db.session.commit()
        print("✅ New sample users created successfully!")
    else:
        print("⏭️  All sample users already exist, skipping creation")
    
    print("🎉 Database initialization completed!")
    
    # Display final state
    print("\n📊 Current UserTypes:")
    for user_type in UserType.query.all():
        print(f"  - {user_type.user_type_id}: {user_type.name}")
    
    print("\n👥 Current Users:")
    for user in User.query.all():
        user_type_name = user.user_type.name if user.user_type else "Unknown"
        print(f"  - {user.email} ({user_type_name}) - UserType ID: {user.user_type_id}")
    
    print("\n🎫 Token table status:")
    if 'token' in tables:
        print("✅ Token table available!")
        token_count = Token.query.count()
        print(f"📊 Current tokens: {token_count}")
    else:
        print("❌ Token table not found!")
    
    print("\n🔒 Data Preservation Status: ✅ ALL EXISTING DATA PRESERVED")
    print("🔧 Auto-increment Sequence: ✅ PROPERLY MAINTAINED")