@'
import os
import subprocess
import librosa
import soundfile as sf

DATASET_DIR = "dataset"
PROCESSED_DIR = "processed_dataset"

SAMPLE_RATE = 16000
CLIP_DURATION = 2
STEP_DURATION = 1


def convert_to_wav(input_file, output_file):
    command = [
        "ffmpeg",
        "-y",
        "-i",
        input_file,
        "-ar",
        str(SAMPLE_RATE),
        "-ac",
        "1",
        "-c:a",
        "pcm_s16le",
        output_file
    ]

    subprocess.run(command, check=True)


def process_class(label):

    input_dir = os.path.join(DATASET_DIR, label)
    output_dir = os.path.join(PROCESSED_DIR, label)

    os.makedirs(output_dir, exist_ok=True)

    files = [
        f for f in os.listdir(input_dir)
        if f.lower().endswith(
            (".wav", ".mp3", ".m4a", ".ogg")
        )
    ]

    print(f"\n{label.upper()} FILES FOUND: {len(files)}")

    for filename in files:

        input_path = os.path.join(input_dir, filename)

        base_name = os.path.splitext(filename)[0]

        temporary_wav = os.path.join(
            output_dir,
            base_name + "_converted.wav"
        )

        try:

            print(f"Processing: {filename}")

            convert_to_wav(
                input_path,
                temporary_wav
            )

            audio, sr = librosa.load(
                temporary_wav,
                sr=SAMPLE_RATE,
                mono=True
            )

            clip_samples = SAMPLE_RATE * CLIP_DURATION
            step_samples = SAMPLE_RATE * STEP_DURATION

            clip_number = 0

            if len(audio) < clip_samples:

                clip = librosa.util.fix_length(
                    audio,
                    size=clip_samples
                )

                output_file = os.path.join(
                    output_dir,
                    f"{base_name}_{clip_number:03d}.wav"
                )

                sf.write(
                    output_file,
                    clip,
                    SAMPLE_RATE
                )

                clip_number += 1

            else:

                for start in range(
                    0,
                    len(audio) - clip_samples + 1,
                    step_samples
                ):

                    clip = audio[
                        start:start + clip_samples
                    ]

                    output_file = os.path.join(
                        output_dir,
                        f"{base_name}_{clip_number:03d}.wav"
                    )

                    sf.write(
                        output_file,
                        clip,
                        SAMPLE_RATE
                    )

                    clip_number += 1

            if os.path.exists(temporary_wav):
                os.remove(temporary_wav)

            print(
                f"{label}: {filename} -> {clip_number} clips"
            )

        except Exception as e:

            print(
                f"ERROR processing {filename}: {e}"
            )


print("================================")
print("STARTING DATASET PREPARATION")
print("================================")

process_class("ai")
process_class("real")

print("\n================================")
print("DATASET PREPARATION COMPLETED")
print("================================")
'@ | Set-Content -Encoding UTF8 .\prepare_dataset.py