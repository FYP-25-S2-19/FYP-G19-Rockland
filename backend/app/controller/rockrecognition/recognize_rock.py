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
        import os
        import traceback
        
        print("=" * 50)
        print("🔍 SCAN ENDPOINT STARTED")
        print(f"🔍 Current directory: {os.getcwd()}")
        print(f"🔍 Model file exists: {os.path.exists('app/entity/ml/rocknet.pt')}")
        print(f"🔍 Classifier file exists: {os.path.exists('app/entity/ml/classifier.py')}")
        
        # List ml directory contents
        if os.path.exists('app/entity/ml'):
            print(f"🔍 ML directory contents: {os.listdir('app/entity/ml')}")
        
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
            print("🔄 Uploading image to GCS...")
            blob_path = upload_file_to_gcs(
                file_stream=image,
                filename=original_filename,
                folder=folder
            )
            if not blob_path:
                print("❌ GCS upload failed")
                return jsonify({"success": False, "error": "Upload failed"}), 500
            print(f"✅ Image uploaded to: {blob_path}")

            # ---- 3) Run ML prediction ----
            print("🔄 Attempting to run ML prediction...")
            print(f"🔍 rock_classifier object exists: {rock_classifier is not None}")
            
            try:
                if rock_classifier is None:
                    print("❌ rock_classifier is None - trying to initialize new one")
                    from app.entity.ml.classifier import RockClassifier
                    temp_classifier = RockClassifier()
                    prediction = temp_classifier.predict(image)
                else:
                    prediction = rock_classifier.predict(image)
                
                print(f"✅ ML prediction completed: {prediction}")
                
            except Exception as pred_error:
                print(f"❌ ML prediction failed: {str(pred_error)}")
                traceback.print_exc()
                prediction = "Unknown"
            
            if not prediction or not isinstance(prediction, str):
                print("❌ Invalid prediction result, defaulting to Unknown")
                prediction = "Unknown"

            # ---- 4) Look up Rock in DB ----
            print(f"🔄 Looking up rock '{prediction}' in database...")
            rock = Rock.query.filter_by(rock_name=prediction).first()

            if rock:
                rarity = rock.rarity or "Common"
                rock_id = rock.rock_id
                print(f"✅ Found rock in DB: ID={rock_id}, rarity={rarity}")
            else:
                rarity = "Common"
                rock_id = None
                print(f"⚠️ Rock '{prediction}' not found in database")

            # ---- 5) Generate signed URL for frontend ----
            image_url = generate_signed_url(blob_path)
            print("✅ Generated signed preview URL")

            result = {
                "success": True,
                "rock_type": prediction,
                "rock_id": rock_id,
                "rarity": rarity,
                "image_url": image_url
            }
            
            print(f"✅ Final result: rock_type={prediction}, rarity={rarity}")
            return jsonify(result), 200

        except Exception as e:
            print(f"❌ Exception during scan: {str(e)}")
            traceback.print_exc()
            return jsonify({
                "success": False,
                "error": "Internal server error",
                "details": str(e)
            }), 500
        
        finally:
            print("🔍 SCAN ENDPOINT FINISHED")
            print("=" * 50)