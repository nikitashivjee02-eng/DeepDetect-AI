from PIL import Image
import os

folders = [
    "dataset/real",
    "dataset/ai"
]

valid_extensions = (
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp"
)

bad_files = []
good_files = []

for folder in folders:

    print()
    print("=" * 50)
    print("Checking:", folder)
    print("=" * 50)

    if not os.path.exists(folder):
        print("Folder does not exist:", folder)
        continue

    for filename in os.listdir(folder):

        filepath = os.path.join(
            folder,
            filename
        )

        if not os.path.isfile(filepath):
            continue

        if not filename.lower().endswith(valid_extensions):
            continue

        try:

            with Image.open(filepath) as image:

                image.verify()

            # Open again after verify()
            with Image.open(filepath) as image:

                image.convert("RGB")

            good_files.append(filepath)

            print("OK  :", filename)

        except Exception as e:

            bad_files.append(filepath)

            print("BAD :", filename)
            print("      ", e)


print()
print("=" * 50)
print("SUMMARY")
print("=" * 50)

print(
    "Valid images:",
    len(good_files)
)

print(
    "Bad images:",
    len(bad_files)
)

if bad_files:

    print()
    print("BAD FILES:")

    for filepath in bad_files:

        print(
            filepath
        )

else:

    print()
    print("All images are valid!")