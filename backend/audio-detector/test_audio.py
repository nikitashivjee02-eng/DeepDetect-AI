from utils.audio_processor import extract_features


audio_file = "uploads/test.wav.mp3"

features = extract_features(audio_file)

print("Audio duration:", features["duration"], "seconds")
print("Sample rate:", features["sample_rate"])
print("MFCC shape:", features["mfcc"].shape)
print("Mel spectrogram shape:", features["mel_spectrogram"].shape)

print("Audio preprocessing successful!")