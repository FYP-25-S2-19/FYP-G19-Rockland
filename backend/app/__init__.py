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

    from .controller.user.get_current_user import get_current_user_blueprint
    app.register_blueprint(get_current_user_blueprint)

    from .controller.user.upload_profile_picture import upload_profile_picture_blueprint
    app.register_blueprint(upload_profile_picture_blueprint)

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
    
    ############### UPGRADE USER
    from .controller.upgrade_user.self_upgrade_account import self_upgrade_blueprint
    app.register_blueprint(self_upgrade_blueprint)

    ############### INTEREST
    from .controller.interest.view_interest_controller import view_interest_blueprint
    app.register_blueprint(view_interest_blueprint)

    from .controller.interest.create_interest_controller import create_interest_blueprint
    app.register_blueprint(create_interest_blueprint)

    from .controller.interest.delete_interest_controller import delete_interest_blueprint
    app.register_blueprint(delete_interest_blueprint)

    ###############  ROCK 
    from .controller.rock.create_rock_controller import create_rock_blueprint
    app.register_blueprint(create_rock_blueprint)

    from .controller.rock.delete_rock_controller import delete_rock_blueprint
    app.register_blueprint(delete_rock_blueprint)

    from .controller.rock.get_all_rock_controller import get_all_rock_blueprint
    app.register_blueprint(get_all_rock_blueprint)

    from .controller.rock.get_rock_by_id_controller import get_rock_by_id_blueprint
    app.register_blueprint(get_rock_by_id_blueprint)

    from .controller.rock.get_rocks_by_user_controller import get_rocks_by_user_blueprint
    app.register_blueprint(get_rocks_by_user_blueprint)

    from .controller.rock.get_top_commented_rocks_controller import get_top_commented_rocks_blueprint
    app.register_blueprint(get_top_commented_rocks_blueprint)

    from .controller.rock.search_rock_controller import search_rock_blueprint
    app.register_blueprint(search_rock_blueprint)

    from .controller.rock.update_rock_controller import update_rock_blueprint
    app.register_blueprint(update_rock_blueprint)

    from .controller.rock.view_rock_controller import view_rock_blueprint
    app.register_blueprint(view_rock_blueprint)

    from .controller.rock.get_filter_options_controller import filter_options_blueprint
    app.register_blueprint(filter_options_blueprint)
    
    ###############  DISCUSSION
    from .controller.discussion.create_discussion_controller import create_discussion_blueprint
    app.register_blueprint(create_discussion_blueprint)
    
    from .controller.discussion.view_discussion_controller import view_discussion_blueprint
    app.register_blueprint(view_discussion_blueprint)
    
    from .controller.discussion.comment_discussion_controller import comment_discussion_blueprint
    app.register_blueprint(comment_discussion_blueprint)
    
    from .controller.discussion.delete_discussion_controller import delete_discussion_blueprint
    app.register_blueprint(delete_discussion_blueprint)
    
    ###############  QUIZ
    from app.controller.quiz.create_quizattempt_controller import create_quizattempt_blueprint
    app.register_blueprint(create_quizattempt_blueprint)
    
    from app.controller.quiz.view_quiz_controller import view_quiz_blueprint
    app.register_blueprint(view_quiz_blueprint)
    
    from app.controller.quiz.view_quizhistory_controller import view_quizhistory_blueprint
    app.register_blueprint(view_quizhistory_blueprint)
    
    ###############  ACHIEVEMENTS
    from app.controller.achievements.collect_achievement_controller import collect_achievement_blueprint
    app.register_blueprint(collect_achievement_blueprint)
    
    from app.controller.achievements.view_achievement_controller import view_achievement_blueprint
    app.register_blueprint(view_achievement_blueprint)
    
    from app.controller.achievements.create_achievement_controller import create_achievement_blueprint
    app.register_blueprint(create_achievement_blueprint)  # optional
    
    ###############  LEADERBOARD
    from .controller.leaderboard.leaderboard_controller import leaderboard_blueprint
    app.register_blueprint(leaderboard_blueprint)

    ###############  MACHINE LEARNING
    from .controller.rockrecognition.recognize_rock import rock_blueprint as rock_recognition_blueprint
    app.register_blueprint(rock_recognition_blueprint)
    
    ###############  ROCK SCAN
    from .controller.rock_scan.save_scan_result_controller import save_scan_result_blueprint
    app.register_blueprint(save_scan_result_blueprint)

    ############# ROCK COLLECTION
    from .controller.rock_collection.add_to_collection_controller import add_to_collection_bp
    app.register_blueprint(add_to_collection_bp)

    from .controller.rock_collection.delete_from_collection_controller import delete_from_collection_bp
    app.register_blueprint(delete_from_collection_bp)

    from .controller.rock_collection.get_user_collection_controller import get_user_collection_blueprint
    app.register_blueprint(get_user_collection_blueprint)

    from app.controller.rock_collection.filter_user_collection_controller import filter_user_collection_blueprint
    app.register_blueprint(filter_user_collection_blueprint)

    ################ COMMENT
    from .controller.comment.rock.create_comment_controller import create_rock_comment_blueprint
    app.register_blueprint(create_rock_comment_blueprint)

    from .controller.comment.rock.toggle_like_comment_controller import toggle_like_comment_blueprint
    app.register_blueprint(toggle_like_comment_blueprint)
    

    ######## FAQ
    from .controller.faq.view_faq_controller import view_faq_blueprint
    app.register_blueprint(view_faq_blueprint)

    from .controller.faq.create_faq_controller import create_faq_blueprint
    app.register_blueprint(create_faq_blueprint)

    from .controller.faq.delete_faq_controller import delete_faq_blueprint
    app.register_blueprint(delete_faq_blueprint)

    from .controller.faq.update_faq_controller import update_faq_blueprint
    app.register_blueprint(update_faq_blueprint)

    ## VIDEO
    from .controller.video.view_video_controller import view_video_blueprint
    app.register_blueprint(view_video_blueprint)

    from .controller.video.post_video_controller import post_video_blueprint
    app.register_blueprint(post_video_blueprint)

    from .controller.video.delete_video_controller import delete_video_blueprint
    app.register_blueprint(delete_video_blueprint)

    ### AppLink
    from .controller.applink.view_applink_controller import view_applink_blueprint
    app.register_blueprint(view_applink_blueprint)

    from .controller.applink.post_applink_controller import post_applink_blueprint
    app.register_blueprint(post_applink_blueprint)

    from .controller.applink.delete_applink_controller import delete_applink_blueprint
    app.register_blueprint(delete_applink_blueprint)

    ### Testimonials

    from .controller.testimonials.create_testimonials_controller import create_testimonials_blueprint
    app.register_blueprint(create_testimonials_blueprint)

    from .controller.testimonials.delete_testimonials_controller import delete_testimonials_blueprint
    app.register_blueprint(delete_testimonials_blueprint)

    from .controller.testimonials.view_testimonials_controller import view_testimonials_blueprint
    app.register_blueprint(view_testimonials_blueprint)

    #### Application

    from .controller.application.create_application_controller import create_application_blueprint
    app.register_blueprint(create_application_blueprint)

    from .controller.application.view_application_controller import view_application_blueprint
    app.register_blueprint(view_application_blueprint)

    from .controller.application.accept_decline_application_controller import accept_decline_application_blueprint
    app.register_blueprint(accept_decline_application_blueprint)

    ### Articles

    from .controller.articles.delete_article_controller import delete_article_blueprint
    app.register_blueprint(delete_article_blueprint)

    from .controller.articles.like_article_controller import like_article_blueprint
    app.register_blueprint(like_article_blueprint)

    from .controller.articles.post_article_controller import post_article_blueprint
    app.register_blueprint(post_article_blueprint)

    from .controller.articles.search_article_controller import search_article_blueprint
    app.register_blueprint(search_article_blueprint)

    from .controller.articles.view_article_controller import view_article_blueprint
    app.register_blueprint(view_article_blueprint)

    
    ### Articles

    from .controller.trade_offer.accept_trade_offer_controller import accept_trade_offer_bp
    app.register_blueprint(accept_trade_offer_bp)

    from .controller.trade_offer.create_trade_offer_controller import create_trade_offer_bp
    app.register_blueprint(create_trade_offer_bp)

    from .controller.trade_offer.delete_trade_offer_controller import delete_trade_offer_bp
    app.register_blueprint(delete_trade_offer_bp)

    from .controller.trade_offer.reject_trade_offer_controller import reject_trade_offer_bp
    app.register_blueprint(reject_trade_offer_bp)

    from .controller.trade_offer.search_trade_offer_controller import search_trade_offer_bp
    app.register_blueprint(search_trade_offer_bp)

    from .controller.trade_offer.search_my_trade_offer_controller import search_my_trade_offer_bp
    app.register_blueprint(search_my_trade_offer_bp)


    
    return app