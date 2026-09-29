import os
import numpy as np
import librosa
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, accuracy_score

from sklearn.neural_network import MLPClassifier


DATASET_DIR = "processed_dataset"

SAMPLE_RATE = 16000
N_MFCC = 40
N_MELS = 64


def extract_features(filepath):
    y, sr = librosa.load(filepath, sr=SAMPLE_RATE, mono=True)

    # MFCC features
    mfcc = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=N_MFCC
    )

    # Mel spectrogram
    mel = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_mels=N_MELS
    )

    mel_db = librosa.power_to_db(mel, ref=np.max)

    # Mean + standard deviation
    mfcc_features = np.concatenate([
        np.mean(mfcc, axis=1),
        np.std(mfcc, axis=1)
    ])

    mel_features = np.concatenate([
        np.mean(mel_db, axis=1),
        np.std(mel_db, axis=1)
    ])

    return np.concatenate([
        mfcc_features,
        mel_features
    ])


X = []
y = []

print("================================")
print("EXTRACTING AUDIO FEATURES")
print("================================")


for label_name, label in [("ai", 1), ("real", 0)]:

    folder = os.path.join(DATASET_DIR, label_name)

    files = [
        f for f in os.listdir(folder)
        if f.lower().endswith(".wav")
    ]

    print(f"{label_name.upper()} files: {len(files)}")

    for i, filename in enumerate(files):

        filepath = os.path.join(folder, filename)

        try:
            features = extract_features(filepath)

            X.append(features)
            y.append(label)

        except Exception as e:
            print(f"ERROR: {filename} -> {e}")

        if (i + 1) % 25 == 0:
            print(f"Processed {i + 1}/{len(files)}")


X = np.array(X)
y = np.array(y)

print()
print("Feature shape:", X.shape)
print("Labels:", len(y))

print()
print("AI samples:", np.sum(y == 1))
print("REAL samples:", np.sum(y == 0))


# --------------------------------
# TRAIN / TEST SPLIT
# --------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# --------------------------------
# FEATURE SCALING
# --------------------------------

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)


# --------------------------------
# CLASS WEIGHTS
# --------------------------------

classes = np.unique(y_train)

weights = compute_class_weight(
    class_weight="balanced",
    classes=classes,
    y=y_train
)

class_weights = dict(zip(classes, weights))

print()
print("Class weights:", class_weights)


# --------------------------------
# MODEL
# --------------------------------

print()
print("================================")
print("TRAINING MODEL")
print("================================")

model = MLPClassifier(
    hidden_layer_sizes=(128, 64),
    activation="relu",
    solver="adam",
    learning_rate_init=0.001,
    max_iter=300,
    early_stopping=True,
    validation_fraction=0.15,
    random_state=42
)


# sklearn MLPClassifier does not support class_weight directly.
# We therefore balance the training data by sample weights manually
# using repeated minority samples.

ai_indices = np.where(y_train == 1)[0]
real_indices = np.where(y_train == 0)[0]

target_count = max(len(ai_indices), len(real_indices))

rng = np.random.default_rng(42)

ai_selected = rng.choice(
    ai_indices,
    size=target_count,
    replace=True
)

real_selected = rng.choice(
    real_indices,
    size=target_count,
    replace=True
)

balanced_indices = np.concatenate([
    ai_selected,
    real_selected
])

rng.shuffle(balanced_indices)

X_train_balanced = X_train[balanced_indices]
y_train_balanced = y_train[balanced_indices]

print("Balanced training samples:", len(y_train_balanced))
print("AI:", np.sum(y_train_balanced == 1))
print("REAL:", np.sum(y_train_balanced == 0))


model.fit(
    X_train_balanced,
    y_train_balanced
)


# --------------------------------
# EVALUATION
# --------------------------------

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print()
print("================================")
print("MODEL RESULTS")
print("================================")

print(f"Accuracy: {accuracy * 100:.2f}%")

print()
print(classification_report(
    y_test,
    predictions,
    target_names=["Real", "AI Generated"]
))


# --------------------------------
# SAVE MODEL
# --------------------------------

os.makedirs("model", exist_ok=True)

joblib.dump(
    model,
    "model/audio_detector.pkl"
)

joblib.dump(
    scaler,
    "model/audio_scaler.pkl"
)

print()
print("================================")
print("MODEL SAVED")
print("================================")

print("model/audio_detector.pkl")
print("model/audio_scaler.pkl")