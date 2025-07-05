from app import create_app
from app.models import db
# Import ALL entities to ensure tables are created
from app.entity.categories import Categories
from app.entity.interest import Interest
from app.entity.user import User
from app.entity.usertype import UserType
from app.entity.token import Token
from datetime import datetime
from sqlalchemy import inspect

app = create_app()

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

categories_data = [
    {
        "title": "Fossils",
        "description": "Preserved remains or traces of ancient organisms (plants, animals, microorganisms) that have been naturally preserved in rock over millions of years."
    },
    {
        "title": "Sedimentary Rocks",
        "description": "Rocks formed from compressed layers of sediments, organic matter, or minerals that accumulated over time."
    },
    {
        "title": "Mineralogy",
        "description": "The scientific study of minerals, their crystal structure, physical properties, and chemical composition."
    },
    {
        "title": "Volcanology",
        "description": "The study of volcanoes, lava, magma, and related geological phenomena and processes."
    },
    {
        "title": "Igneous Rocks",
        "description": "Rocks formed from the cooling and solidification of magma or lava, including intrusive and extrusive types."
    },
    {
        "title": "Metamorphic Rocks",
        "description": "Rocks formed from the transformation of existing rocks through heat, pressure, and chemical processes."
    },
    {
        "title": "Gemstones",
        "description": "Precious and semi-precious minerals valued for their beauty, rarity, and durability, often used in jewelry."
    },
    {
        "title": "Geochemistry",
        "description": "The study of the chemical composition and chemical processes of Earth and other planetary bodies."
    },
    {
        "title": "Petrology",
        "description": "The branch of geology that studies the origin, composition, structure, and alteration of rocks."
    },
    {
        "title": "Crystallography",
        "description": "The science of crystal structure, formation, and properties of crystalline materials."
    }
]

