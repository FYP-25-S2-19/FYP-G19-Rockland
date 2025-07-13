#!/usr/bin/env python3
"""
Setup Cloud SQL database and user for Rockland
Run this AFTER updating your .env file with Cloud SQL details
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

def setup_cloudsql_database():
    """Create rockland database and user in Cloud SQL"""
    
    print("🚀 Setting up Cloud SQL database for Rockland")
    print("=" * 50)
    
    # Use the CLOUD_SQL_ROOT_URL directly from .env
    root_url = os.getenv('CLOUD_SQL_ROOT_URL')
    
    if not root_url:
        print("❌ CLOUD_SQL_ROOT_URL not found in .env file")
        print("💡 Make sure you've updated your .env file with Cloud SQL details")
        return False
    
    try:
        print("🔗 Connecting to Cloud SQL as postgres user...")
        conn = psycopg2.connect(root_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Create database
        print("🗄️  Creating 'rockland' database...")
        try:
            cursor.execute('CREATE DATABASE "rockland";')
            print("✅ Database 'rockland' created successfully!")
        except psycopg2.errors.DuplicateDatabase:
            print("✅ Database 'rockland' already exists!")
        
        # Create user
        print("👤 Creating user 'rockland_user'...")
        try:
            cursor.execute("CREATE USER rockland_user WITH PASSWORD 'rockland123';")
            print("✅ User 'rockland_user' created!")
        except psycopg2.errors.DuplicateObject:
            print("✅ User 'rockland_user' already exists!")
        
        # Grant permissions
        print("🔐 Granting permissions...")
        cursor.execute('GRANT ALL PRIVILEGES ON DATABASE "rockland" TO rockland_user;')
        print("✅ Permissions granted!")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Cloud SQL database setup complete!")
        print("Database: rockland")
        print("User: rockland_user")
        print("Password: rockland123")
        print("\n💡 Next step: Run 'export FLASK_ENV=production && python run.py'")
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Connection failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure your IP is in Cloud SQL authorized networks")
        print("2. Check if your Cloud SQL instance is running")
        print("3. Verify the postgres password is 'RocklandDB2024!' in Cloud SQL")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_connection():
    """Test connection to Cloud SQL with rockland user"""
    
    cloud_sql_url = os.getenv('CLOUD_SQL_DATABASE_URL')
    if not cloud_sql_url:
        print("❌ CLOUD_SQL_DATABASE_URL not found")
        return False
    
    try:
        print("\n🧪 Testing connection with rockland_user...")
        conn = psycopg2.connect(cloud_sql_url)
        cursor = conn.cursor()
        
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Connected successfully!")
        print(f"📋 PostgreSQL version: {version[0][:50]}...")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Test connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Make sure you have:")
    print("1. Updated your .env file with Cloud SQL details")
    print("2. Added your IP to Cloud SQL authorized networks")
    print("3. Set Cloud SQL postgres password to 'RocklandDB2024!'")
    print()
    
    proceed = input("Continue? (y/n): ").lower().strip()
    if proceed == 'y':
        if setup_cloudsql_database():
            test_connection()
    else:
        print("Setup cancelled.")