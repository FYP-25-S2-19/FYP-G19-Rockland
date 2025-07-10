from app.models import db
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from google.cloud import storage

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
    file_url = db.Column(db.String(500), nullable=False)   # Public GCS URL
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
    BUCKET_NAME = 'rocklandapp'  # Single bucket for everything
    
    def __repr__(self):
        return f'<Video {self.video_id}: {self.name}>'
    
    def to_dict(self):
        """Convert Video to dictionary for JSON serialization"""
        return {
            'video_id': self.video_id,
            'name': self.name,
            'description': self.description,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'user_id': self.user_id,
            'file_url': self.file_url,  # This is the public GCS URL
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
        """Get all videos"""
        try:
            return cls.query.all()
        except Exception as e:
            print(f"Error fetching all videos: {str(e)}")
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
    def _ensure_bucket_exists(cls):
        """Create bucket if it doesn't exist"""
        try:
            client = storage.Client()
            bucket = client.bucket(cls.BUCKET_NAME)
            
            # Check if bucket exists
            if not bucket.exists():
                print(f"📦 Creating bucket: {cls.BUCKET_NAME}")
                bucket = client.create_bucket(cls.BUCKET_NAME, location='asia-southeast1')
                print(f"✅ Bucket created: {cls.BUCKET_NAME}")
            
            return bucket
            
        except Exception as e:
            print(f"❌ Bucket creation failed: {e}")
            return None
    
    @classmethod
    def createVideoWithFile(cls, name, description, user_id, video_file, remarks=None):
        """Create a new video with file upload to Google Cloud Storage"""
        try:
            # Validate file
            if not video_file or video_file.filename == '':
                return False, 400, "No file selected", None
            
            # Check file extension
            if not cls.allowed_file(video_file.filename):
                return False, 400, "Invalid file type. Allowed types: mp4, avi, mov, mkv, wmv, flv, webm", None
            
            # Check file size
            video_file.seek(0, os.SEEK_END)
            file_size = video_file.tell()
            video_file.seek(0)  # Reset file pointer
            
            if file_size > cls.MAX_FILE_SIZE:
                return False, 400, f"File too large. Maximum size is {cls.MAX_FILE_SIZE // (1024*1024)}MB", None
            
            # Generate secure filename
            filename = secure_filename(video_file.filename)
            if not filename:
                filename = f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
            
            # Upload to Google Cloud Storage
            try:
                client = storage.Client()
                
                # Ensure bucket exists
                bucket = cls._ensure_bucket_exists()
                if not bucket:
                    bucket = client.bucket(cls.BUCKET_NAME)
                
                # Generate unique filename to avoid conflicts
                file_extension = filename.rsplit('.', 1)[1].lower()
                unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                blob_path = f"videos/{unique_filename}"
                
                # Upload file to cloud storage
                blob = bucket.blob(blob_path)
                video_file.seek(0)  # Reset file pointer
                blob.upload_from_file(video_file, content_type=f'video/{file_extension}')
                
                # Get the public GCS URL
                file_url = f"https://storage.googleapis.com/{cls.BUCKET_NAME}/{blob_path}"
                
                print(f"✅ Video uploaded to cloud storage: {blob_path}")
                print(f"🌐 Public URL: {file_url}")
                file_path = blob_path
                
            except Exception as cloud_error:
                print(f"❌ Cloud storage upload failed: {str(cloud_error)}")
                
                # Temporary fallback to local storage for development
                print("🔄 Falling back to local storage for development...")
                try:
                    # Create upload directory if it doesn't exist
                    upload_folder = os.path.join('uploads', 'videos')
                    os.makedirs(upload_folder, exist_ok=True)
                    
                    # Generate unique filename to avoid conflicts
                    unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                    local_path = os.path.join(upload_folder, unique_filename)
                    
                    # Save file locally
                    video_file.seek(0)  # Reset file pointer
                    video_file.save(local_path)
                    
                    print(f"✅ Video uploaded to local storage: {local_path}")
                    file_path = local_path
                    file_url = f"/uploads/videos/{unique_filename}"  # Local URL
                    
                except Exception as local_error:
                    print(f"❌ Local storage fallback also failed: {str(local_error)}")
                    return False, 500, f"Failed to upload video: {str(cloud_error)}", None
            
            # Get file type
            file_type = f"video/{file_extension}"
            
            # Create video record in database
            success, status_code, message, new_video = cls.createVideo(
                name=name,
                description=description,
                user_id=user_id,
                file_path=file_path,
                file_url=file_url,
                file_name=filename,
                file_size=file_size,
                file_type=file_type,
                remarks=remarks
            )
            
            if not success:
                # If database creation failed, clean up uploaded file
                try:
                    if file_path.startswith('uploads'):
                        # Local file
                        if os.path.exists(file_path):
                            os.remove(file_path)
                            print(f"🧹 Cleaned up local file: {file_path}")
                    else:
                        # Cloud storage file
                        client = storage.Client()
                        bucket = client.bucket(cls.BUCKET_NAME)
                        blob = bucket.blob(file_path)
                        blob.delete()
                        print(f"🧹 Cleaned up cloud file: {file_path}")
                except Exception as cleanup_error:
                    print(f"⚠️ Failed to clean up file: {cleanup_error}")
                    pass
            
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
        """Delete video by ID with cloud storage cleanup"""
        try:
            # Check if video exists
            existing_video = cls.getVideoById(video_id)
            
            if not existing_video:
                return False, 404, "Video not found"
            
            # Store file info before deletion
            file_path = existing_video.file_path
            video_name = existing_video.name
            
            # Delete the video from database
            success, status_code, message = existing_video.deleteVideo()
            
            if success:
                # Delete the file (cloud storage or local fallback)
                try:
                    if file_path.startswith('uploads'):
                        # Local file
                        if os.path.exists(file_path):
                            os.remove(file_path)
                            print(f"✅ Deleted local file: {file_path}")
                    else:
                        # Cloud storage file
                        client = storage.Client()
                        bucket = client.bucket(cls.BUCKET_NAME)
                        blob = bucket.blob(file_path)
                        blob.delete()
                        print(f"✅ Deleted cloud storage file: {file_path}")
                except Exception as file_error:
                    print(f"⚠️ Failed to delete file: {str(file_error)}")
                    # Continue anyway - database record is deleted
                
                return True, status_code, f"Video '{video_name}' deleted successfully"
            else:
                return success, status_code, message
                
        except Exception as e:
            print(f"Error deleting video by ID: {str(e)}")
            return False, 500, f"Error deleting video: {str(e)}"