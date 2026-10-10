"use client";



import Link from "next/link";

import { useState } from "react";



export default function ImageDetectionPage() {

  const [file, setFile] = useState(null);

  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");



  /* SELECT IMAGE */

  const handleFileChange = (e) => {

    const selected = e.target.files?.[0];



    setError("");

    setResult(null);



    if (!selected) return;



    if (!selected.type.startsWith("image/")) {

      setError("Please select a valid image file.");

      return;

    }



    setFile(selected);

    setPreview(URL.createObjectURL(selected));

  };



  /* REMOVE IMAGE */

  const removeFile = () => {

    setFile(null);

    setPreview(null);

    setResult(null);

    setError("");

  };



  /* DETECT IMAGE */

  const handleDetect = async () => {

    if (!file) {

      setError("Please select an image first.");

      return;

    }



    setLoading(true);

    setError("");

    setResult(null);



    try {

      const formData = new FormData();

      formData.append("image", file);



      const response = await fetch(

        "https://deepanalysis-image.onrender.com/api/image",

        {

          method: "POST",

          body: formData,

        }

      );



      const text = await response.text();



      let data;



      try {

        data = JSON.parse(text);

      } catch {

        throw new Error(

          `Image API returned non-JSON response: ${text.substring(0, 300)}`

        );

      }



      if (!response.ok) {

        throw new Error(

          data.message || data.error || "Image detection failed."

        );

      }



      const prediction =

        data.prediction === "AI Generated" ? "ai" : "real";



      const confidence = Number(data.confidence);

      const realProbability = Number(data.real_probability);

      const aiProbability = Number(data.ai_probability);



      if (

        !Number.isFinite(confidence) ||

        !Number.isFinite(realProbability) ||

        !Number.isFinite(aiProbability)

      ) {

        throw new Error(

          "Image detector returned invalid result values."

        );

      }



      setResult({

        label: prediction === "ai" ? "AI GENERATED" : "REAL",

        confidence,

        realProbability,

        aiProbability,

      });



      /* SAVE HISTORY */

      try {

        const historyResponse = await fetch(

          "https://deepanalysis-auth.onrender.com/api/history",

          {

            method: "POST",

            credentials: "include",

            headers: {

              "Content-Type": "application/json",

            },

            body: JSON.stringify({

              filename: file.name,

              detection_type: "image",

              prediction,

              confidence,

              real_probability: realProbability,

              ai_probability: aiProbability,

            }),

          }

        );



        if (!historyResponse.ok) {

          const historyText = await historyResponse.text();



          let historyData;



          try {

            historyData = JSON.parse(historyText);

          } catch {

            throw new Error(

              "History server returned an invalid response."

            );

          }



          throw new Error(

            historyData.message ||

              "Could not save detection history."

          );

        }

      } catch (historyError) {

        console.error("History save error:", historyError);



        setError(

          historyError instanceof Error

            ? `Image detected successfully, but history could not be saved: ${historyError.message}`

            : "Image detected successfully, but history could not be saved."

        );

      }

    } catch (err) {

      console.error("Image detection error:", err);



      setError(

        err instanceof Error

          ? err.message

          : "Something went wrong while analyzing the image."

      );

    } finally {

      setLoading(false);

    }

  };



  return (

    <main className="min-h-screen bg-[#060914] text-white">



      {/* NAVBAR */}

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



      {/* MAIN */}

      <section className="mx-auto max-w-6xl px-6 py-10 lg:py-14">



        {/* HEADER */}

        <div className="text-center">



          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">

            🖼️

          </div>



          <div className="mt-6 inline-flex rounded-full bg-blue-500/10 px-4 py-2 text-xs text-blue-300">

            IMAGE DETECTION

          </div>



          <h1 className="mt-5 text-3xl font-bold sm:text-4xl lg:text-5xl">

            Detect{" "}

            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">

              AI-Generated Images

            </span>

          </h1>



          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">

            Upload an image and let DeepAnalysis analyze

            whether the content is real or AI-generated.

          </p>



        </div>



        {/* UPLOAD CARD */}

        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-8">



          {!preview ? (

            <UploadBox onChange={handleFileChange} />

          ) : (

            <Preview

              file={file}

              preview={preview}

              loading={loading}

              onRemove={removeFile}

              onDetect={handleDetect}

            />

          )}



          {error && (

            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">

              <b>!</b> {error}

            </div>

          )}



        </div>



        {/* RESULT */}

        {result && <ResultCard result={result} />}



        {/* INFO */}

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">



          <InfoCard

            icon="⚡"

            title="Fast Analysis"

            text="Quickly analyze your uploaded image."

          />



          <InfoCard

            icon="🎯"

            title="Confidence Score"

            text="View the model's confidence level."

          />



          <InfoCard

            icon="🔍"

            title="Detailed Result"

            text="Compare real and AI probabilities."

          />



        </div>



      </section>



      <footer className="border-t border-white/5 py-7 text-center text-sm text-slate-600">

        © 2026 DeepAnalysis · AI Content Detection System

      </footer>



    </main>

  );

}



/* LOGO */



function Logo() {

  return (

    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 font-black">

      D

    </div>

  );

}



