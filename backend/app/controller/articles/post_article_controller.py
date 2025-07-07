from flask import Blueprint, request, jsonify
from datetime import datetime
import base64
import os
from werkzeug.utils import secure_filename

# Update imports to match your project structure
from app.models import db
from app.entity.article import Article
from app.entity.user import User
from app.entity.categories import Categories
from app.controller.authentication.permission_required import permission_required

post_article_blueprint = Blueprint('post_article', __name__)

class PostArticleController:
    
    # Allowed image extensions for mobile uploads
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    UPLOAD_FOLDER = 'uploads/articles'
    
    @staticmethod
    def allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in PostArticleController.ALLOWED_EXTENSIONS
    
    @staticmethod
    @post_article_blueprint.route('/api/articles/create', methods=['POST'])
    @permission_required('has_expert_permission')  # Only Expert users can create articles
    def create_article(**kwargs):
        """Create a new article - Expert users only via mobile"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401
            
            print(f"🎯 Expert user {current_user.email} is creating a new article")
            
            # Get JSON data from mobile request
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
            
            # Extract required fields
            title = data.get('title')
            content = data.get('content')
            categories_id = data.get('categories_id')
            is_free = data.get('is_free', True)  # Default to free
            photo_base64 = data.get('photo')  # Base64 encoded image from mobile
            
            # Handle photo upload from mobile (Base64)
            photo_path = None
            if photo_base64:
                try:
                    # Decode base64 image
                    if ',' in photo_base64:
                        # Remove data:image/jpeg;base64, prefix if present
                        photo_base64 = photo_base64.split(',')[1]
                    
                    photo_data = base64.b64decode(photo_base64)
                    
                    # Create upload directory if it doesn't exist
                    upload_dir = os.path.join('static', PostArticleController.UPLOAD_FOLDER)
                    os.makedirs(upload_dir, exist_ok=True)
                    
                    # Generate unique filename
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    filename = f"article_{current_user.user_id}_{timestamp}.jpg"
                    photo_path = os.path.join(PostArticleController.UPLOAD_FOLDER, filename)
                    full_path = os.path.join('static', photo_path)
                    
                    # Save image file
                    with open(full_path, 'wb') as f:
                        f.write(photo_data)
                    
                    # Store relative path for database
                    photo_path = f"/{photo_path}"
                    
                except Exception as e:
                    print(f"Error processing image: {e}")
                    return jsonify({
                        'success': False,
                        'message': 'Invalid image data'
                    }), 400
            
            # Use the entity method to create article
            success, status_code, message, new_article = Article.createArticle(
                title=title,
                content=content,
                categories_id=categories_id,
                user_id=current_user.user_id,
                photo=photo_path,
                is_free=is_free
            )
            
            if success and new_article:
                return jsonify({
                    'success': True,
                    'message': message,
                    'article': new_article.to_dict()
                }), status_code
            else:
                return jsonify({
                    'success': False,
                    'message': message
                }), status_code
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating article: {e}")
            return jsonify({
                'success': False,
                'message': f'Error creating article: {str(e)}'
            }), 500
    
    @staticmethod
    @post_article_blueprint.route('/api/articles/upload-photo', methods=['POST'])
    @permission_required('has_expert_permission')  # Only Expert users can upload photos
    def upload_photo(**kwargs):
        """Alternative endpoint for separate photo upload from mobile"""
        try:
            # Access current user from permission decorator
            current_user = kwargs.get('current_user')
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User authentication required'
                }), 401
            
            print(f"🎯 Expert user {current_user.email} is uploading a photo")
            
            # Check if photo is in request
            if 'photo' not in request.files:
                return jsonify({
                    'success': False,
                    'message': 'No photo file provided'
                }), 400
            
            file = request.files['photo']
            
            # Check if file is selected
            if file.filename == '':
                return jsonify({
                    'success': False,
                    'message': 'No file selected'
                }), 400
            
            # Validate file type
            if not PostArticleController.allowed_file(file.filename):
                return jsonify({
                    'success': False,
                    'message': 'Invalid file type. Allowed types: png, jpg, jpeg, gif, webp'
                }), 400
            
            # Create upload directory
            upload_dir = os.path.join('static', PostArticleController.UPLOAD_FOLDER)
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate secure filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            original_filename = secure_filename(file.filename)
            filename = f"article_{current_user.user_id}_{timestamp}_{original_filename}"
            
            # Save file
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)
            
            # Return relative path for frontend
            relative_path = f"/{PostArticleController.UPLOAD_FOLDER}/{filename}"
            
            return jsonify({
                'success': True,
                'message': 'Photo uploaded successfully',
                'photo_url': relative_path
            }), 200
            
        except Exception as e:
            print(f"Error uploading photo: {e}")
            return jsonify({
                'success': False,
                'message': f'Error uploading photo: {str(e)}'
            }), 500