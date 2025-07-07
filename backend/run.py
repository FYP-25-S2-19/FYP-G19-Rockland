from app import create_app
from app.models import db
from flask import Flask

# CRITICAL: Import models in correct order
# Import these BEFORE calling create_all()
from app.entity.categories import Categories
from app.entity.interest import Interest
from app.entity.faq import Faq
from app.entity.user import User
from app.entity.usertype import UserType
from app.entity.video import Video
from app.entity.applink import AppLink
from app.entity.testimonials import Testimonials
from app.entity.token import Token
from app.entity.application import Application
from app.entity.application_answer import ApplicationAnswer
from app.entity.application_file import ApplicationFile

app = create_app()

with app.app_context():
    db.create_all()  # This should work now

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)