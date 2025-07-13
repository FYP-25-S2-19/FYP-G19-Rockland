from google.cloud import storage
from flask import current_app
from datetime import timedelta
import uuid
import mimetypes
import os

def generate_signed_url(blob_name: str, expiration_minutes: int = 60) -> str:
    """Generate a signed URL for downloading an object from GCS."""
    try:
        bucket_name = current_app.config.get("GCS_BUCKET_NAME", "rocklandapp")
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=expiration_minutes),
            method="GET",
        )
        return url
    except Exception as e:
        print(f"Error generating signed URL: {str(e)}")
        # Fallback to public URL if signed URL fails
        bucket_name = current_app.config.get("GCS_BUCKET_NAME", "rocklandapp")
        return f"https://storage.googleapis.com/{bucket_name}/{blob_name}"


def upload_file_to_gcs(file_stream, filename: str, folder: str, custom_filename: str = None, overwrite: bool = True) -> str:
    """
    Uploads a file to a GCS folder and returns the blob path.
    Supports optional custom naming and overwrite.
    """
    bucket_name = current_app.config.get("GCS_BUCKET_NAME", "rocklandapp")
    client = storage.Client()
    bucket = client.bucket(bucket_name)

    # Extract extension
    extension = os.path.splitext(filename)[1] or ".bin"

    # Determine final filename
    final_filename = f"{custom_filename}{extension}" if custom_filename else f"{uuid.uuid4().hex}{extension}"
    blob_path = f"{folder}/{final_filename}"

    blob = bucket.blob(blob_path)

    if blob.exists() and not overwrite:
        raise Exception(f"Blob {blob_path} already exists and overwrite is False")

    content_type, _ = mimetypes.guess_type(filename)
    blob.upload_from_file(file_stream, content_type=content_type or 'application/octet-stream')

    return blob_path


def delete_file_from_gcs(blob_path: str) -> bool:
    """
    Deletes a file from GCS by blob path.
    Returns True if successful, False if file doesn't exist.
    """
    try:
        bucket_name = current_app.config.get("GCS_BUCKET_NAME", "rocklandapp")
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_path)

        if blob.exists():
            blob.delete()
            return True
        return False
    except Exception as e:
        print(f"Error deleting file from GCS: {str(e)}")
        return False
