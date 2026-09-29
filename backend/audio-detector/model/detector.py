import os
import torch
import torch.nn as nn

from utils.audio_processor import extract_features


class AudioDetector(nn.Module):

    def __init__(self, input_size=40):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(input_size, 128),
            nn.ReLU(),

            nn.Dropout(0.3),

            nn.Linear(128, 64),
            nn.ReLU(),

            nn.Dropout(0.3),

            nn.Linear(64, 1)
        )

    def forward(self, x):
        return self.network(x)


MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "audio_detector.pth"
)


def predict_audio(audio_path):

    features = extract_features(audio_path)

    # Average MFCC over time
    mfcc = features["mfcc"]

    mfcc_mean = mfcc.mean(axis=1)

    x = torch.tensor(
        mfcc_mean,
        dtype=torch.float32
    ).unsqueeze(0)

    # Model must exist before making a prediction
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "audio_detector.pth not found. "
            "The AI voice detection model has not been trained yet."
        )

    model = AudioDetector(
        input_size=40
    )

    model.load_state_dict(
        torch.load(
            MODEL_PATH,
            map_location="cpu"
        )
    )

    model.eval()

    with torch.no_grad():

        output = model(x)

        probability = torch.sigmoid(output).item()

    if probability >= 0.5:

        label = "AI Generated Voice"
        confidence = probability

    else:

        label = "Human Voice"
        confidence = 1 - probability

    return label, confidence