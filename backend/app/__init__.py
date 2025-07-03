from flask import Flask
from flask_cors import CORS
from .models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    CORS(app)
    
    # Import and register the login blueprint
    try:
        from .controller.authentication.login import login_blueprint
        app.register_blueprint(login_blueprint)
        print("✅ Login blueprint registered successfully!")
    except ImportError as e:
        print(f"❌ Failed to import login blueprint: {e}")
        # Add a test route so we know the server works
        @app.route('/test')
        def test():
            return {'message': 'Server running but login route failed to load'}

    return app