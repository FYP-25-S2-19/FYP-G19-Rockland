from app.models import db
from datetime import datetime
import os
from werkzeug.utils import secure_filename

# Import GCS utilities (same as Article)
from app.utils.gcs import upload_file_to_gcs, delete_file_from_gcs, generate_signed_url

class Video(db.Model):
    __tablename__ = 'video'

    video_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)  # Video title/name
    description = db.Column(db.Text, nullable=True)   # Video description
    date_created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Foreign key to User (who uploaded/manages the video)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    
    # File attachment fields
    file_path = db.Column(db.String(500), nullable=False)  # Cloud storage path
    file_url = db.Column(db.Text, nullable=False)
    file_name = db.Column(db.String(255), nullable=False)  # Original filename
    file_size = db.Column(db.BigInteger, nullable=True)    # File size in bytes
    file_type = db.Column(db.String(50), nullable=True)    # MIME type (video/mp4, etc.)
    
    # Additional fields
    remarks = db.Column(db.Text, nullable=True)            # Admin remarks/notes
    
    # Relationship to User
    user = db.relationship('User', backref='videos', lazy=True)
    
    # Configuration
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'}
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB limit
    
    def __repr__(self):
        return f'<Video {self.video_id}: {self.name}>'
    
    def to_dict(self):
        """Convert Video to dictionary for JSON serialization (following Article pattern)"""
        # Generate signed URL for video file if it exists
        signed_video_url = None
        if self.file_path:
            try:
                signed_video_url = generate_signed_url(self.file_path, expiration_minutes=120)
            except Exception as e:
                print(f"⚠️ Failed to generate signed URL for {self.file_path}: {e}")
                # Fallback to stored URL
                signed_video_url = self.file_url
        
        return {
            'video_id': self.video_id,
            'name': self.name,
            'description': self.description,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'user_id': self.user_id,
            'file_path': self.file_path,        # Internal cloud storage path
            'file_url': self.file_url,          # Stored public URL (for backward compatibility)
            'signed_video_url': signed_video_url,  # Fresh signed URL (main one to use)
            'file_name': self.file_name,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'remarks': self.remarks
        }
    
    def get_file_size_mb(self):
        """Get file size in MB"""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return None
    
    @classmethod
    def allowed_file(cls, filename):
        """Check if file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in cls.ALLOWED_EXTENSIONS
    
    @classmethod
    def getAllVideos(cls):
        """Get all videos ordered by creation date (newest first) - for admin use"""
        try:
            return cls.query.order_by(cls.date_created.desc()).all()
        except Exception as e:
            print(f"Error fetching all videos: {str(e)}")
            return []
    
    @classmethod
    def getLatestVideo(cls):
        """Get the most recent video - for landing page"""
        try:
            return cls.query.order_by(cls.date_created.desc()).first()
        except Exception as e:
            print(f"Error fetching latest video: {str(e)}")
            return None
    
    @classmethod
    def getVideoById(cls, video_id):
        """Get video by ID"""
        try:
            return cls.query.get(video_id)
        except Exception as e:
            print(f"Error fetching video by ID: {str(e)}")
            return None
    
    @classmethod
    def _upload_video_to_cloud(cls, video_file, filename):
        """Upload video to Google Cloud Storage (following Article pattern)"""
        try:
            # Validate file type
            if not cls.allowed_file(filename):
                print(f"❌ Invalid file type: {filename}")
                return None, None
            
            # Check file size
            if hasattr(video_file, 'seek'):
                video_file.seek(0, os.SEEK_END)
                file_size = video_file.tell()
                video_file.seek(0)
                
                if file_size > cls.MAX_FILE_SIZE:
                    print(f"❌ Video too large: {file_size} bytes (max: {cls.MAX_FILE_SIZE})")
                    return None, None
            
            # Upload using GCS utilities (same as Article)
            blob_path = upload_file_to_gcs(
                file_stream=video_file,
                filename=filename,
                folder="videos",
                custom_filename=None,  # Let it generate UUID-based name
                overwrite=True
            )
            
            if blob_path:
                # Generate signed URL for the uploaded file
                signed_url = generate_signed_url(blob_path, expiration_minutes=120)
                print(f"✅ Video uploaded to cloud: {blob_path}")
                print(f"✅ Generated signed URL: {signed_url}")
                return blob_path, signed_url
            else:
                print(f"❌ Failed to upload video: {filename}")
                return None, None
                
        except Exception as e:
            print(f"❌ Error uploading video: {e}")
            return None, None
    
    @classmethod
    def createVideo(cls, name, description, user_id, file_path, file_url, file_name, file_size=None, file_type=None, remarks=None):
        """Create a new video"""
        try:
            new_video = cls(
                name=name,
                description=description,
                user_id=user_id,
                file_path=file_path,
                file_url=file_url,
                file_name=file_name,
                file_size=file_size,
                file_type=file_type,
                remarks=remarks
            )
            db.session.add(new_video)
            db.session.commit()
            return True, 201, "Video created successfully", new_video
        except Exception as e:
            db.session.rollback()
            print(f"Error creating video: {str(e)}")
            return False, 500, f"Error creating video: {str(e)}", None
    
    @classmethod
    def createVideoWithFile(cls, name, description, user_id, video_file, remarks=None):
        """Create a new video with file upload (following Article pattern)"""
        try:
            # Validate required fields
            if not name or not name.strip():
                return False, 400, "Video name is required", None
            
            if not video_file or video_file.filename == '':
                return False, 400, "No video file selected", None
            
            if not user_id:
                return False, 400, "User ID is required", None
            
            # Generate secure filename
            filename = secure_filename(video_file.filename)
            if not filename:
                filename = f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
            
            # Check file extension
            if not cls.allowed_file(filename):
                return False, 400, "Invalid file type. Allowed types: mp4, avi, mov, mkv, wmv, flv, webm", None
            
            # Check file size
            video_file.seek(0, os.SEEK_END)
            file_size = video_file.tell()
            video_file.seek(0)  # Reset file pointer
            
            if file_size > cls.MAX_FILE_SIZE:
                return False, 400, f"File too large. Maximum size is {cls.MAX_FILE_SIZE // (1024*1024)}MB", None
            
            # Upload video to cloud using the same pattern as Article
            video_file.seek(0)  # Reset file pointer
            file_path, signed_url = cls._upload_video_to_cloud(video_file, filename)
            
            if not file_path:
                return False, 500, "Failed to upload video to cloud storage", None
            
            # Get file type
            file_extension = filename.rsplit('.', 1)[1].lower()
            file_type = f"video/{file_extension}"
            
            # Create video record in database
            success, status_code, message, new_video = cls.createVideo(
                name=name.strip(),
                description=description.strip() if description else None,
                user_id=user_id,
                file_path=file_path,        # Cloud storage path
                file_url=signed_url,        # Public signed URL
                file_name=filename,
                file_size=file_size,
                file_type=file_type,
                remarks=remarks.strip() if remarks else None
            )
            
            if not success:
                # Clean up uploaded file if database creation failed
                try:
                    delete_file_from_gcs(file_path)
                    print(f"🧹 Cleaned up cloud file: {file_path}")
                except Exception as cleanup_error:
                    print(f"⚠️ Failed to clean up file: {cleanup_error}")
            
            return success, status_code, message, new_video
            
        except Exception as e:
            print(f"Error creating video with file: {str(e)}")
            return False, 500, f"Error creating video: {str(e)}", None
    
    def deleteVideo(self):
        """Delete this video from database"""
        try:
            db.session.delete(self)
            db.session.commit()
            return True, 200, "Video deleted successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting video: {str(e)}")
            return False, 500, f"Error deleting video: {str(e)}"
    
    @classmethod
    def deleteVideoById(cls, video_id):
        """Delete video by ID with cloud storage cleanup (following Article pattern)"""
        try:
            existing_video = cls.getVideoById(video_id)
            
            if not existing_video:
                return False, 404, "Video not found"
            
            file_path = existing_video.file_path
            video_name = existing_video.name
            
            # Store video info for response
            video_data = existing_video.to_dict()
            
            # Delete video file from cloud storage if exists
            if file_path:
                success = delete_file_from_gcs(file_path)
                if success:
                    print(f"✅ Deleted video from cloud storage: {file_path}")
                else:
                    print(f"⚠️ Could not delete video from cloud storage: {file_path}")
            
            # Delete the video from database
            success, status_code, message = existing_video.deleteVideo()
            
            if success:
                return True, status_code, f"Video '{video_name}' deleted successfully", video_data
            else:
                return success, status_code, message, None
                
        except Exception as e:
            print(f"Error deleting video by ID: {str(e)}")
            return False, 500, f"Error deleting video: {str(e)}", None
