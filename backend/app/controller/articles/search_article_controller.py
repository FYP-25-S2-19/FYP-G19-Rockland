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

            # Default values
            search_term = ""
            sort_by = "newest"
            category_ids = []

            # 🔄 Handle GET requests (e.g., browser)
            if request.method == 'GET':
                search_term = request.args.get('search_term', '').strip()
                sort_by = request.args.get('sort_by', 'newest').lower()
                category_ids_raw = request.args.get('category_ids', '')

                if category_ids_raw:
                    category_ids = [
                        int(cid) for cid in category_ids_raw.split(",") if cid.strip().isdigit()
                    ]

            # 🔄 Handle POST requests (e.g., React Native)
            else:
                data = request.get_json()
                search_term = data.get('search_term', '').strip()
                sort_by = data.get('sort_by', 'newest').lower()
                category_titles = data.get('selectedCategories', [])

                # 🧠 Convert category titles to IDs
                if category_titles:
                    normalized_titles = [title.strip().lower() for title in category_titles if isinstance(title, str)]

                    found_categories = Categories.query.filter(
                        db.func.lower(Categories.title).in_(normalized_titles)
                    ).all()

                    category_ids = [cat.categories_id for cat in found_categories]

                    print("🔍 Raw titles:", category_titles)
                    print("🔎 Normalized:", normalized_titles)
                    print("✅ Matched category IDs:", category_ids)

                    if not category_ids:
                        print("⚠️ No matching categories found. Search will return empty.")

            # 🔍 Perform search using model logic
            articles_data, status_code, message = Article.searchArticles(
                user_id=current_user.user_id,
                search_term=search_term or None,
                category_ids=category_ids or None,
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
