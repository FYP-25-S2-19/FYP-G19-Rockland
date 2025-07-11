import os
import re
from google.cloud import storage

# 🔧 CONFIGURATION
BUCKET_NAME = "rocklandapp"              # CHANGE THIS
LOCAL_FOLDER = "rock-images-display"          # Local folder with raw files
GCS_FOLDER = "rock-image-display"             # Folder in GCS

def clean_filename(filename: str) -> str:
    # Remove digits and convert to lowercase, preserve extension
    name, ext = os.path.splitext(filename)
    clean_name = re.sub(r'\d+', '', name).lower()
    return f"{clean_name}{ext.lower()}"

def upload_images_to_gcs():
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)

    seen_names = set()  # To avoid overwriting duplicates like coal1, coal2, ...

    for filename in os.listdir(LOCAL_FOLDER):
        if not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue  # skip non-images

        local_path = os.path.join(LOCAL_FOLDER, filename)
        cleaned_filename = clean_filename(filename)

        # Skip duplicates
        if cleaned_filename in seen_names:
            print(f"⚠️ Skipping duplicate for: {cleaned_filename}")
            continue

        seen_names.add(cleaned_filename)
        blob_path = f"{GCS_FOLDER}/{cleaned_filename}"

        print(f"⬆️ Uploading {filename} → {blob_path}...")

        try:
            blob = bucket.blob(blob_path)
            blob.upload_from_filename(local_path)
            print(f"✅ Uploaded: {cleaned_filename}")
        except Exception as e:
            print(f"❌ Failed to upload {filename}: {e}")

if __name__ == "__main__":
    upload_images_to_gcs()
