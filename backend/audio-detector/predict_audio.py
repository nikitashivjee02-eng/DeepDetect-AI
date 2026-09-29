import os
import sys
import numpy as np
import librosa
import joblib


SAMPLE_RATE = 16000
N_MFCC = 40
N_MELS = 64

MODEL_PATH = "model/audio_detector.pkl"
SCALER_PATH = "model/audio_scaler.pkl"


def extract_features(filepath):

    y, sr = librosa.load(
        filepath,
        sr=SAMPLE_RATE,
        mono=True
    )

    mfcc = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=N_MFCC
    )

    mel = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_mels=N_MELS
    )

    mel_db = librosa.power_to_db(
        mel,
        ref=np.max
    )

    mfcc_features = np.concatenate([
        np.mean(mfcc, axis=1),
        np.std(mfcc, axis=1)
    ])

    mel_features = np.concatenate([
        np.mean(mel_db, axis=1),
        np.std(mel_db, axis=1)
    ])

    features = np.concatenate([
        mfcc_features,
        mel_features
    ])

    return features


def predict_audio(filepath):

    if not os.path.exists(filepath):
        raise FileNotFoundError(
            f"Audio file not found: {filepath}"
        )

    print("Audio:", filepath)

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    print("Model loaded successfully.")

    features = extract_features(filepath)

    print("Features extracted:", features.shape)

    features = scaler.transform(
        features.reshape(1, -1)
    )

    prediction = model.predict(features)[0]

    probabilities = model.predict_proba(features)[0]

    real_probability = probabilities[0]
    ai_probability = probabilities[1]

    if prediction == 1:
        label = "AI Generated"
        confidence = ai_probability
    else:
        label = "Real Human Voice"
        confidence = real_probability

    print()
    print("================================")
    print("RESULT")
    print("================================")
    print("Prediction:", label)
    print(f"Confidence: {confidence * 100:.2f}%")
    print(f"Real probability: {real_probability * 100:.2f}%")
    print(f"AI probability: {ai_probability * 100:.2f}%")
    print("================================")

    return {
        "label": label,
        "confidence": round(float(confidence) * 100, 2),
        "real_probability": round(float(real_probability) * 100, 2),
        "ai_probability": round(float(ai_probability) * 100, 2)
    }


if __name__ == "__main__":

    if len(sys.argv) < 2:

        print()
        print("Usage:")
        print("python predict_audio.py <audio_file>")
        print()

        print("Example:")
        print(
            "python predict_audio.py "
            "dataset/ai/ai_001.wav.mp3"
        )

        sys.exit(1)

    audio_file = sys.argv[1]

    result = predict_audio(audio_file)

    print()
    print("Returned result:")
    print(result)