from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import uuid

from predict_image import predict_image


# =========================================================
# APP
# =========================================================

app = Flask(__name__)

CORS(app)


# =========================================================
# CONFIG
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# HOME
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "AI Image Detector API is running"
    })


# =========================================================
# HEALTH
# =========================================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "success": True,
        "service": "AI Image Detector",
        "status": "running"
    })


# =========================================================
# IMAGE DETECTION
# =========================================================

@app.route("/api/image", methods=["POST"])
def detect_image():

    filepath = None

    try:

        # -------------------------------------------------
        # CHECK FILE
        # -------------------------------------------------

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "error": "No image file uploaded"
            }), 400


        file = request.files["image"]


        if not file.filename:

            return jsonify({
                "success": False,
                "error": "No image selected"
            }), 400


        # -------------------------------------------------
        # GET EXTENSION
        # -------------------------------------------------

        original_filename = file.filename

        extension = os.path.splitext(
            original_filename
        )[1].lower()


        # -------------------------------------------------
        # ALLOWED IMAGE EXTENSIONS
        # -------------------------------------------------

        allowed_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".bmp"
        }


        if extension not in allowed_extensions:

            return jsonify({
                "success": False,
                "error": (
                    "Unsupported image format. "
                    "Please upload JPG, JPEG, PNG, WEBP or BMP."
                )
            }), 400


        # -------------------------------------------------
        # CREATE TEMPORARY FILE
        # -------------------------------------------------

        filename = (
            str(uuid.uuid4())
            + extension
        )


        filepath = os.path.join(
            UPLOAD_FOLDER,
            filename
        )


        # -------------------------------------------------
        # SAVE FILE
        # -------------------------------------------------

        file.save(
            filepath
        )


        print()
        print("==========================================")
        print(" IMAGE RECEIVED")
        print("==========================================")
        print(
            "Original filename :",
            original_filename
        )
        print(
            "Browser MIME type :",
            file.content_type
        )
        print(
            "Extension         :",
            extension
        )
        print(
            "Saved file        :",
            filepath
        )
        print("==========================================")


        # -------------------------------------------------
        # PREDICT
        # -------------------------------------------------

        result = predict_image(
            filepath
        )


        # -------------------------------------------------
        # PRINT RESULT
        # -------------------------------------------------

        print()
        print("==========================================")
        print(" IMAGE DETECTION RESULT")
        print("==========================================")
        print(
            "Prediction       :",
            result["label"]
        )
        print(
            "Confidence       :",
            result["confidence"],
            "%"
        )
        print(
            "Real Probability :",
            result["real_probability"],
            "%"
        )
        print(
            "AI Probability   :",
            result["ai_probability"],
            "%"
        )
        print("==========================================")
        print()


        # -------------------------------------------------
        # SEND RESULT TO NEXT.JS
        # -------------------------------------------------

        return jsonify({

            "success": True,

            "prediction":
                result["label"],

            "confidence":
                result["confidence"],

            "real_probability":
                result["real_probability"],

            "ai_probability":
                result["ai_probability"]

        })


    except Exception as e:

        print()
        print("==========================================")
        print(" IMAGE DETECTION ERROR")
        print("==========================================")
        print(str(e))
        print("==========================================")
        print()


        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


    finally:

        # -------------------------------------------------
        # DELETE TEMPORARY FILE
        # -------------------------------------------------

        if (
            filepath is not None
            and os.path.exists(filepath)
        ):

            try:

                os.remove(filepath)

            except Exception:

                pass


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    print()
    print("==========================================")
    print("       AI IMAGE DETECTOR")
    print("==========================================")
    print("API: http://127.0.0.1:5002")
    print("Endpoint: /api/image")
    print("==========================================")
    print()

    app.run(
        host="0.0.0.0",
        port=5002,
        debug=False
    )