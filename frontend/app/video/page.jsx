"use client";

import Link from "next/link";
import { useState } from "react";

export default function VideoDetectionPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];

    setError("");
    setResult(null);

    if (!selected) return;

    if (!selected.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const handleDetect = async () => {
    if (!file) {
      setError("Please select a video first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Video detection
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:5000/api/video",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Video detection failed."
        );
      }

      const prediction =
        data.prediction || data.label || "UNKNOWN";

      const confidence =
        Number(data.confidence) || 0;

      const realProbability =
        Number(data.real_probability) || 0;

      const aiProbability =
        Number(data.ai_probability) || 0;

      setResult({
        label: prediction,
        confidence,
        realProbability,
        aiProbability,
      });

      // Save history
      const historyResponse = await fetch(
        "http://localhost:5003/api/history",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            detection_type: "video",
            prediction,
            confidence,
            real_probability: realProbability,
            ai_probability: aiProbability,
          }),
        }
      );

      const historyText = await historyResponse.text();

      let historyData;

      try {
        historyData = JSON.parse(historyText);
      } catch {
        throw new Error(
          `History server returned non-JSON response: ${historyText.substring(
            0,
            300
          )}`
        );
      }

      if (!historyResponse.ok || !historyData.success) {
        throw new Error(
          historyData.message ||
            "Video was analyzed, but the result could not be saved."
        );
      }
    } catch (err) {
      console.error("Video detection error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the video detection server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#060914] text-white">

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-[#060914]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <Logo />

            <div>
              <p className="text-lg font-bold">
                Deep<span className="text-blue-400">Analysis</span>
              </p>

              <p className="hidden text-[9px] uppercase tracking-[0.2em] text-slate-600 sm:block">
                AI Content Detection
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            ← Dashboard
          </Link>

        </div>
      </nav>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-6 py-10 lg:py-14">

        {/* Header */}
        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-3xl">
            🎬
          </div>

          <div className="mt-6 inline-flex rounded-full bg-purple-500/10 px-4 py-2 text-xs text-purple-300">
            VIDEO DETECTION
          </div>

          <h1 className="mt-5 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Detect{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
              AI-Generated Videos
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Upload a video and let DeepAnalysis analyze
            whether the content is real or AI-generated.
          </p>

        </div>

        {/* Upload */}
        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-8">

          {!preview ? (
            <UploadBox onChange={handleFileChange} />
          ) : (
            <div>

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-purple-400">
                    Selected Video
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Preview your video before analysis.
                  </p>
                </div>

                <span className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs text-green-400">
                  Ready
                </span>

              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">

                <video
                  src={preview}
                  controls
                  className="mx-auto max-h-[500px] w-full object-contain"
                />

              </div>

              {file && (
                <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                      🎬
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={removeFile}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-red-400 disabled:opacity-50"
                  >
                    Remove
                  </button>

                </div>
              )}

              <button
                onClick={handleDetect}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 font-semibold disabled:opacity-60"
              >
                {loading
                  ? "Analyzing Video..."
                  : "Analyze Video"}
              </button>

            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <b>!</b> {error}
            </div>
          )}

        </div>

        {/* Result */}
        {result && <ResultCard result={result} />}

        {/* Info */}
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">

          <InfoCard
            icon="🎬"
            title="Video Analysis"
            text="Analyze uploaded videos using the AI detection system."
          />

          <InfoCard
            icon="🎯"
            title="Confidence Score"
            text="View the confidence returned by the detection model."
          />

          <InfoCard
            icon="🔍"
            title="Detailed Result"
            text="Compare real and AI probability values."
          />

        </div>

      </section>

      <footer className="border-t border-white/5 py-7 text-center text-sm text-slate-600">
        © 2026 DeepAnalysis · AI Content Detection System
      </footer>

    </main>
  );
}

/* Logo */

function Logo() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-black">
      D
    </div>
  );
}

/* Upload Box */

function UploadBox({ onChange }) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/10 px-6 py-16 hover:border-purple-500/50">

      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500/10 text-4xl">
        🎬
      </div>

      <h2 className="mt-6 text-xl font-semibold">
        Upload a Video
      </h2>

      <p className="mt-2 max-w-md text-center text-sm text-slate-500">
        Select a video from your computer to begin AI content analysis.
      </p>

      <span className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 font-semibold">
        Choose Video
      </span>

      <p className="mt-4 text-xs text-slate-600">
        MP4 • AVI • MOV • MKV • WEBM
      </p>

      <input
        type="file"
        accept="video/*"
        onChange={onChange}
        className="hidden"
      />

    </label>
  );
}

/* Result */

function ResultCard({ result }) {
  const isAI = result.label.toUpperCase().includes("AI");

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8">

      <div className="text-center">

        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Detection Result
        </p>

        <div
          className={`mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold ${
            isAI
              ? "bg-red-500/10 text-red-400"
              : "bg-green-500/10 text-green-400"
          }`}
        >
          {isAI ? "AI" : "✓"}
        </div>

        <h2
          className={`mt-4 text-3xl font-bold ${
            isAI ? "text-red-400" : "text-green-400"
          }`}
        >
          {result.label}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Model confidence:{" "}
          <span className="font-semibold text-slate-300">
            {result.confidence.toFixed(2)}%
          </span>
        </p>

      </div>

      <Progress
        title="Detection Confidence"
        value={result.confidence}
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">

        <Probability
          title="Real Probability"
          value={result.realProbability}
          type="real"
        />

        <Probability
          title="AI Probability"
          value={result.aiProbability}
          type="ai"
        />

      </div>

      <div className="mt-6 rounded-2xl bg-black/10 p-4 text-center text-xs leading-6 text-slate-500">
        DeepAnalysis analyzed the uploaded video and displayed
        the prediction returned by the video detection backend.
      </div>

    </div>
  );
}

/* Progress */

function Progress({
  title,
  value,
}) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div className="mt-10">

      <div className="mb-3 flex justify-between">

        <span className="text-sm text-slate-400">
          {title}
        </span>

        <span className="text-sm font-bold text-blue-400">
          {value.toFixed(2)}%
        </span>

      </div>

      <div className="h-3 rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
          style={{ width: `${width}%` }}
        />

      </div>

    </div>
  );
}

/* Probability */

function Probability({
  title,
  value,
  type,
}) {
  const ai = type === "ai";
  const width = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`rounded-2xl p-5 ${
        ai
          ? "border border-red-500/15 bg-red-500/[0.04]"
          : "border border-green-500/15 bg-green-500/[0.04]"
      }`}
    >

      <div className="flex items-center justify-between">

        <span className="text-sm text-slate-300">
          {title}
        </span>

        <span
          className={`font-bold ${
            ai ? "text-red-400" : "text-green-400"
          }`}
        >
          {value.toFixed(2)}%
        </span>

      </div>

      <div className="mt-4 h-2 rounded-full bg-white/5">

        <div
          className={`h-full rounded-full ${
            ai ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${width}%` }}
        />

      </div>

    </div>
  );
}

/* Info Card */

function InfoCard({
  icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-600">
        {text}
      </p>

    </div>
  );
}