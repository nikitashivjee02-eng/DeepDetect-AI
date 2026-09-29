from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import uuid
import numpy as np
import librosa
import joblib

from werkzeug.utils import secure_filename


app = Flask(__name__)

CORS(app)


# ==========================================
# SETTINGS
# ==========================================

UPLOAD_FOLDER = "uploads"

MODEL_PATH = "model/audio_detector.pkl"
SCALER_PATH = "model/audio_scaler.pkl"

SAMPLE_RATE = 16000
N_MFCC = 40
N_MELS = 64


os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==========================================
# LOAD MODEL
# ==========================================

print("Loading AI audio detection model...")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

print("AI audio detection model loaded.")


# ==========================================
# FEATURE EXTRACTION
# ==========================================

def extract_features(filepath):

    y, sr = librosa.load(
        filepath,
        sr=SAMPLE_RATE,
        mono=True
    )

    # MFCC
    mfcc = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=N_MFCC
    )

    # Mel Spectrogram
    mel = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_mels=N_MELS
    )

    mel_db = librosa.power_to_db(
        mel,
        ref=np.max
    )

    # MFCC mean + std
    mfcc_features = np.concatenate([
        np.mean(mfcc, axis=1),
        np.std(mfcc, axis=1)
    ])

    # Mel mean + std
    mel_features = np.concatenate([
        np.mean(mel_db, axis=1),
        np.std(mel_db, axis=1)
    ])

    # Combine
    features = np.concatenate([
        mfcc_features,
        mel_features
    ])

    return features


# ==========================================
# AUDIO PREDICTION
# ==========================================

def predict_audio(filepath):

    features = extract_features(filepath)

    features = scaler.transform(
        features.reshape(1, -1)
    )

    prediction = model.predict(features)[0]

    probabilities = model.predict_proba(features)[0]

    real_probability = float(probabilities[0])
    ai_probability = float(probabilities[1])


    if prediction == 1:

        label = "AI Generated"
        confidence = ai_probability

    else:

        label = "Real Human Voice"
        confidence = real_probability


    return {
        "label": label,
        "confidence": round(
            confidence * 100,
            2
        ),
        "real_probability": round(
            real_probability * 100,
            2
        ),
        "ai_probability": round(
            ai_probability * 100,
            2
        )
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    return jsonify({
        "success": True,
        "message": "Audio Detector API is running"
    })


# ==========================================
# AUDIO DETECTION API
# ==========================================

@app.route(
    "/api/audio",
    methods=["POST"]
)
def detect_audio():

    if "file" not in request.files:

        return jsonify({
            "success": False,
            "error": "No audio file uploaded"
        }), 400


    audio = request.files["file"]


    if audio.filename == "":

        return jsonify({
            "success": False,
            "error": "No audio selected"
        }), 400


    original_filename = secure_filename(
        audio.filename
    )


    extension = os.path.splitext(
        original_filename
    )[1]


    filename = (
        str(uuid.uuid4())
        + extension
    )


    filepath = os.path.join(
        UPLOAD_FOLDER,
        filename
    )


    try:

        print()
        print("================================")
        print("AUDIO API REQUEST")
        print("================================")

        print(
            "Original file:",
            original_filename
        )


        # Save audio
        audio.save(filepath)


        # Detect
        result = predict_audio(
            filepath
        )


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

        print("================================")


        return jsonify({

            "success": True,

            "filename": original_filename,

            "result": result

        })


    except Exception as e:

        print()
        print("================================")
        print("AUDIO API ERROR")
        print("================================")

        print(str(e))

        print("================================")


        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


    finally:

        # Delete temporary audio
        if os.path.exists(filepath):

            try:
                os.remove(filepath)

            except Exception:
                pass


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    print()
    print("================================")
    print("AI AUDIO DETECTOR API")
    print("================================")

    print(
        "Server: http://127.0.0.1:5003"
    )

    print(
        "Health: http://127.0.0.1:5003/api/health"
    )

    print(
        "Detection: POST /api/audio"
    )

    print("================================")
    print()


    app.run(
        host="127.0.0.1",
        port=5002,
        debug=False,
        use_reloader=False
    )