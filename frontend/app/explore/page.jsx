"use client";

import Link from "next/link";

export default function ExplorePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#060914] text-white">

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute right-[-180px] top-[20%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative">

        {/* ================= NAVBAR ================= */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060914]/80 backdrop-blur-xl">

          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

            {/* Logo */}
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

            {/* Navigation */}
            <nav className="hidden items-center gap-1 md:flex">

              <Link
                href="/"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/explore"
                className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Explore
              </Link>

            </nav>

            {/* Auth */}
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
        <section className="px-6 pb-16 pt-20 lg:px-10">

          <div className="mx-auto max-w-5xl text-center">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2">

              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

              <span className="text-xs font-semibold uppercase tracking-[2px] text-blue-300">
                Explore DeepAnalysis
              </span>

            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">

              Powerful AI Detection

              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Made Simple
              </span>

            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Explore the detection capabilities of DeepAnalysis and analyze
              different types of digital content through one intelligent
              platform.
            </p>

          </div>

        </section>

        {/* ================= DETECTION FEATURES ================= */}
        <section className="px-6 pb-24 lg:px-10">

          <div className="mx-auto max-w-7xl">

            <div className="mb-10">

              <p className="text-xs font-semibold uppercase tracking-[3px] text-blue-400">
                Detection Features
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Analyze Different Types of Content
              </h2>

              <p className="mt-3 max-w-2xl text-slate-500">
                Choose the type of content you want to analyze and let
                DeepAnalysis process it through the appropriate detection
                system.
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-3">

              <DetectionCard
                number="01"
                icon="▣"
                title="Image Detection"
                description="Analyze images and identify whether the content appears real or AI-generated."
                features={[
                  "AI-generated image detection",
                  "Confidence score",
                  "Real / AI probability",
                  "Detection result",
                ]}
                href="/image"
                gradient="from-blue-500/20 to-cyan-500/5"
              />

              <DetectionCard
                number="02"
                icon="▷"
                title="Video Detection"
                description="Upload videos and analyze their content using the DeepAnalysis video detection system."
                features={[
                  "Video file analysis",
                  "AI detection",
                  "Confidence score",
                  "Detection result",
                ]}
                href="/video"
                gradient="from-purple-500/20 to-blue-500/5"
              />

              <DetectionCard
                number="03"
                icon="♫"
                title="Audio Detection"
                description="Analyze audio recordings and identify AI-generated or real audio content."
                features={[
                  "Audio file analysis",
                  "AI detection",
                  "Confidence score",
                  "Detection result",
                ]}
                href="/audio"
                gradient="from-cyan-500/20 to-purple-500/5"
              />

            </div>

          </div>

        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="border-y border-white/10 bg-white/[0.015] px-6 py-24 lg:px-10">

          <div className="mx-auto max-w-7xl">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-xs font-semibold uppercase tracking-[3px] text-purple-400">
                How It Works
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Three Simple Steps
              </h2>

              <p className="mt-4 text-slate-500">
                DeepAnalysis keeps the detection process simple and easy to
                understand.
              </p>

            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">

              <StepCard
                number="01"
                title="Upload"
                description="Select an image, video, or audio file that you want to analyze."
              />

              <StepCard
                number="02"
                title="Analyze"
                description="DeepAnalysis sends the content to the appropriate detection system for processing."
              />

              <StepCard
                number="03"
                title="View Result"
                description="Review the prediction, confidence and probability information."
              />

            </div>

          </div>

        </section>

        {/* ================= CAPABILITIES ================= */}
        <section className="px-6 py-24 lg:px-10">

          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">

            {/* Left */}
            <div>

              <p className="text-xs font-semibold uppercase tracking-[3px] text-cyan-400">
                Platform Capabilities
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                Designed for Clear and Understandable Results
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-400">
                DeepAnalysis presents detection information in a simple format
                so users can quickly understand the result of their uploaded
                content.
              </p>

              <div className="mt-8 space-y-4">

                <Capability
                  title="Confidence Information"
                  description="Understand how confident the detection system is about its prediction."
                />

                <Capability
                  title="Real / AI Probability"
                  description="View probability information associated with the detection result."
                />

                <Capability
                  title="Detection History"
                  description="Keep track of previously analyzed content through the application dashboard."
                />

              </div>

            </div>

            {/* Right Visual */}
            <div className="relative">

              <div className="absolute inset-10 rounded-full bg-purple-600/20 blur-[100px]" />

              <div className="relative rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl backdrop-blur-xl">

                <div className="flex items-center justify-between border-b border-white/10 pb-5">

                  <div>

                    <p className="text-xs uppercase tracking-[2px] text-blue-400">
                      Analysis Result
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      DeepAnalysis Detection
                    </p>

                  </div>

                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-400">
                    Complete
                  </div>

                </div>

                <div className="py-8">

                  <div className="flex items-end justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Prediction
                      </p>

                      <p className="mt-2 text-3xl font-bold text-purple-400">
                        AI Generated
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs text-slate-500">
                        Confidence
                      </p>

                      <p className="mt-1 text-2xl font-bold text-blue-400">
                        94.2%
                      </p>

                    </div>

                  </div>

                  <div className="mt-8 space-y-5">

                    <ProbabilityBar
                      label="AI Probability"
                      value="94.2%"
                      width="94%"
                      type="ai"
                    />

                    <ProbabilityBar
                      label="REAL Probability"
                      value="5.8%"
                      width="6%"
                      type="real"
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================= CTA ================= */}
        <section className="px-6 pb-24 lg:px-10">

          <div className="mx-auto max-w-5xl overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-500/5 p-10 text-center shadow-2xl sm:p-14">

            <p className="text-xs font-semibold uppercase tracking-[3px] text-blue-400">
              Start Using DeepAnalysis
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Ready to analyze your content?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Create an account and start analyzing images, videos and audio
              with DeepAnalysis.
            </p>

            <div className="mt-8">

              <Link
                href="/signup"
                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-3.5 text-sm font-semibold shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5"
              >
                Get Started

                <span className="text-lg">
                  →
                </span>

              </Link>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

