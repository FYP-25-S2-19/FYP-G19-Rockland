from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.article import Article
from app.entity.categories import Categories
from app.controller.authentication.permission_required import permission_required

search_article_blueprint = Blueprint('search_article', __name__)

class SearchArticleController:

    @staticmethod
    @search_article_blueprint.route('/api/articles/search', methods=['POST', 'GET'])
    @permission_required([])  # All logged-in users (Free, Premium, Expert, Admin)
    def search_articles(**kwargs):
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({'success': False, 'message': 'Authentication required'}), 401

            if request.method == 'GET':
                # Query params (for web or simple testing)
                search_term = request.args.get('search_term', '').strip()
                sort_by = request.args.get('sort_by', 'newest').lower()
                category_ids_raw = request.args.get('category_ids', '')
                category_ids = [
                    int(cid) for cid in category_ids_raw.split(",") if cid.strip().isdigit()
                ] if category_ids_raw else []

            else:
                # POST body (for React Native, etc.)
                data = request.get_json()
                search_term = data.get('search_term', '').strip()
                sort_by = data.get('sort_by', 'newest').lower()
                category_titles = data.get('selectedCategories', [])
                category_ids = []

                # Convert category titles to IDs
                if category_titles:
                    found_categories = Categories.query.filter(Categories.title.in_(category_titles)).all()
                    category_ids = [cat.categories_id for cat in found_categories]

            # Search using entity logic
            articles_data, status_code, message = Article.searchArticles(
                user_id=current_user.user_id,
                search_term=search_term if search_term else None,
                category_ids=category_ids,
                sort_by=sort_by
            )

            if articles_data is not None:
                return jsonify({
                    'success': True,
                    'message': message,
                    'articles': articles_data,
                    'total_count': len(articles_data),
                    'user_type': current_user.user_type.name if current_user.user_type else "Unknown"
                }), status_code

            else:
                return jsonify({'success': False, 'message': message}), status_code

        except Exception as e:
            print(f"❌ Error in search_articles controller: {e}")
            return jsonify({'success': False, 'message': f'Internal error: {str(e)}'}), 500