interests_data = [
    # Fossils (category_id: 1)
    {
        "title": "Trilobite Fossils",
        "description": "Ancient marine arthropods that lived for nearly 300 million years, excellent index fossils for dating rock layers.",
        "category_title": "Fossils"
    },
    {
        "title": "Dinosaur Fossils",
        "description": "Preserved remains of prehistoric reptiles including bones, teeth, eggs, and footprints from the Mesozoic Era.",
        "category_title": "Fossils"
    },
    {
        "title": "Plant Fossils",
        "description": "Fossilized remains of ancient vegetation including leaves, stems, seeds, and pollen from various geological periods.",
        "category_title": "Fossils"
    },
    {
        "title": "Marine Fossils",
        "description": "Fossilized sea creatures including shells, corals, fish, and other ocean-dwelling organisms.",
        "category_title": "Fossils"
    },
    
    # Sedimentary Rocks (category_id: 2)
    {
        "title": "Limestone Formation",
        "description": "Sedimentary rocks formed from marine organisms and calcium carbonate precipitation in shallow seas.",
        "category_title": "Sedimentary Rocks"
    },
    {
        "title": "Sandstone Geology",
        "description": "Clastic sedimentary rocks composed of sand-sized minerals and rock fragments, often quartz.",
        "category_title": "Sedimentary Rocks"
    },
    {
        "title": "Shale Composition",
        "description": "Fine-grained sedimentary rocks formed from mud and clay particles in low-energy environments.",
        "category_title": "Sedimentary Rocks"
    },
    {
        "title": "Conglomerate Rocks",
        "description": "Coarse-grained sedimentary rocks containing rounded pebbles and cobbles cemented together.",
        "category_title": "Sedimentary Rocks"
    },
    
    # Mineralogy (category_id: 3)
    {
        "title": "Quartz Varieties",
        "description": "Different forms of silicon dioxide including clear quartz, amethyst, citrine, and smoky quartz.",
        "category_title": "Mineralogy"
    },
    {
        "title": "Feldspar Minerals",
        "description": "The most abundant mineral group in Earth's crust, including orthoclase, plagioclase, and microcline.",
        "category_title": "Mineralogy"
    },
    {
        "title": "Mica Properties",
        "description": "Sheet silicate minerals known for their perfect cleavage and distinctive layered structure.",
        "category_title": "Mineralogy"
    },
    {
        "title": "Pyrite Crystals",
        "description": "Iron sulfide mineral known as 'fool's gold' with distinctive cubic and pyritohedral crystal forms.",
        "category_title": "Mineralogy"
    },
    
    # Volcanology (category_id: 4)
    {
        "title": "Volcanic Eruptions",
        "description": "Study of explosive and effusive volcanic activity, eruption types, and their geological impacts.",
        "category_title": "Volcanology"
    },
    {
        "title": "Lava Flow Dynamics",
        "description": "Analysis of molten rock movement, cooling patterns, and formation of different lava textures.",
        "category_title": "Volcanology"
    },
    {
        "title": "Volcanic Hazards",
        "description": "Assessment of risks from pyroclastic flows, ash falls, lahars, and other volcanic phenomena.",
        "category_title": "Volcanology"
    },
    {
        "title": "Magma Composition",
        "description": "Study of molten rock chemistry, viscosity, and how composition affects eruption style.",
        "category_title": "Volcanology"
    },
    
    # Igneous Rocks (category_id: 5)
    {
        "title": "Granite Formation",
        "description": "Intrusive igneous rocks with coarse-grained texture, rich in quartz, feldspar, and mica.",
        "category_title": "Igneous Rocks"
    },
    {
        "title": "Basalt Properties",
        "description": "Extrusive igneous rocks formed from mafic magma, commonly found in oceanic crust.",
        "category_title": "Igneous Rocks"
    },
    {
        "title": "Obsidian Glass",
        "description": "Volcanic glass formed from rapid cooling of felsic lava, prized for its sharp edges.",
        "category_title": "Igneous Rocks"
    },
    {
        "title": "Pumice Formation",
        "description": "Highly vesicular volcanic rock formed from gas-rich magma during explosive eruptions.",
        "category_title": "Igneous Rocks"
    },
    
    # Metamorphic Rocks (category_id: 6)
    {
        "title": "Marble Metamorphism",
        "description": "Metamorphosed limestone or dolomite, prized for sculpture and architectural applications.",
        "category_title": "Metamorphic Rocks"
    },
    {
        "title": "Slate Formation",
        "description": "Low-grade metamorphic rock derived from shale, characterized by excellent cleavage planes.",
        "category_title": "Metamorphic Rocks"
    },
    {
        "title": "Gneiss Structure",
        "description": "High-grade metamorphic rock with distinctive banded appearance of light and dark minerals.",
        "category_title": "Metamorphic Rocks"
    },
    {
        "title": "Schist Minerals",
        "description": "Medium-grade metamorphic rocks with visible mica crystals and foliated texture.",
        "category_title": "Metamorphic Rocks"
    },
    
    # Gemstones (category_id: 7)
    {
        "title": "Diamond Properties",
        "description": "The hardest natural substance, formed under extreme pressure deep in Earth's mantle.",
        "category_title": "Gemstones"
    },
    {
        "title": "Ruby and Sapphire",
        "description": "Varieties of corundum mineral, valued for their hardness, color, and brilliance.",
        "category_title": "Gemstones"
    },
    {
        "title": "Emerald Formation",
        "description": "Green variety of beryl formed in hydrothermal veins, prized for its vivid color.",
        "category_title": "Gemstones"
    },
    {
        "title": "Jade Varieties",
        "description": "Cultural and ornamental stones including jadeite and nephrite, valued across many civilizations.",
        "category_title": "Gemstones"
    },
    
    # Geochemistry (category_id: 8)
    {
        "title": "Isotope Analysis",
        "description": "Use of radioactive and stable isotopes to determine age, origin, and processes in rocks.",
        "category_title": "Geochemistry"
    },
    {
        "title": "Trace Elements",
        "description": "Study of minor elements in rocks and minerals to understand formation processes.",
        "category_title": "Geochemistry"
    },
    {
        "title": "Weathering Chemistry",
        "description": "Chemical breakdown of rocks and minerals through interaction with water and atmosphere.",
        "category_title": "Geochemistry"
    },
    {
        "title": "Hydrothermal Systems",
        "description": "Chemical processes in hot water systems that form ore deposits and alter rocks.",
        "category_title": "Geochemistry"
    },
    
    # Petrology (category_id: 9)
    {
        "title": "Thin Section Analysis",
        "description": "Microscopic study of rock samples to identify minerals and understand formation processes.",
        "category_title": "Petrology"
    },
    {
        "title": "Rock Classification",
        "description": "Systematic categorization of rocks based on texture, composition, and formation process.",
        "category_title": "Petrology"
    },
    {
        "title": "Texture Analysis",
        "description": "Study of grain size, shape, and arrangement in rocks to interpret formation conditions.",
        "category_title": "Petrology"
    },
    {
        "title": "Alteration Processes",
        "description": "Changes in rock composition and mineralogy due to weathering, hydrothermal, or tectonic processes.",
        "category_title": "Petrology"
    },
    
    # Crystallography (category_id: 10)
    {
        "title": "Crystal Systems",
        "description": "Seven fundamental geometric arrangements of atoms in crystalline materials.",
        "category_title": "Crystallography"
    },
    {
        "title": "X-ray Diffraction",
        "description": "Analytical technique used to determine crystal structure and identify minerals.",
        "category_title": "Crystallography"
    },
    {
        "title": "Crystal Habits",
        "description": "External shapes and forms that crystals develop during growth in different environments.",
        "category_title": "Crystallography"
    },
    {
        "title": "Twinning Phenomena",
        "description": "Symmetrical intergrowths of crystals sharing common crystallographic orientations.",
        "category_title": "Crystallography"
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
    
    # Check if Categories already exist
    existing_categories = Categories.query.all()
    if existing_categories:
        print(f"📋 Found {len(existing_categories)} existing Categories:")
        for category in existing_categories:
            print(f"  - {category.categories_id}: {category.title}")
        print("⏭️  Skipping Category creation (already exist)")
    else:
        print("📋 Creating Categories...")
        created_categories = []
        
        for category_data in categories_data:
            new_category = Categories(
                title=category_data["title"],
                description=category_data["description"]
            )
            
            db.session.add(new_category)
            created_categories.append(new_category)
            print(f"✅ Prepared Category: {category_data['title']}")
        
        # Commit all categories at once
        try:
            db.session.commit()
            print("✅ Categories created successfully!")
            
            # Display created categories with their IDs
            for category in created_categories:
                print(f"  - Created: {category.categories_id}: {category.title}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to create categories: {str(e)}")
    
    # Check if Interests already exist
    existing_interests = Interest.query.all()
    if existing_interests:
        print(f"📋 Found {len(existing_interests)} existing Interests:")
        for interest in existing_interests:
            category_name = interest.category.title if interest.category else "Unknown"
            print(f"  - {interest.interest_id}: {interest.title} ({category_name})")
        print("⏭️  Skipping Interest creation (already exist)")
    else:
        print("📋 Creating Interests...")
        created_interests = []
        
        # Get categories for mapping
        all_categories = Categories.query.all()
        category_mapping = {cat.title: cat.categories_id for cat in all_categories}
        
        for interest_data in interests_data:
            category_id = category_mapping.get(interest_data["category_title"])
            
            if not category_id:
                print(f"❌ Warning: Category '{interest_data['category_title']}' not found for interest {interest_data['title']}")
                continue
            
            new_interest = Interest(
                title=interest_data["title"],
                description=interest_data["description"],
                categories_id=category_id
            )
            
            db.session.add(new_interest)
            created_interests.append(new_interest)
            print(f"✅ Prepared Interest: {interest_data['title']} -> {interest_data['category_title']}")
        
        # Commit all interests at once
        try:
            db.session.commit()
            print("✅ Interests created successfully!")
            
            # Display created interests with their IDs
            for interest in created_interests:
                category_name = interest.category.title if interest.category else "Unknown"
                print(f"  - Created: {interest.interest_id}: {interest.title} ({category_name})")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to create interests: {str(e)}")
    
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
        },
        {
            "email": "testing@rockland.com",
            "password": "rock123",
            "first_name": "Expert",
            "last_name": "User",
            "user_type_name": "aaaaaaaaaa",  # Use name instead of ID
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