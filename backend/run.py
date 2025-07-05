from app import create_app
from app.models import db
from flask import Flask

# CRITICAL: Import models in correct order
# Import these BEFORE calling create_all()
from app.entity.usertype import UserType
from app.entity.categories import Categories
from app.entity.interest import Interest  # Must come before User
from app.entity.user import User          # This has the association table
from app.entity.token import Token

app = create_app()

with app.app_context():
    db.create_all()  # This should work now

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)