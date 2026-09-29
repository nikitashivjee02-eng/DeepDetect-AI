
import os
import sys
import cv2
import joblib
import numpy as np


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_DIR = os.path.join(
    BASE_DIR,
    "trained_model"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "image_detector.pkl"
)

SCALER_PATH = os.path.join(
    MODEL_DIR,
    "image_scaler.pkl"
)


# =========================================================
# CHECK MODEL
# =========================================================

if not os.path.isfile(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

if not os.path.isfile(SCALER_PATH):
    raise FileNotFoundError(
        f"Scaler not found: {SCALER_PATH}"
    )


# =========================================================
# LOAD MODEL
# =========================================================

print("Loading image detection model...")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

print("Random Forest model loaded successfully.")


# =========================================================
# IMAGE FEATURE EXTRACTION
# =========================================================

def extract_features(image_path):

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(
            "Unable to read image."
        )

    image = cv2.resize(image, (128, 128))

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    hsv = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2HSV
    )

    features = []

    # Color statistics

    for channel in cv2.split(image):

        features.append(np.mean(channel))
        features.append(np.std(channel))
        features.append(np.min(channel))
        features.append(np.max(channel))

    # HSV statistics

    for channel in cv2.split(hsv):

        features.append(np.mean(channel))
        features.append(np.std(channel))

    # Grayscale statistics

    features.append(np.mean(gray))
    features.append(np.std(gray))

    # Edge statistics

    edges = cv2.Canny(
        gray,
        100,
        200
    )

    features.append(np.mean(edges))
    features.append(np.std(edges))

    # Texture statistics

    laplacian = cv2.Laplacian(
        gray,
        cv2.CV_64F
    )

    features.append(np.mean(laplacian))
    features.append(np.var(laplacian))

    # Histogram

    hist = cv2.calcHist(
        [gray],
        [0],
        None,
        [32],
        [0, 256]
    )

    hist = cv2.normalize(
        hist,
        hist
    ).flatten()

    features.extend(hist)

    return np.array(
        features,
        dtype=np.float32
    )


# =========================================================
# PREDICT IMAGE
# =========================================================

def predict_image(image_path):

    features = extract_features(
        image_path
    )

    # Use the scaler fitted during training

    features = scaler.transform(
        features.reshape(1, -1)
    )

    # Prediction

    prediction = model.predict(
        features
    )[0]

    # Probability

    probabilities = model.predict_proba(
        features
    )[0]

    # Class labels are fixed by train_model.py:
    # 0 = REAL
    # 1 = AI GENERATED

    real_probability = 0.0
    ai_probability = 0.0

    for class_id, probability in zip(
        model.classes_,
        probabilities
    ):

        if class_id == 0:

            real_probability = (
                probability * 100
            )

        elif class_id == 1:

            ai_probability = (
                probability * 100
            )

    if prediction == 0:

        label = "Real"

    else:

        label = "AI Generated"

    confidence = max(
        real_probability,
        ai_probability
    )

    return {

        "label": label,

        "confidence": round(
            confidence,
            2
        ),

        "real_probability": round(
            real_probability,
            2
        ),

        "ai_probability": round(
            ai_probability,
            2
        )
    }


# =========================================================
# COMMAND LINE TEST
# =========================================================

if __name__ == "__main__":

    if len(sys.argv) < 2:

        print()
        print(
            'Usage: python predict_image.py "path_to_image.jpg"'
        )
        print()

        sys.exit(1)

    image_path = sys.argv[1]

    try:

        result = predict_image(
            image_path
        )

        print()
        print("========================================")
        print(" IMAGE DETECTION RESULT")
        print("========================================")

        print(
            f"Prediction       : {result['label']}"
        )

        print(
            f"Confidence       : {result['confidence']}%"
        )

        print(
            f"Real Probability : {result['real_probability']}%"
        )

        print(
            f"AI Probability   : {result['ai_probability']}%"
        )

        print("========================================")
        print()

    except Exception as e:

        print()
        print(
            f"ERROR: {e}"
        )
        print()