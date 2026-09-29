"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AudioDetectionPage() {
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

    const valid =
      selected.type.startsWith("audio/") ||
      /\.(mp3|wav|m4a|flac|ogg|aac|webm)$/i.test(
        selected.name
      );

    if (!valid) {
      setError("Please select a valid audio file.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
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

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleDetect = async () => {
    if (!file) {
      setError("Please select an audio file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Audio detection
      const formData = new FormData();
      formData.append("file", file, file.name);

      let response;

      try {
        response = await fetch(
          "http://127.0.0.1:5001/api/audio",
          {
            method: "POST",
            body: formData,
            mode: "cors",
          }
        );
      } catch {
        throw new Error(
          "Cannot connect to the Audio Detection Server on port 5001. Make sure the Flask audio server is running."
        );
      }

      const text = await response.text();

      if (!text.trim()) {
        throw new Error(
          "Audio server returned an empty response."
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Audio server returned an invalid response. HTTP status: ${response.status}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            `Audio detection failed. HTTP status: ${response.status}`
        );
      }

      const detection = data.result;

      if (!detection) {
        throw new Error(
          "Invalid response from audio detection server."
        );
      }

      const label = detection.label || "UNKNOWN";

      const confidence =
        Number(detection.confidence) || 0;

      const realProbability =
        Number(detection.real_probability) || 0;

      const aiProbability =
        Number(detection.ai_probability) || 0;

      setResult({
        label,
        confidence,
        realProbability,
        aiProbability,
      });

      // Save history
      const host =
        typeof window !== "undefined"
          ? window.location.hostname
          : "127.0.0.1";

      const historyResponse = await fetch(
        `http://${host}:5003/api/history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            filename: file.name,
            detection_type: "audio",
            prediction: label,
            confidence,
            real_probability: realProbability,
            ai_probability: aiProbability,
          }),
        }
      );

      const historyText = await historyResponse.text();

      if (!historyText.trim()) {
        throw new Error(
          "History server returned an empty response."
        );
      }

      let historyData;

      try {
        historyData = JSON.parse(historyText);
      } catch {
        throw new Error(
          `History server returned an invalid response. HTTP status: ${historyResponse.status}`
        );
      }

      if (!historyResponse.ok || !historyData.success) {
        throw new Error(
          historyData.message ||
            historyData.error ||
            `Audio history could not be saved. HTTP status: ${historyResponse.status}`
        );
      }
    } catch (err) {
      console.error(
        "Audio detection/history error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete audio detection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#060914] text-white">

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#060914]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Logo />

            <div>
              <p className="text-lg font-bold">
                Deep
                <span className="text-blue-400">
                  Analysis
                </span>
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

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
            🎧
          </div>

          <div className="mt-6 inline-flex rounded-full bg-blue-500/10 px-4 py-2 text-xs text-blue-300">
            AUDIO DETECTION
          </div>

          <h1 className="mt-5 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Detect{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              AI-Generated Audio
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Upload an audio file and DeepAnalysis will analyze
            whether the content is real or AI-generated.
          </p>

        </div>

        {/* Upload Card */}
        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-8">

          {!file ? (
            <UploadBox onChange={handleFileChange} />
          ) : (
            <div>

              {/* Preview */}
              <div className="rounded-2xl border border-white/10 bg-[#090d1a] p-6 sm:p-8">

                <div className="flex flex-col items-center">

                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/10 text-5xl">
                    🎧
                  </div>

                  <p className="mt-5 text-xs uppercase tracking-[0.18em] text-blue-400">
                    Audio Ready
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Preview Your Audio
                  </h2>

                  <audio
                    src={preview || undefined}
                    controls
                    className="mt-7 w-full max-w-2xl"
                  />

                </div>

              </div>

              {/* File Info */}
              <div className="mt-4 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                    🎵
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                      {" • "}
                      {file.type || "Audio file"}
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

              {/* Analyze */}
              <button
                onClick={handleDetect}
                disabled={loading}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-semibold disabled:opacity-60"
              >
                {loading
                  ? "Analyzing Audio..."
                  : "Analyze Audio"}
              </button>

            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              ⚠ {error}
            </div>
          )}

        </div>

        {/* Result */}
        {result && <ResultCard result={result} />}

        {/* Information */}
        <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">

          <InfoCard
            icon="⚡"
            title="Audio Analysis"
            text="Analyze uploaded audio using the DeepAnalysis detection system."
          />

          <InfoCard
            icon="🎯"
            title="Confidence Score"
            text="View the confidence level associated with the detection result."
          />

          <InfoCard
            icon="🔍"
            title="Detailed Result"
            text="Compare real and AI probabilities after analysis."
          />

        </div>

      </section>

      <footer className="border-t border-white/10 py-7 text-center text-sm text-slate-600">
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

/* Upload */

function UploadBox({ onChange }) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/10 px-6 py-16 hover:border-blue-500/50">

      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-4xl">
        🎵
      </div>

      <h2 className="mt-6 text-xl font-semibold">
        Upload an Audio File
      </h2>

      <p className="mt-2 max-w-md text-center text-sm text-slate-500">
        Select an audio file from your computer and let
        DeepAnalysis inspect its content.
      </p>

      <span className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-3 font-semibold">
        Choose Audio
      </span>

      <p className="mt-4 text-xs text-slate-600">
        MP3 • WAV • M4A • FLAC • OGG • AAC
      </p>

      <input
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg,.aac,.webm"
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
    <div className="mx-auto mt-8 max-w-5xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8">

      <div className="text-center">

        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Detection Result
        </p>

        <div
          className={`mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl ${
            isAI
              ? "bg-red-500/10 text-red-400"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {isAI ? "⚠" : "✓"}
        </div>

        <h2
          className={`mt-5 text-3xl font-bold ${
            isAI
              ? "text-red-400"
              : "text-emerald-400"
          }`}
        >
          {result.label}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Analysis completed successfully
        </p>

      </div>

      <Progress
        title="Detection Confidence"
        value={result.confidence}
      />

      <div className="mt-5 grid gap-5 md:grid-cols-2">

        <Probability
          title="Real Probability"
          value={result.realProbability}
          ai={false}
        />

        <Probability
          title="AI Probability"
          value={result.aiProbability}
          ai
        />

      </div>

    </div>
  );
}

/* Progress */

function Progress({
  title,
  value,
}) {
  const width = Math.min(
    100,
    Math.max(0, value)
  );

  return (
    <div className="mt-9 rounded-2xl border border-white/10 bg-[#090d1a] p-5">

      <div className="mb-3 flex justify-between">

        <span className="text-sm text-slate-300">
          {title}
        </span>

        <span className="font-bold text-blue-400">
          {value.toFixed(2)}%
        </span>

      </div>

      <div className="h-3 rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{
            width: `${width}%`,
          }}
        />

      </div>

    </div>
  );
}

/* Probability */

function Probability({
  title,
  value,
  ai,
}) {
  const width = Math.min(
    100,
    Math.max(0, value)
  );

  return (
    <div
      className={`rounded-2xl p-5 ${
        ai
          ? "border border-red-500/10 bg-red-500/[0.04]"
          : "border border-emerald-500/10 bg-emerald-500/[0.04]"
      }`}
    >

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              ai
                ? "bg-red-500/10"
                : "bg-emerald-500/10"
            }`}
          >
            {ai ? "AI" : "✓"}
          </div>

          <span className="text-sm font-semibold">
            {title}
          </span>

        </div>

        <span
          className={`font-bold ${
            ai
              ? "text-red-400"
              : "text-emerald-400"
          }`}
        >
          {value.toFixed(2)}%
        </span>

      </div>

      <div className="mt-5 h-2 rounded-full bg-white/5">

        <div
          className={`h-full rounded-full ${
            ai
              ? "bg-red-500"
              : "bg-emerald-500"
          }`}
          style={{
            width: `${width}%`,
          }}
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}