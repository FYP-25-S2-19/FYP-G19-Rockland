from flask import Blueprint, request, jsonify

# Local Dependencies
from app.entity.ml.classifier import RockClassifier
from app.utils.gcs import upload_file_to_gcs, generate_signed_url
from app.entity.rock import Rock
from app.entity.rock_scan_history import RockScanHistory
from app.controller.authentication.permission_required import permission_required

rock_blueprint = Blueprint("rock", __name__)
rock_classifier = RockClassifier()

# Login required, no special permission
login_required = permission_required([])

DAILY_FREE_LIMIT = 3  # enforce at scan-time

class RockRecognitionController:
    @staticmethod
    @rock_blueprint.route('/api/scan', methods=['POST'])
    @login_required
    def handle_scan_image(current_user):
        """
        Handle rock image scan and return prediction + DB metadata.
        Returns:
          {
            success: True,
            rock_name: str,       # <-- the predicted rock's name
            rock_type: str|null,  # <-- canonical type from DB (Igneous/Metamorphic/Sedimentary), if known
            rock_id: int|null,
            rarity: str|null,
            image_url: str|null
          }
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
            # ---- 0) Enforce 3/day for Free users BEFORE heavy work ----
            from app.entity.user import User
            user = User.queryUserById(current_user.user_id)
            if not user:
                return jsonify({"success": False, "error": "User not found"}), 404

            user_type = getattr(user, "user_type", None)
            has_premium = bool(getattr(user_type, "has_premium_permission", False))
            has_expert = bool(getattr(user_type, "has_expert_permission", False))
            is_free_user = not (has_premium or has_expert)

            if is_free_user:
                todays = RockScanHistory.get_today_scan_count(current_user.user_id)
                if todays >= DAILY_FREE_LIMIT:
                    return jsonify({
                        "success": False,
                        "limit_reached": True,
                        "message": "Daily scan limit reached for Free users.",
                        "limit_info": {
                            "allowed": False, "remaining": 0, "limit": DAILY_FREE_LIMIT,
                            "limit_exceeded": True, "scan_count": todays
                        }
                    }), 403

            # ---- 1) Validate input ----
            if "image" not in request.files:
                return jsonify({"success": False, "error": "No image uploaded"}), 400

            image = request.files["image"]
            folder = "rock_scans"
            original_filename = image.filename or "rock.jpg"

            # ---- 2) Upload to GCS ----
            blob_path = upload_file_to_gcs(file_stream=image, filename=original_filename, folder=folder)
            if not blob_path:
                print("❌ GCS upload failed")
                return jsonify({"success": False, "error": "Upload failed"}), 500
            print(f"✅ Image uploaded to: {blob_path}")

            image_url = generate_signed_url(blob_path)

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

            rock_name = prediction.strip()

            # ---- 4) Look up DB info (ID, rarity, TYPE) ----
            rock = Rock.query.filter_by(rock_name=rock_name).first()
            if rock:
                rock_id = getattr(rock, "rock_id", None)
                rarity = getattr(rock, "rarity", None) or "Common"
                # IMPORTANT: this is the canonical type your Collection page already shows
                rock_type = getattr(rock, "rock_type", None)  # e.g. "Igneous", "Metamorphic", "Sedimentary"
            else:
                rock_id = None
                rarity = "Common"
                rock_type = None  # unknown type if we don't have it in DB

            # ---- 5) Return both name AND real type ----
            return jsonify({
                "success": True,
                "rock_name": rock_name,   # <-- explicit name
                "rock_type": rock_type,   # <-- true type from DB (may be null)
                "rock_id": rock_id,
                "rarity": rarity,
                "image_url": image_url
            }
            
            print(f"✅ Final result: rock_type={prediction}, rarity={rarity}")
            return jsonify(result), 200

        except Exception as e:
            print("❌ Exception during scan:", str(e))
            return jsonify({"success": False, "error": "Internal server error", "details": str(e)}), 500
