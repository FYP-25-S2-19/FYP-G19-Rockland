from flask import Flask
from flask_cors import CORS
from .models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    CORS(app)
    
    ######## USER CONTROLLER
    from .controller.authentication.login import login_blueprint
    app.register_blueprint(login_blueprint)
        
    from .controller.user.create_user_controller import create_user_blueprint
    app.register_blueprint(create_user_blueprint)
    
    from .controller.user.view_user_controller import view_user_blueprint
    app.register_blueprint(view_user_blueprint)

    from.controller.user.search_user_controller import search_user_blueprint
    app.register_blueprint(search_user_blueprint)

    from.controller.user.upgrade_user_controller import upgrade_user_blueprint
    app.register_blueprint(upgrade_user_blueprint)

    from.controller.user.update_user_controller import update_user_blueprint
    app.register_blueprint(update_user_blueprint)

    from.controller.user.suspend_user_controller import suspend_user_blueprint
    app.register_blueprint(suspend_user_blueprint)

    ##USER TYPE
    from.controller.usertype.create_usertype_controller import create_usertype_blueprint
    app.register_blueprint(create_usertype_blueprint)

    from.controller.usertype.update_usertype_controller import update_usertype_blueprint
    app.register_blueprint(update_usertype_blueprint)

    from.controller.usertype.view_usertype_controller import view_usertype_blueprint
    app.register_blueprint(view_usertype_blueprint)

    return app
