import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    # Always use Cloud SQL with postgres user (full permissions)
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:RocklandDB2024!@34.87.38.175:5432/rockland"
    SECRET_KEY = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-here-make-it-long-and-random-123456789")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Cloud SQL specific settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'connect_args': {
            'connect_timeout': 10,
        }
    }

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    
    # Enhanced settings for production
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 20,
        'connect_args': {
            'connect_timeout': 10,
        }
    }

class TestingConfig(Config):
    TESTING = True