from flask import Blueprint, request, jsonify
import uuid

# Local Dependencies
from app.entity.ml.classifier import RockClassifier
from app.utils.gcs import upload_file_to_gcs, generate_signed_url
from app.entity.rock import Rock  # <-- import Rock entity

rock_blueprint = Blueprint("rock", __name__)
rock_classifier = RockClassifier()

class RockRecognitionController:
    @staticmethod
    @rock_blueprint.route('/api/scan', methods=['POST'])
    def handle_scan_image():
        """Handle rock image scan and return prediction with image URL + rarity from DB"""
        try:
            if "image" not in request.files:
                return jsonify({
                    "success": False,
                    "error": "No image uploaded"
                }), 400

            image = request.files["image"]
            folder = "rock_scans"
            original_filename = image.filename or "rock.jpg"

            # Upload image to GCS
            blob_path = upload_file_to_gcs(
                file_stream=image,
                filename=original_filename,
                folder=folder
            )
            if not blob_path:
                return jsonify({"success": False, "error": "Upload failed"}), 500

            # Run ML prediction
            prediction = rock_classifier.predict(image)
            if not prediction or not isinstance(prediction, str):
                raise ValueError("Prediction returned invalid result")

            # Look up Rock in DB
            rock = Rock.query.filter_by(rock_name=prediction).first()

            if rock:
                rarity = rock.rarity or "Common"
                rock_id = rock.rock_id
            else:
                rarity = "Common"
                rock_id = None

            # Generate signed URL for frontend
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
