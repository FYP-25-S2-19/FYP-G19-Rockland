from flask import Flask
from flask_cors import CORS
from .models import db
from .routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    CORS(app)
    app.register_blueprint(auth_bp, url_prefix='/auth')

    return app