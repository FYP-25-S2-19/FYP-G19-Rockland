from flask import Blueprint, jsonify

from app.entity.article import Article

get_top_liked_articles_blueprint = Blueprint('get_top_liked_articles', __name__)

@get_top_liked_articles_blueprint.route("/api/articles/top-liked", methods=["GET"])
def get_top_liked_articles():
    articles, status, message = Article.getTopLikedArticles()
    
    if articles is None:
        return jsonify({"success": False, "message": message}), status

    return jsonify({
        "success": True,
        "message": message,
        "top_liked_articles": articles
    }), status