import pandas as pd
from app import create_app
from app.models import db
from app.entity.rock import Rock
from google.cloud import storage

# Load Flask app
app = create_app()
app.app_context().push()

# Constants
CSV_PATH = "rockland_rock_dataset.csv"
BUCKET_NAME = "rocklandapp"
PLACEHOLDER_PATH = "placeholder/no_image_found.png"
DEFAULT_USER_ID = 1

# GCS Client
storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)

# Read CSV
df = pd.read_csv(CSV_PATH)

# Counters
success_count = 0
fail_count = 0
skip_count = 0

# Helper to safely extract data
def safe_get(row, key):
    return None if pd.isna(row.get(key)) else row[key]

# Process each row
for _, row in df.iterrows():
    rock_name = safe_get(row, "rock_name")

    # Skip if rock already exists
    existing = Rock.query.filter_by(rock_name=rock_name).first()
    if existing:
        skip_count += 1
        print(f"⚠️  Skipped (already exists): {rock_name}")
        continue

    # Check image existence in GCS
    photo_path = safe_get(row, "photo_url")
    if photo_path:
        blob = bucket.blob(photo_path)
        if not blob.exists():
            photo_path = PLACEHOLDER_PATH
    else:
        photo_path = PLACEHOLDER_PATH

    # Create Rock
    success, code, msg, rock = Rock.create_rock(
        rock_name=rock_name,
        rock_type=safe_get(row, "rock_type"),
        description=safe_get(row, "description"),
        hardness=safe_get(row, "hardness"),
        color=safe_get(row, "color"),
        composition=safe_get(row, "composition"),
        rarity=safe_get(row, "rarity"),
        density=safe_get(row, "density"),
        common_location=safe_get(row, "common_location"),
        fun_fact=safe_get(row, "fun_fact"),
        photo_url=photo_path,
        user_id=DEFAULT_USER_ID
    )

    if success:
        success_count += 1
        print(f"✅ Added: {rock_name}")
    else:
        fail_count += 1
        print(f"❌ Failed to add {rock_name}: {msg}")

# Summary
print(f"\n✅ Import complete: {success_count} added, ❌ {fail_count} failed, ⚠️ {skip_count} skipped.")
