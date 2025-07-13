# Libraries
from flask import Blueprint, request, jsonify
import tempfile
import os

# Local Dependencies
from app.entity.ml.classifier import RockClassifier

rock_blueprint = Blueprint("rock", __name__)
rock_classifier = RockClassifier()

class RockRecognitionController:
    @staticmethod
    @rock_blueprint.route('/api/scan', methods=['POST'])
    def handle_scan_image():
        """Handle rock image scan"""
        try:
            # Check if image is in request
            if "image" not in request.files:
                return jsonify({
                    "success": False,
                    "error": "No image uploaded"
                }), 400

            image = request.files["image"]

            # Create a safe temp file (Windows-friendly)
            fd, temp_path = tempfile.mkstemp(suffix=".jpg")
            os.close(fd)

            try:
                image.save(temp_path)

                try:
                    prediction = rock_classifier.predict(temp_path)

                    if not prediction or not isinstance(prediction, str):
                        raise ValueError("Prediction returned invalid result")

                    return jsonify({
                        "success": True,
                        "rock_type": prediction
                    }), 200

                except Exception as pred_error:
                    return jsonify({
                        "success": False,
                        "error": "Prediction failed",
                        "details": str(pred_error)
                    }), 500

            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        except Exception as e:
            return jsonify({
                "success": False,
                "error": "Internal server error",
                "details": str(e)
            }), 500
