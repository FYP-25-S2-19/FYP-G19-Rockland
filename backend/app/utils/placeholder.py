# app/utils/placeholder.py

def get_placeholder_profile_picture(gender: str = None) -> str:
    if gender and gender.lower() == "female":
        return "placeholder/Female.png"  # This is the blob name inside the bucket
    return "placeholder/Male.png"        # Default for male or unknown
