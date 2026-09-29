from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import uuid
import numpy as np
import librosa
import joblib

from werkzeug.utils import secure_filename


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ============================================================
# APP
# ============================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    }
)


# ============================================================
# SETTINGS
# ============================================================

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "audio_detector.pkl"
)

SCALER_PATH = os.path.join(
    BASE_DIR,
    "model",
    "audio_scaler.pkl"
)

SAMPLE_RATE = 16000
N_MFCC = 40
N_MELS = 64

PORT = 5001


os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ============================================================
# CHECK MODEL FILES
# ============================================================

if not os.path.isfile(MODEL_PATH):

    raise FileNotFoundError(
        f"Audio detector model not found:\n{MODEL_PATH}"
    )


if not os.path.isfile(SCALER_PATH):

    raise FileNotFoundError(
        f"Audio scaler not found:\n{SCALER_PATH}"
    )


# ============================================================
# LOAD MODEL
# ============================================================

print()
print("================================")
print("Loading AI audio detection model...")
print("================================")

model = joblib.load(
    MODEL_PATH
)

scaler = joblib.load(
    SCALER_PATH
)

print("AI audio detection model loaded.")
print()


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_features(filepath):

    y, sr = librosa.load(
        filepath,
        sr=SAMPLE_RATE,
        mono=True
    )

    if y is None or len(y) == 0:

        raise ValueError(
            "The uploaded audio file is empty or could not be decoded."
        )


    # --------------------------------------------------------
    # MFCC
    # --------------------------------------------------------

    mfcc = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=N_MFCC
    )


    # --------------------------------------------------------
    # MEL SPECTROGRAM
    # --------------------------------------------------------

    mel = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_mels=N_MELS
    )

    mel_db = librosa.power_to_db(
        mel,
        ref=np.max
    )


    # --------------------------------------------------------
    # MFCC MEAN + STD
    # --------------------------------------------------------

    mfcc_features = np.concatenate([
        np.mean(mfcc, axis=1),
        np.std(mfcc, axis=1)
    ])


    # --------------------------------------------------------
    # MEL MEAN + STD
    # --------------------------------------------------------

    mel_features = np.concatenate([
        np.mean(mel_db, axis=1),
        np.std(mel_db, axis=1)
    ])


    # --------------------------------------------------------
    # COMBINE FEATURES
    # --------------------------------------------------------

    features = np.concatenate([
        mfcc_features,
        mel_features
    ])


    return features


# ============================================================
# AUDIO PREDICTION
# ============================================================

def predict_audio(filepath):

    features = extract_features(
        filepath
    )


    # --------------------------------------------------------
    # SCALE FEATURES
    # --------------------------------------------------------

    features = scaler.transform(
        features.reshape(1, -1)
    )


    # --------------------------------------------------------
    # PREDICTION
    # --------------------------------------------------------

    prediction = model.predict(
        features
    )[0]

    probabilities = model.predict_proba(
        features
    )[0]


    # --------------------------------------------------------
    # PROBABILITIES
    # --------------------------------------------------------

    real_probability = float(
        probabilities[0]
    )

    ai_probability = float(
        probabilities[1]
    )


    # --------------------------------------------------------
    # LABEL
    # --------------------------------------------------------

    if prediction == 1:

        label = "AI Generated"

        confidence = ai_probability

    else:

        label = "Real Human Voice"

        confidence = real_probability


    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    return {

        "label":
            label,

        "confidence":
            round(
                confidence * 100,
                2
            ),

        "real_probability":
            round(
                real_probability * 100,
                2
            ),

        "ai_probability":
            round(
                ai_probability * 100,
                2
            )
    }


# ============================================================
# HOME
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "success": True,

        "message":
            "AI Audio Detection API is running",

        "port":
            PORT
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

        "message":
            "Audio Detector API is running",

        "port":
            PORT
    })


# ============================================================
# AUDIO DETECTION API
# ============================================================

@app.route(
    "/api/audio",
    methods=["POST"]
)
def detect_audio():

    filepath = None


    try:

        # ====================================================
        # CHECK FILE
        # ====================================================

        if "file" not in request.files:

            return jsonify({

                "success": False,

                "error":
                    "No audio file uploaded"

            }), 400


        audio = request.files["file"]


        # ====================================================
        # CHECK FILENAME
        # ====================================================

        if not audio.filename:

            return jsonify({

                "success": False,

                "error":
                    "No audio selected"

            }), 400


        # ====================================================
        # SECURE FILENAME
        # ====================================================

        original_filename = secure_filename(
            audio.filename
        )


        # ====================================================
        # EXTENSION
        # ====================================================

        extension = os.path.splitext(
            original_filename
        )[1].lower()


        # ====================================================
        # BASIC AUDIO FORMAT CHECK
        # ====================================================

        allowed_extensions = {

            ".wav",
            ".mp3",
            ".m4a",
            ".ogg",
            ".flac",
            ".aac",
            ".webm"
        }


        if extension not in allowed_extensions:

            return jsonify({

                "success": False,

                "error":
                    f"Unsupported audio format: {extension}"

            }), 400


        # ====================================================
        # UNIQUE FILE
        # ====================================================

        filename = (
            str(uuid.uuid4())
            + extension
        )


        filepath = os.path.join(
            UPLOAD_FOLDER,
            filename
        )


        # ====================================================
        # LOG REQUEST
        # ====================================================

        print()
        print("================================")
        print("AUDIO API REQUEST")
        print("================================")

        print(
            "Original file:",
            original_filename
        )

        print(
            "Saved file:",
            filename
        )


        # ====================================================
        # SAVE AUDIO
        # ====================================================

        audio.save(
            filepath
        )


        if not os.path.isfile(filepath):

            raise RuntimeError(
                "Audio file could not be saved."
            )


        print(
            "File saved successfully."
        )


        # ====================================================
        # DETECT
        # ====================================================

        result = predict_audio(
            filepath
        )


        # ====================================================
        # LOG RESULT
        # ====================================================

        print()
        print("================================")
        print("AUDIO RESULT")
        print("================================")

        print(
            "Prediction:",
            result["label"]
        )

        print(
            "Confidence:",
            result["confidence"],
            "%"
        )

        print(
            "Real Probability:",
            result["real_probability"],
            "%"
        )

        print(
            "AI Probability:",
            result["ai_probability"],
            "%"
        )

        print("================================")
        print()


        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({

            "success": True,

            "result": {

                "label":
                    result["label"],

                "confidence":
                    result["confidence"],

                "real_probability":
                    result["real_probability"],

                "ai_probability":
                    result["ai_probability"]
            },

            "filename":
                filename
        })


    except Exception as e:

        print()
        print("================================")
        print("AUDIO API ERROR")
        print("================================")

        print(
            type(e).__name__
        )

        print(
            str(e)
        )

        print("================================")
        print()


        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 500


    finally:

        # ====================================================
        # DELETE TEMPORARY FILE
        # ====================================================

        if filepath and os.path.exists(filepath):

            try:

                os.remove(
                    filepath
                )

                print(
                    "Temporary audio deleted."
                )

            except Exception as cleanup_error:

                print(
                    "Could not delete temporary file:",
                    cleanup_error
                )


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("================================")
    print("AI AUDIO DETECTOR API")
    print("================================")

    print(
        f"Server: http://127.0.0.1:{PORT}"
    )

    print(
        f"Health: http://127.0.0.1:{PORT}/api/health"
    )

    print(
        f"Detection: POST http://127.0.0.1:{PORT}/api/audio"
    )

    print("================================")
    print()


    app.run(
    host="127.0.0.1",
    port=PORT,
    debug=False
)