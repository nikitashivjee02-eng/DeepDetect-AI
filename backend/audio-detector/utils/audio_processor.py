import librosa
import numpy as np


def load_audio(audio_path, target_sr=16000):
    """
    Load audio and convert it to mono 16 kHz.
    """

    audio, sr = librosa.load(
        audio_path,
        sr=target_sr,
        mono=True
    )

    return audio, sr


def extract_features(audio_path):
    """
    Extract basic audio features for the AI detector.
    """

    audio, sr = load_audio(audio_path)

    # MFCC features
    mfcc = librosa.feature.mfcc(
        y=audio,
        sr=sr,
        n_mfcc=40
    )

    # Mel spectrogram
    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=sr,
        n_mels=64
    )

    # Convert to decibels
    mel_db = librosa.power_to_db(
        mel,
        ref=np.max
    )

    # Additional features
    spectral_centroid = librosa.feature.spectral_centroid(
        y=audio,
        sr=sr
    )

    zero_crossing_rate = librosa.feature.zero_crossing_rate(
        audio
    )

    features = {
        "mfcc": mfcc,
        "mel_spectrogram": mel_db,
        "spectral_centroid": spectral_centroid,
        "zero_crossing_rate": zero_crossing_rate,
        "sample_rate": sr,
        "duration": len(audio) / sr
    }

    return features