# app/entity/import_all_entities.py

def import_entities():
# Import all models to ensure they're registered
    from app.entity.achievement import Achievement
    from app.entity.application_answer import ApplicationAnswer
    from app.entity.application_file import ApplicationFile
    from app.entity.application import Application
    from app.entity.applink import AppLink
    from app.entity.article_like import ArticleLike
    from app.entity.article import Article
    from app.entity.categories import Categories
    from app.entity.comment_rock import CommentRock
    from app.entity.discussion_comment import DiscussionComment
    from app.entity.discussion import Discussion
    from app.entity.email_verification import EmailVerification
    from app.entity.faq import Faq
    from app.entity.import_all_entities import ImportAllEntities
    from app.entity.interest import Interest
    from app.entity.like_comment_rock import LikeCommentRock
    from app.entity.password_reset import PasswordReset
    from app.entity.payment import Payment
    from app.entity.quiz import Quiz
    from app.entity.rock_scan_history import RockScanHistory
    from app.entity.rock_spawn import RockSpawn
    from app.entity.rock import Rock
    from app.entity.subscription_plan import SubscriptionPlan
    from app.entity.testimonials import Testimonials
    from app.entity.token import Token
    from app.entity.trade_offer import TradeOffer
    from app.entity.user_activity import UserActivity
    from app.entity.user_rock_collection import UserRockCollection
    from app.entity.user_rock_spawn import UserRockSpawn
    from app.entity.user_subscription import UserSubscription
    from app.entity.user import User
    from app.entity.usertype import UserType
    from app.entity.video import Video
    from app.entity.zone_profile import ZoneProfile


    print("✅ All entities imported successfully")
