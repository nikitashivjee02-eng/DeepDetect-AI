# DeepAnalysis

Run `START_PROJECT.bat`. It starts the local SQLite authentication/web service and the supplied image, audio, and video detector services, verifies each `/api/health` endpoint, then opens `http://localhost:5003`.

The application uses the original detector endpoints: image on 5002, audio on 5001, and video on 5000. Results returned by those services are saved to the authenticated user's original SQLite history store.

The supplied archive does not contain a text or document detector; those screens explicitly state that no detector is available rather than fabricating a result. The supplied video detector loads `Vansh180/VideoMae-ffc23-deepfake-detector` through Hugging Face, so its first startup needs an internet connection to retrieve that upstream model if it is not already cached.
