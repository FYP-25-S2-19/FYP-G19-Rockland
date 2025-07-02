from app import create_app
from app.models import db  # Make sure this points to your db
from flask import Flask

app = create_app()

with app.app_context():
    db.create_all()  # This line creates tables if they don’t exist

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
