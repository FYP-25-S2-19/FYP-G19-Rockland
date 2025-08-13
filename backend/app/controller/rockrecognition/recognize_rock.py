from flask import Blueprint, request, jsonify
import uuid

# Local Dependencies
from app.entity.ml.classifier import RockClassifier
from app.utils.gcs import upload_file_to_gcs, generate_signed_url
from app.entity.rock import Rock  # <-- import Rock entity
from app.entity.rock_scan_history import RockScanHistory  # <-- NEW: for limit check
from app.controller.authentication.permission_required import permission_required  # <-- NEW: auth

rock_blueprint = Blueprint("rock", __name__)
rock_classifier = RockClassifier()

# NEW: auth decorator (login required, no special permission)
login_required = permission_required([])

class RockRecognitionController:
    @staticmethod
    @rock_blueprint.route('/api/scan', methods=['POST'])
    @login_required
    def handle_scan_image(current_user):
        """
        Handle rock image scan and return prediction with image URL + rarity from DB.
        Enforces 3 scans/day limit for Free users (checked BEFORE uploading/scanning).
        """
        try:
            # ---- 0) Role gate + daily limit for Free users ----
            user_type = getattr(current_user, "user_type", None)
            has_premium = bool(getattr(user_type, "has_premium_permission", False))
            has_expert = bool(getattr(user_type, "has_expert_permission", False))
            is_free_user = not (has_premium or has_expert)

            if is_free_user:
                # uses your existing entity helper
                limit_result = RockScanHistory.check_user_scan_limit(current_user.user_id)
                # Expected shape (from your check controller): {'allowed': bool, 'remaining': int, 'limit': 3}
                if isinstance(limit_result, dict) and not limit_result.get("allowed", False):
                    return jsonify({
                        "success": False,
                        "limit_reached": True,
                        "message": "Daily scan limit reached for Free users.",
                        "limit_info": limit_result
                    }), 403

            # ---- 1) Validate input (after limit check) ----
            if "image" not in request.files:
                return jsonify({
                    "success": False,
                    "error": "No image uploaded"
                }), 400

            image = request.files["image"]
            folder = "rock_scans"
            original_filename = image.filename or "rock.jpg"

            # ---- 2) Upload image to GCS ----
            blob_path = upload_file_to_gcs(
                file_stream=image,
                filename=original_filename,
                folder=folder
            )
            if not blob_path:
                return jsonify({"success": False, "error": "Upload failed"}), 500

            # ---- 3) Run ML prediction ----
            prediction = rock_classifier.predict(image)
            if not prediction or not isinstance(prediction, str):
                raise ValueError("Prediction returned invalid result")

            # ---- 4) Look up Rock in DB ----
            rock = Rock.query.filter_by(rock_name=prediction).first()

            if rock:
                rarity = rock.rarity or "Common"
                rock_id = rock.rock_id
            else:
                rarity = "Common"
                rock_id = None

            # ---- 5) Generate signed URL for frontend ----
            image_url = generate_signed_url(blob_path)
            print("✅ Returning signed preview URL:", image_url)

            return jsonify({
                "success": True,
                "rock_type": prediction,
                "rock_id": rock_id,
                "rarity": rarity,
                "image_url": image_url
            }), 200

        except Exception as e:
            print("❌ Exception during scan:", str(e))
            return jsonify({
                "success": False,
                "error": "Internal server error",
                "details": str(e)
            }), 500
