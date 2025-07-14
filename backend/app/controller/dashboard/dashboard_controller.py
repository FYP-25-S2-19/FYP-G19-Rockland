from flask import Blueprint, request, jsonify
from app.controller.authentication.permission_required import permission_required
from app.entity.user import User
from app.entity.rock import Rock
from app.entity.application import Application
from app.entity.article import Article
from app.entity.categories import Categories

dashboard_blueprint = Blueprint('dashboard', __name__)

class DashboardController:
    
    @staticmethod
    @dashboard_blueprint.route('/api/dashboard/stats', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_dashboard_stats(**kwargs):
        """Get all dashboard statistics"""
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({'success': False, 'message': 'Admin authentication required'}), 401
            
            # Fetch all counts
            total_users, _, _ = User.getTotalUserCount()
            total_rocks, _, _ = Rock.getTotalRockCount()
            total_applications, _, _ = Application.getTotalApplicationCount()
            total_articles, _, _ = Article.getTotalArticleCount()
            
            # Get detailed breakdowns
            user_type_counts, _, _ = User.getUserCountByType()
            rock_type_counts, _, _ = Rock.getRockCountByType()
            application_status_counts, _, _ = Application.getApplicationCountByStatus()
            
            return jsonify({
                'success': True,
                'stats': {
                    'total_users': total_users,
                    'total_rocks': total_rocks,
                    'total_applications': total_applications,
                    'total_articles': total_articles
                },
                'breakdowns': {
                    'user_types': [{'type': item[0], 'count': item[1]} for item in user_type_counts],
                    'rock_types': [{'type': item[0], 'count': item[1]} for item in rock_type_counts],
                    'application_status': [{'status': item[0], 'count': item[1]} for item in application_status_counts]
                }
            }), 200
            
        except Exception as e:
            print(f"Error in dashboard stats: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching dashboard stats: {str(e)}'
            }), 500

    @staticmethod
    @dashboard_blueprint.route('/api/dashboard/categories/demand', methods=['GET'])
    @permission_required('has_admin_permission')
    def get_category_demand(**kwargs):
        """Get category demand statistics"""
        try:
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({'success': False, 'message': 'Admin authentication required'}), 401
            
            # Get category demand data from entity
            category_demand_data, status_code, message = Categories.getCategoryDemandStatistics()
            
            if status_code != 200:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
            
            return jsonify({
                'success': True,
                **category_demand_data
            }), 200
            
        except Exception as e:
            print(f"Error in category demand: {e}")
            return jsonify({
                'success': False,
                'message': f'Error fetching category demand: {str(e)}'
            }), 500