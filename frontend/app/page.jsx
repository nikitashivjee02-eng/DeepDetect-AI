"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#060914] text-white">

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute right-[-180px] top-[25%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative">

        {/* ================= NAVBAR ================= */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060914]/80 backdrop-blur-xl">

          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-2xl font-bold shadow-lg shadow-blue-500/20">
                D
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Deep<span className="text-blue-400">Analysis</span>
                </h1>

                <p className="text-[9px] uppercase tracking-[3px] text-slate-500">
                  AI Detection
                </p>
              </div>

            </Link>

            {/* NAVIGATION */}
            <nav className="hidden items-center gap-2 md:flex">

              <Link
                href="/"
                className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white"
              >
                Home
              </Link>

              <Link
                href="/explore"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Explore Features
              </Link>

            </nav>

            {/* AUTH BUTTONS */}
            <div className="flex items-center gap-3">

              <Link
                href="/login"
                className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:scale-[1.02]"
              >
                Get Started
              </Link>

            </div>

          </div>

        </header>

        {/* ================= HERO ================= */}
        <section className="relative">

          <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-20">

            {/* LEFT */}
            <div>

              {/* BADGE */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                <span className="text-xs font-semibold uppercase tracking-[2px] text-blue-300">
                  AI Content Detection Platform
                </span>

              </div>

              {/* HEADING */}
              <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">

                Detect AI-Generated

                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Content with Confidence
                </span>

              </h1>

              {/* DESCRIPTION */}
              <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
                DeepAnalysis helps you analyze images, videos, and audio to
                identify AI-generated and manipulated content using intelligent
                detection technology.
              </p>

              {/* BUTTONS */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-3.5 text-sm font-semibold shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5"
                >
                  Start Detecting
                  <span className="text-lg">→</span>
                </Link>

                {/* CONNECTED EXPLORE BUTTON */}
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/5 px-7 py-3.5 text-sm font-semibold text-blue-300 transition hover:-translate-y-0.5 hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-white"
                >
                  Explore Features
                  <span className="text-lg">→</span>
                </Link>

              </div>

              {/* SUPPORTED DETECTION */}
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">

                <TrustPoint text="Image Analysis" />

                <TrustPoint text="Video Detection" />

                <TrustPoint text="Audio Analysis" />

              </div>

            </div>

            {/* ================= RIGHT VISUAL ================= */}
            <div className="relative mx-auto w-full max-w-xl">

              <div className="absolute inset-10 rounded-full bg-blue-600/20 blur-[100px]" />

              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[2px] text-blue-400">
                      DeepAnalysis
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      AI Detection System
                    </p>

                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">

                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    <span className="text-xs text-emerald-400">
                      Active
                    </span>

                  </div>

                </div>

                {/* VISUALIZATION */}
                <div className="relative flex h-64 items-center justify-center">

                  <div className="absolute h-48 w-48 rounded-full border border-blue-500/20" />

                  <div className="absolute h-36 w-36 rounded-full border border-purple-500/20" />

                  <div className="absolute h-24 w-24 rounded-full border border-cyan-500/30" />

                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold shadow-2xl shadow-blue-500/30">
                    D
                  </div>

                  {/* DETECTION */}
                  <div className="absolute left-4 top-10 rounded-xl border border-white/10 bg-[#0c1122]/90 px-3 py-2 shadow-xl backdrop-blur-xl">

                    <p className="text-[10px] text-slate-500">
                      Detection
                    </p>

                    <p className="text-xs font-semibold text-cyan-400">
                      Processing
                    </p>

                  </div>

                  {/* CONFIDENCE */}
                  <div className="absolute right-2 top-20 rounded-xl border border-white/10 bg-[#0c1122]/90 px-3 py-2 shadow-xl backdrop-blur-xl">

                    <p className="text-[10px] text-slate-500">
                      Confidence
                    </p>

                    <p className="text-xs font-semibold text-blue-400">
                      94.2%
                    </p>

                  </div>

                  {/* AI */}
                  <div className="absolute bottom-5 left-12 rounded-xl border border-white/10 bg-[#0c1122]/90 px-3 py-2 shadow-xl backdrop-blur-xl">

                    <p className="text-[10px] text-slate-500">
                      Content
                    </p>

                    <p className="text-xs font-semibold text-purple-400">
                      AI Analysis
                    </p>

                  </div>

                </div>

                {/* PREVIEW */}
                <div className="grid gap-3 sm:grid-cols-3">

                  <MiniDetection
                    icon="▣"
                    title="Image"
                    value="REAL"
                    type="real"
                  />

                  <MiniDetection
                    icon="▷"
                    title="Video"
                    value="AI"
                    type="ai"
                  />

                  <MiniDetection
                    icon="♫"
                    title="Audio"
                    value="REAL"
                    type="real"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

/* =========================================================
   TRUST POINT
========================================================= */

function TrustPoint({ text }) {
  return (
    <div className="flex items-center gap-2">

      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
        ✓
      </div>

      <span className="text-xs text-slate-500">
        {text}
      </span>

    </div>
  );
}

/* =========================================================
   MINI DETECTION
========================================================= */

function MiniDetection({
  icon,
  title,
  value,
  type,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">

      <div className="flex items-center justify-between">

        <span className="text-sm text-slate-400">
          {icon}
        </span>

        <span
          className={`text-[9px] font-bold uppercase ${
            type === "ai"
              ? "text-pink-400"
              : "text-emerald-400"
          }`}
        >
          {type}
        </span>

      </div>

      <p className="mt-2 text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>

    </div>
  );
}