/* UPLOAD */



function UploadBox({ onChange }) {

  return (

    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/10 px-6 py-16 text-center hover:border-blue-500/50">



      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-4xl">

        🖼️

      </div>



      <h2 className="mt-6 text-xl font-semibold">

        Upload an Image

      </h2>



      <p className="mt-2 text-sm text-slate-500">

        Select an image to begin AI content analysis.

      </p>



      <span className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 font-semibold">

        Choose Image

      </span>



      <p className="mt-4 text-xs text-slate-600">

        JPG • JPEG • PNG • WEBP

      </p>



      <input

        type="file"

        accept="image/*"

        onChange={onChange}

        className="hidden"

      />



    </label>

  );

}



/* PREVIEW */



function Preview({

  file,

  preview,

  loading,

  onRemove,

  onDetect,

}) {

  return (

    <div>



      <div className="mb-5 flex items-center justify-between">



        <div>

          <p className="text-xs uppercase tracking-wider text-blue-400">

            Selected Image

          </p>



          <p className="text-sm text-slate-500">

            Review your image before analysis.

          </p>

        </div>



        <span className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs text-green-400">

          Ready

        </span>



      </div>



      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">



        <img

          src={preview}

          alt="Selected image"

          className="mx-auto max-h-[500px] max-w-full object-contain"

        />



      </div>



      {file && (

        <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center">



          <div className="min-w-0">



            <p className="truncate text-sm font-medium">

              {file.name}

            </p>



            <p className="text-xs text-slate-600">

              {(file.size / 1024 / 1024).toFixed(2)} MB

            </p>



          </div>



          <button

            onClick={onRemove}

            disabled={loading}

            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-red-400 disabled:opacity-50"

          >

            Remove

          </button>



        </div>

      )}



      <button

        onClick={onDetect}

        disabled={loading}

        className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 font-semibold disabled:opacity-60"

      >

        {loading ? "Analyzing Image..." : "Analyze Image"}

      </button>



    </div>

  );

}



/* RESULT */



function ResultCard({ result }) {

  const ai = result.label === "AI GENERATED";



  return (

    <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8">



      <div className="text-center">



        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">

          Detection Result

        </p>



        <div

          className={`mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl ${

            ai

              ? "bg-red-500/10 text-red-400"

              : "bg-green-500/10 text-green-400"

          }`}

        >

          {ai ? "AI" : "✓"}

        </div>



        <h2

          className={`mt-4 text-3xl font-bold ${

            ai ? "text-red-400" : "text-green-400"

          }`}

        >

          {result.label}

        </h2>



        <p className="mt-2 text-sm text-slate-500">

          Confidence{" "}

          <b className="text-slate-300">

            {result.confidence.toFixed(2)}%

          </b>

        </p>



      </div>



      <Progress

        label="Detection Confidence"

        value={result.confidence}

        className="mt-10"

      />



      <div className="mt-8 grid gap-5 sm:grid-cols-2">



        <ProgressBox

          label="Real Probability"

          value={result.realProbability}

          color="green"

        />



        <ProgressBox

          label="AI Probability"

          value={result.aiProbability}

          color="red"

        />



      </div>



      <p className="mt-6 rounded-2xl bg-black/10 p-4 text-center text-xs leading-6 text-slate-500">

        DeepAnalysis analyzed the uploaded image and generated

        the prediction using the detector's confidence and

        probability values.

      </p>



    </div>

  );

}



/* PROGRESS */



function Progress({

  label,

  value,

  className = "",

}) {

  return (

    <div className={className}>



      <div className="mb-3 flex justify-between text-sm">



        <span className="text-slate-400">

          {label}

        </span>



        <b className="text-blue-400">

          {value.toFixed(2)}%

        </b>



      </div>



      <Bar value={value} />



    </div>

  );

}



/* RESULT BOX */



function ProgressBox({

  label,

  value,

  color,

}) {

  const green = color === "green";



  return (

    <div

      className={`rounded-2xl border p-5 ${

        green

          ? "border-green-500/15 bg-green-500/[0.04]"

          : "border-red-500/15 bg-red-500/[0.04]"

      }`}

    >



      <div className="flex justify-between gap-3">



        <span className="text-sm text-slate-300">

          {label}

        </span>



        <b

          className={

            green ? "text-green-400" : "text-red-400"

          }

        >

          {value.toFixed(2)}%

        </b>



      </div>



      <div className="mt-4">

        <Bar

          value={value}

          color={green ? "green" : "red"}

        />

      </div>



    </div>

  );

}



/* BAR */



function Bar({

  value,

  color = "blue",

}) {

  const colors = {

    blue: "bg-gradient-to-r from-blue-500 to-cyan-400",

    green: "bg-green-500",

    red: "bg-red-500",

  };



  return (

    <div className="h-2 overflow-hidden rounded-full bg-white/5">



      <div

        className={`h-full rounded-full ${colors[color]} transition-all duration-700`}

        style={{

          width: `${Math.min(100, Math.max(0, value))}%`,

        }}

      />



    </div>

  );

}



/* INFO CARD */



function InfoCard({

  icon,

  title,

  text,

}) {

  return (

    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">



      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

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