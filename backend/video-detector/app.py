from flask import Flask, request, render_template, jsonify
import os
from werkzeug.utils import secure_filename

from utils.extract_frames import extract_frames
from model.detector import predict_video


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)


# ============================================================
# UPLOAD FOLDER
# ============================================================

UPLOAD_FOLDER = "static/uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# ============================================================
# CORS
# ============================================================

from flask_cors import CORS

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    }
)


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():

    return jsonify({
        "success": True,
        "message": "AI Video Detection API is running",
        "server": "Video Detector",
        "port": 5000
    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    return jsonify({
        "success": True,
        "message": "Video detection API is running"
    })


# ============================================================
# NEXT.JS VIDEO API
# ============================================================

@app.route(
    "/api/video",
    methods=["POST"]
)
def api_video():

    # --------------------------------------------------------
    # CHECK FILE
    # --------------------------------------------------------

    if "file" not in request.files:

        return jsonify({
            "success": False,
            "error": "No video file uploaded"
        }), 400


    video = request.files["file"]


    # --------------------------------------------------------
    # CHECK FILENAME
    # --------------------------------------------------------

    if video.filename == "":

        return jsonify({
            "success": False,
            "error": "No video selected"
        }), 400


    # --------------------------------------------------------
    # SECURE FILENAME
    # --------------------------------------------------------

    filename = secure_filename(
        video.filename
    )


    # --------------------------------------------------------
    # SAVE FILE
    # --------------------------------------------------------

    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    try:

        video.save(filepath)

        print()
        print("========================================")
        print("VIDEO RECEIVED")
        print("========================================")
        print("Filename:", filename)
        print("Path:", filepath)
        print()


        # ----------------------------------------------------
        # EXTRACT FRAMES
        # ----------------------------------------------------

        print("Extracting video frames...")

        frames = extract_frames(
            filepath
        )

        print(
            "Frames extracted:",
            len(frames) if frames is not None else 0
        )


        # ----------------------------------------------------
        # AI PREDICTION
        # ----------------------------------------------------

        print("Running AI video detection...")

        label, confidence = predict_video(
            filepath,
            frames
        )


        # ----------------------------------------------------
        # CONVERT CONFIDENCE
        # ----------------------------------------------------

        confidence_percent = round(
            float(confidence) * 100,
            2
        )


        # ----------------------------------------------------
        # CALCULATE PROBABILITIES
        # ----------------------------------------------------

        prediction_text = str(
            label
        ).upper()


        if (
            "AI" in prediction_text
            or "FAKE" in prediction_text
            or "GENERATED" in prediction_text
        ):

            ai_probability = confidence_percent

            real_probability = round(
                100 - ai_probability,
                2
            )

        else:

            real_probability = confidence_percent

            ai_probability = round(
                100 - real_probability,
                2
            )


        # ----------------------------------------------------
        # SUCCESS RESPONSE
        # ----------------------------------------------------

        print()
        print("========================================")
        print("VIDEO RESULT")
        print("========================================")
        print("Prediction:", label)
        print("Confidence:", confidence_percent)
        print("Real Probability:", real_probability)
        print("AI Probability:", ai_probability)
        print("========================================")
        print()


        return jsonify({

            "success": True,

            "prediction": str(
                label
            ),

            "label": str(
                label
            ),

            "confidence": confidence_percent,

            "real_probability": real_probability,

            "ai_probability": ai_probability,

            "filename": filename

        })


    # --------------------------------------------------------
    # ERROR
    # --------------------------------------------------------

    except Exception as e:

        print()
        print("========================================")
        print("VIDEO DETECTION ERROR")
        print("========================================")
        print(str(e))
        print("========================================")
        print()


        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


    finally:

        # ----------------------------------------------------
        # OPTIONAL:
        # Keep uploaded file for now.
        #
        # If you want automatic deletion later,
        # we can enable it.
        # ----------------------------------------------------

        pass


# ============================================================
# OLD HTML PREDICTION ROUTE
# ============================================================

@app.route(
    "/predict",
    methods=["POST"]
)
def predict():

    if "video" not in request.files:

        return render_template(
            "index.html",
            error="No video uploaded"
        )


    video = request.files["video"]


    if video.filename == "":

        return render_template(
            "index.html",
            error="No video selected"
        )


    filename = secure_filename(
        video.filename
    )


    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )


    video.save(filepath)


    try:

        # ----------------------------------------------------
        # Extract frames
        # ----------------------------------------------------

        frames = extract_frames(
            filepath
        )


        # ----------------------------------------------------
        # AI prediction
        # ----------------------------------------------------

        label, confidence = predict_video(
            filepath,
            frames
        )


        return render_template(

            "index.html",

            video_file=filename,

            prediction=label,

            confidence=round(
                confidence * 100,
                2
            )

        )


    except Exception as e:

        return render_template(

            "index.html",

            error=str(e),

            video_file=filename

        )


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("========================================")
    print(" AI VIDEO DETECTOR")
    print("========================================")
    print()
    print("Local:")
    print("http://127.0.0.1:5000")
    print()
    print("Network:")
    print("http://10.202.114.128:5000")
    print()
    print("API:")
    print("POST /api/video")
    print()
    print("Health:")
    print("GET /api/health")
    print()
    print("========================================")
    print()


    app.run(

        host="0.0.0.0",

        port=5000,

        debug=False,

        use_reloader=False

    )