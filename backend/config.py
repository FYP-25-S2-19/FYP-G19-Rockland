import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:admin@localhost:5432/rockland"
    SECRET_KEY = os.getenv("JWT_SECRET")
    SQLALCHEMY_TRACK_MODIFICATIONS = False