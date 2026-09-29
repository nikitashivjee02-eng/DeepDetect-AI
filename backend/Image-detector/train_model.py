import os
import cv2
import joblib
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report


# =========================================================
# PATHS
# =========================================================

REAL_DIR = "dataset/real"
AI_DIR = "dataset/ai"

MODEL_DIR = "trained_model"

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "image_detector.pkl"
)

SCALER_PATH = os.path.join(
    MODEL_DIR,
    "image_scaler.pkl"
)

os.makedirs(MODEL_DIR, exist_ok=True)


# =========================================================
# IMAGE FEATURE EXTRACTION
# =========================================================

def extract_features(image_path):

    image = cv2.imread(image_path)

    if image is None:
        return None

    image = cv2.resize(image, (128, 128))

    # -----------------------------------------------------
    # Convert color spaces
    # -----------------------------------------------------

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    hsv = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2HSV
    )

    features = []

    # -----------------------------------------------------
    # 1. Color statistics
    # -----------------------------------------------------

    for channel in cv2.split(image):

        features.append(np.mean(channel))
        features.append(np.std(channel))
        features.append(np.min(channel))
        features.append(np.max(channel))

    # -----------------------------------------------------
    # 2. HSV statistics
    # -----------------------------------------------------

    for channel in cv2.split(hsv):

        features.append(np.mean(channel))
        features.append(np.std(channel))

    # -----------------------------------------------------
    # 3. Grayscale statistics
    # -----------------------------------------------------

    features.append(np.mean(gray))
    features.append(np.std(gray))

    # -----------------------------------------------------
    # 4. Edge statistics
    # -----------------------------------------------------

    edges = cv2.Canny(
        gray,
        100,
        200
    )

    features.append(np.mean(edges))
    features.append(np.std(edges))

    # -----------------------------------------------------
    # 5. Texture using Laplacian
    # -----------------------------------------------------

    laplacian = cv2.Laplacian(
        gray,
        cv2.CV_64F
    )

    features.append(np.mean(laplacian))
    features.append(np.var(laplacian))

    # -----------------------------------------------------
    # 6. Grayscale histogram
    # -----------------------------------------------------

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
# LOAD DATASET
# =========================================================

X = []
y = []

print("\n==========================================")
print(" DATASET")
print("==========================================")

real_count = 0
ai_count = 0


# =========================================================
# LOAD REAL IMAGES
# =========================================================

if os.path.exists(REAL_DIR):

    for filename in os.listdir(REAL_DIR):

        path = os.path.join(
            REAL_DIR,
            filename
        )

        if not filename.lower().endswith(
            (
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
                ".jfif"
            )
        ):
            continue

        features = extract_features(path)

        if features is not None:

            X.append(features)

            # REAL = 0
            y.append(0)

            real_count += 1


# =========================================================
# LOAD AI IMAGES
# =========================================================

if os.path.exists(AI_DIR):

    for filename in os.listdir(AI_DIR):

        path = os.path.join(
            AI_DIR,
            filename
        )

        if not filename.lower().endswith(
            (
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
                ".jfif"
            )
        ):
            continue

        features = extract_features(path)

        if features is not None:

            X.append(features)

            # AI = 1
            y.append(1)

            ai_count += 1


# =========================================================
# DATASET INFORMATION
# =========================================================

print(f"Real images: {real_count}")
print(f"AI images: {ai_count}")
print(f"Total images: {len(X)}")


# =========================================================
# CHECK DATASET
# =========================================================

if real_count < 2 or ai_count < 2:

    print("\nERROR: Not enough images.")

    print(
        "Add at least 2 images to both "
        "dataset/real and dataset/ai."
    )

    exit()


X = np.array(X)
y = np.array(y)


# =========================================================
# CROSS VALIDATION
# =========================================================

print("\n==========================================")
print(" CROSS VALIDATION")
print("==========================================")

# Number of folds depends on the smallest class.
# With your current dataset:
#
# REAL = 6
# AI   = 10
#
# Therefore we can use 6 folds.

number_of_folds = min(
    5,
    real_count,
    ai_count
)

print(
    f"Using {number_of_folds}-Fold "
    "Stratified Cross-Validation"
)


# =========================================================
# MODEL PIPELINE
# =========================================================

pipeline = Pipeline(
    [
        (
            "scaler",
            StandardScaler()
        ),

        (
            "classifier",
            RandomForestClassifier(
                n_estimators=300,
                random_state=42,
                class_weight="balanced"
            )
        )
    ]
)


# =========================================================
# CROSS VALIDATION SCORES
# =========================================================

cross_validator = StratifiedKFold(
    n_splits=number_of_folds,
    shuffle=True,
    random_state=42
)

scores = cross_val_score(
    pipeline,
    X,
    y,
    cv=cross_validator,
    scoring="accuracy"
)


print("\nFold Accuracy:")

for index, score in enumerate(
    scores,
    start=1
):

    print(
        f"Fold {index}: "
        f"{score * 100:.2f}%"
    )


mean_accuracy = np.mean(scores)
std_accuracy = np.std(scores)


print("\n------------------------------------------")

print(
    f"Average Accuracy: "
    f"{mean_accuracy * 100:.2f}%"
)

print(
    f"Standard Deviation: "
    f"{std_accuracy * 100:.2f}%"
)


# =========================================================
# FINAL MODEL TRAINING
# =========================================================

print("\n==========================================")
print(" FINAL MODEL TRAINING")
print("==========================================")

pipeline.fit(
    X,
    y
)


# =========================================================
# EXTRACT FINAL MODEL + SCALER
# =========================================================

final_scaler = pipeline.named_steps[
    "scaler"
]

final_model = pipeline.named_steps[
    "classifier"
]


# =========================================================
# SAVE MODEL
# =========================================================

joblib.dump(
    final_model,
    MODEL_PATH
)

joblib.dump(
    final_scaler,
    SCALER_PATH
)


# =========================================================
# FINAL INFORMATION
# =========================================================

print("\n==========================================")
print(" MODEL SAVED")
print("==========================================")

print(
    f"Model : {MODEL_PATH}"
)

print(
    f"Scaler: {SCALER_PATH}"
)

print("\nTraining completed successfully.")