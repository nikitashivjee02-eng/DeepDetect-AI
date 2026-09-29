import cv2
import os


def extract_frames(video_path):

    output_dir = "predict"

    os.makedirs(output_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)

    frames = []
    count = 0

    while True:

        success, frame = cap.read()

        if not success:
            break

        # Save every 10th frame
        if count % 10 == 0:

            filename = os.path.join(
                output_dir,
                f"frame_{count}.jpg"
            )

            cv2.imwrite(
                filename,
                frame
            )

            frames.append(filename)

        count += 1

    cap.release()

    return frames