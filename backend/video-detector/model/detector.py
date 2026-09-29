import cv2
import numpy as np
import torch

from PIL import Image

from transformers import (
    VideoMAEForVideoClassification,
    VideoMAEImageProcessor
)


MODEL_NAME = "Vansh180/VideoMae-ffc23-deepfake-detector"


print("Loading AI video detection model...")


processor = VideoMAEImageProcessor.from_pretrained(
    MODEL_NAME
)

model = VideoMAEForVideoClassification.from_pretrained(
    MODEL_NAME
)

model.eval()


print("AI video detection model loaded.")


def load_video_frames(video_path, num_frames=16):

    cap = cv2.VideoCapture(video_path)

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    if total_frames <= 0:

        cap.release()

        return []


    indices = np.linspace(
        0,
        total_frames - 1,
        num_frames
    ).astype(int)


    frames = []


    for index in indices:

        cap.set(
            cv2.CAP_PROP_POS_FRAMES,
            int(index)
        )

        success, frame = cap.read()


        if not success:
            continue


        frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )


        frames.append(
            Image.fromarray(frame)
        )


    cap.release()


    return frames


def predict_video(video_path, extracted_frames=None):

    frames = load_video_frames(
        video_path,
        num_frames=16
    )


    if len(frames) == 0:

        return "Unable to Detect", 0.0


    inputs = processor(
        frames,
        return_tensors="pt"
    )


    with torch.no_grad():

        outputs = model(**inputs)

        probabilities = torch.softmax(
            outputs.logits,
            dim=1
        )[0]


    real_probability = float(
        probabilities[0]
    )

    fake_probability = float(
        probabilities[1]
    )


    if fake_probability > real_probability:

        label = "AI Generated"

        confidence = fake_probability

    else:

        label = "Real Video"

        confidence = real_probability


    return label, confidence