import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB_NAME = "ROCKLAND"
DB_USER = "postgres"       # Change if needed
DB_PASSWORD = "admin"  # Change this
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

        # Check if DB exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}';")
        exists = cursor.fetchone()

        if not exists:
            cursor.execute(f"CREATE DATABASE {DB_NAME};")
            print(f"✅ Database '{DB_NAME}' created successfully.")
        else:
            print(f"✅ Database '{DB_NAME}' already exists.")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error creating database: {e}")

if __name__ == "__main__":
    create_database()