/* =========================================================
   DETECTION CARD
========================================================= */

function DetectionCard({
  number,
  icon,
  title,
  description,
  features,
  href,
  gradient,
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] p-6 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-500/30"
    >

      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition group-hover:opacity-100`}
      />

      <div className="relative">

        <div className="flex items-center justify-between">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl text-blue-400">
            {icon}
          </div>

          <span className="text-xs font-bold tracking-[2px] text-slate-600">
            {number}
          </span>

        </div>

        <h3 className="mt-7 text-xl font-bold">
          {title}
        </h3>

        <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-6 space-y-3">

          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 text-xs text-slate-400"
            >

              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                ✓
              </span>

              {feature}

            </div>
          ))}

        </div>

        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">

          <span className="text-xs font-semibold text-blue-400">
            Open Detection
          </span>

          <span className="text-lg text-slate-500 transition group-hover:translate-x-1 group-hover:text-white">
            →
          </span>

        </div>

      </div>

    </Link>
  );
}

/* =========================================================
   STEP CARD
========================================================= */

function StepCard({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-7">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-bold text-blue-400">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   CAPABILITY
========================================================= */

function Capability({
  title,
  description,
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm text-blue-400">
        ✓
      </div>

      <div>

        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   PROBABILITY BAR
========================================================= */

function ProbabilityBar({
  label,
  value,
  width,
  type,
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs text-slate-500">
          {label}
        </span>

        <span
          className={`text-xs font-semibold ${
            type === "ai"
              ? "text-purple-400"
              : "text-emerald-400"
          }`}
        >
          {value}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">

        <div
          className={`h-full rounded-full ${
            type === "ai"
              ? "bg-gradient-to-r from-blue-500 to-purple-500"
              : "bg-emerald-500"
          }`}
          style={{ width }}
        />

      </div>

    </div>
  );
}