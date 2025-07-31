import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB_NAME = "rockland"  # Changed to lowercase to match config.py
DB_USER = "postgres"
DB_PASSWORD = "111111"
DB_HOST = "localhost"
DB_PORT = "5432"

def create_database():
    try:
        # Connect to default DB as superuser
        conn = psycopg2.connect(
            dbname="postgres", user=DB_USER, password=DB_PASSWORD,
            host=DB_HOST, port=DB_PORT
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if DB exists (case-insensitive)
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}';")
        exists = cursor.fetchone()

        if not exists:
            cursor.execute(f'CREATE DATABASE "{DB_NAME}";')
            print(f"✅ Database '{DB_NAME}' created successfully.")
        else:
            print(f"✅ Database '{DB_NAME}' already exists.")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error creating database: {e}")

def drop_database():
    """Optional: Drop database if you need to recreate it"""
    try:
        conn = psycopg2.connect(
            dbname="postgres", user=DB_USER, password=DB_PASSWORD,
            host=DB_HOST, port=DB_PORT
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Terminate existing connections to the database
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{DB_NAME}'
            AND pid <> pg_backend_pid();
        """)

        # Drop database
        cursor.execute(f'DROP DATABASE IF EXISTS "{DB_NAME}";')
        print(f"✅ Database '{DB_NAME}' dropped successfully.")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error dropping database: {e}")

if __name__ == "__main__":
    create_database()