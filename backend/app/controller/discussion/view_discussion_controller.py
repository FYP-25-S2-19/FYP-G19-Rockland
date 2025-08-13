from flask import Blueprint, jsonify, request
from app.entity.discussion import Discussion
from app.entity.discussion_comment import DiscussionComment
from app.controller.authentication.permission_required import permission_required

view_discussion_blueprint = Blueprint('view_discussion', __name__)


class ViewDiscussionController:
    
    @staticmethod
    @view_discussion_blueprint.route('/api/discussions', methods=['GET'])
    @permission_required('has_premium_permission', 'has_expert_permission')
    def get_discussions(**kwargs):
        """Fetch all discussions for premium users"""
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({'success': False, 'message': 'Premium authentication required'}), 401

            # Keep existing simple list (default newest)
            discussions = Discussion.query.order_by(Discussion.timestamp.desc()).all()
            return jsonify({
                "success": True, 
                "discussions": [d.to_dict() for d in discussions]
            }), 200

        except Exception as e:
            print(f"Error in get_discussions controller: {e}")
            return jsonify({'success': False, 'message': f'Error fetching discussions: {str(e)}'}), 500

    @staticmethod
    @view_discussion_blueprint.route('/api/discussions/<int:discussion_id>', methods=['GET'])
    @permission_required('has_premium_permission', 'has_expert_permission')
    def get_discussion_detail(discussion_id, **kwargs):
        """Fetch discussion detail for premium/expert users."""
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({'success': False, 'message': 'Premium authentication required'}), 401

            discussion = Discussion.query.get(discussion_id)
            if not discussion:
                return jsonify({"success": False, "message": "Discussion not found"}), 404

            comments = DiscussionComment.query.filter_by(discussion_id=discussion_id).all()
            return jsonify({
                "success": True,
                "discussion": discussion.to_dict(),
                "comments": [c.to_dict() for c in comments]
            }), 200

        except Exception as e:
            print(f"Error in get_discussion_detail controller: {e}")
            return jsonify({'success': False, 'message': f'Error fetching discussion: {str(e)}'}), 500

    # ---------- NEW: search/filter/recommended (no changes to existing routes) ----------
    @staticmethod
    @view_discussion_blueprint.route('/api/discussions/search', methods=['GET'])
    @permission_required('has_premium_permission', 'has_expert_permission')
    def search_discussions(**kwargs):
        """
        Search/filter discussions with interests & categories.

        Query params:
          q                : string (full-text on text)
          sort_by          : newest | oldest | most_commented | recommended
          category_ids     : "1,2,3"
          interest_ids     : "4,7,9"
        """
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({'success': False, 'message': 'Premium authentication required'}), 401

            q = request.args.get('q')
            sort_by = (request.args.get('sort_by') or 'newest').strip().lower()

            cat_param = request.args.get('category_ids')
            int_param = request.args.get('interest_ids')

            category_ids = [int(x) for x in cat_param.split(',')] if cat_param else None
            interest_ids = [int(x) for x in int_param.split(',')] if int_param else None

            data, status, msg = Discussion.searchDiscussions(
                user_id=current_user.user_id,
                search_term=q,
                sort_by=sort_by,
                category_ids=category_ids,
                interest_ids=interest_ids
            )
            return jsonify({"success": status < 400, "message": msg, "results": data}), status

        except Exception as e:
            print(f"Error in search_discussions controller: {e}")
            return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

    # ---------- NEW: update category/interest tags on a discussion ----------
    @staticmethod
    @view_discussion_blueprint.route('/api/discussions/<int:discussion_id>/tags', methods=['PUT'])
    @permission_required('has_premium_permission', 'has_expert_permission')
    def update_discussion_tags(discussion_id, **kwargs):
        """
        Update a discussion's category and/or interests.
        Body:
          categories_id : int | 0 to clear | omit to ignore
          interest_ids  : [] to clear | [ids] to set | omit to ignore
        """
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({"success": False, "message": "Authentication required"}), 401

            data = (request.get_json() or {})

            categories_id = data.get('categories_id', None)
            if categories_id is not None and str(categories_id).isdigit():
                categories_id = int(categories_id)

            interest_ids = data.get('interest_ids', None)
            if interest_ids is not None:
                if not isinstance(interest_ids, list):
                    return jsonify({"success": False, "message": "interest_ids must be a list"}), 400
                interest_ids = [int(x) for x in interest_ids if str(x).isdigit()]

            ok, status, msg, payload = Discussion.updateDiscussionTags(
                discussion_id=discussion_id,
                user_id=current_user.user_id,
                categories_id=categories_id,
                interest_ids=interest_ids
            )
            return jsonify({
                "success": ok,
                "message": msg,
                **({"discussion": payload} if payload else {})
            }), status

        except Exception as e:
            print(f"Error in update_discussion_tags controller: {e}")
            return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

    # ---------- Admin endpoints (unchanged) ----------
    @staticmethod
    @view_discussion_blueprint.route('/api/discussions/admin/all', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_all_discussions_admin(**kwargs):
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({'success': False, 'message': 'Admin authentication required'}), 401

            discussions_data, status_code = Discussion.getAllDiscussionsForAdmin()
            if discussions_data is not None:
                return jsonify({
                    'success': True,
                    'message': 'Discussions fetched successfully',
                    'discussions': discussions_data,
                    'total_count': len(discussions_data)
                }), status_code
            else:
                return jsonify({'success': False, 'message': 'Failed to fetch discussions'}), status_code

        except Exception as e:
            print(f"Error in get_all_discussions_admin controller: {e}")
            return jsonify({'success': False, 'message': f'Error fetching discussion: {str(e)}'}), 500

    @staticmethod
    @view_discussion_blueprint.route('/api/discussions/view/<int:discussion_id>', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_discussion_detail_admin(discussion_id, **kwargs):
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({'success': False, 'message': 'Admin authentication required'}), 401

            discussion_data, status_code, message = Discussion.getDiscussionById(discussion_id)
            if discussion_data is not None:
                comments = DiscussionComment.query.filter_by(discussion_id=discussion_id).all()
                return jsonify({
                    'success': True,
                    'message': message,
                    'discussion': discussion_data,
                    'comments': [c.to_dict() for c in comments]
                }), status_code
            else:
                return jsonify({'success': False, 'message': message}), status_code

        except Exception as e:
            print(f"Error in get_discussion_detail_admin controller: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching discussion: {str(e)}'
            }), 500
