# app/entity/import_all_entities.py

def import_entities():
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
    from app.entity.article import Article
    from app.entity.article_like import ArticleLike
    from app.entity.discussion import Discussion
    from app.entity.discussion_comment import DiscussionComment
    from app.entity.rock import Rock
    from app.entity.rock_spawn import RockSpawn
    from app.entity.user_rock_spawn import UserRockSpawn
    from app.entity.user_rock_collection import UserRockCollection
    from app.entity.comment_rock import CommentRock
    from app.entity.like_comment_rock import LikeCommentRock
    from app.entity.rock_scan_history import RockScanHistory
    from app.entity.trade_offer import TradeOffer
    from app.entity.zone_profile import ZoneProfile
    # Add any additional entities here

    print("✅ All entities imported successfully")
