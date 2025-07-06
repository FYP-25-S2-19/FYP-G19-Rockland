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

    from .controller.user.search_user_controller import search_user_blueprint
    app.register_blueprint(search_user_blueprint)

    from .controller.user.upgrade_user_controller import upgrade_user_blueprint
    app.register_blueprint(upgrade_user_blueprint)

    from .controller.user.update_user_controller import update_user_blueprint
    app.register_blueprint(update_user_blueprint)

    from .controller.user.suspend_user_controller import suspend_user_blueprint
    app.register_blueprint(suspend_user_blueprint)

    ##################################################### USER TYPE CONTROLLERS##################################################################
    from .controller.usertype.create_usertype_controller import create_usertype_blueprint
    app.register_blueprint(create_usertype_blueprint)

    from .controller.usertype.update_usertype_controller import update_usertype_blueprint
    app.register_blueprint(update_usertype_blueprint)

    from .controller.usertype.view_usertype_controller import view_usertype_blueprint
    app.register_blueprint(view_usertype_blueprint)

    from .controller.usertype.suspend_usertype_controller import suspend_usertype_blueprint
    app.register_blueprint(suspend_usertype_blueprint)

    ## Categories
    from .controller.categories.view_categories_controller import view_categories_blueprint
    app.register_blueprint(view_categories_blueprint)

    from .controller.categories.create_categories_controller import create_categories_blueprint
    app.register_blueprint(create_categories_blueprint)

    from .controller.categories.delete_categories_controller import delete_categories_blueprint
    app.register_blueprint(delete_categories_blueprint)

    ############### INTEREST
    from .controller.interest.view_interest_controller import view_interest_blueprint
    app.register_blueprint(view_interest_blueprint)

    from .controller.interest.create_interest_controller import create_interest_blueprint
    app.register_blueprint(create_interest_blueprint)

    from .controller.interest.delete_interest_controller import delete_interest_blueprint
    app.register_blueprint(delete_interest_blueprint)
    
    ######## FAQ
    from .controller.faq.view_faq_controller import view_faq_blueprint
    app.register_blueprint(view_faq_blueprint)

    from .controller.faq.create_faq_controller import create_faq_blueprint
    app.register_blueprint(create_faq_blueprint)

    from .controller.faq.delete_faq_controller import delete_faq_blueprint
    app.register_blueprint(delete_faq_blueprint)

    from .controller.faq.update_faq_controller import update_faq_blueprint
    app.register_blueprint(update_faq_blueprint)

    return app