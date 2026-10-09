"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

const handleLogin = async (e) => {
e.preventDefault();


setMessage("");

const cleanEmail = email.trim().toLowerCase();

if (!cleanEmail || !password) {
  setMessage("Please enter your email and password.");
  return;
}

setLoading(true);

try {
  const response = await fetch(
    "https://deepanalysis-auth.onrender.com/api/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: cleanEmail,
        password: password,
      }),
    }
  );

  const data = await response.json();

  console.log("Login status:", response.status);
  console.log("Login response:", data);

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        data.error ||
        "Invalid email or password."
    );
  }

  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }

  router.replace("/dashboard");
} catch (error) {
  console.error("LOGIN ERROR:", error);

  setMessage(
    error?.message ||
      "Unable to connect to authentication server."
  );
} finally {
  setLoading(false);
}


};

return ( <main className="min-h-screen overflow-hidden bg-[#060914] text-white">

  {/* Background Effects */}
  <div className="pointer-events-none fixed inset-0">

    <div className="absolute left-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[130px]" />

    <div className="absolute bottom-[-180px] right-[-180px] h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[130px]" />

    <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[120px]" />

  </div>


  {/* Navigation */}
  <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-10">

    <Link
      href="/"
      className="flex items-center gap-3"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold shadow-lg shadow-blue-500/20">
        D
      </div>

      <div>
        <p className="text-lg font-bold">
          Deep<span className="text-blue-400">Analysis</span>
        </p>

        <p className="text-[8px] uppercase tracking-[3px] text-slate-500">
          AI Detection
        </p>
      </div>

    </Link>


    <Link
      href="/"
      className="text-sm text-slate-400 transition hover:text-white"
    >
      ← Back to Home
    </Link>

  </nav>


  {/* Main */}
  <div className="relative z-10 flex min-h-[calc(100vh-81px)] items-center justify-center px-5 py-10">

    <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">


      {/* Left Side */}
      <div className="hidden lg:block">

        <div className="max-w-lg">

          <p className="text-xs font-semibold uppercase tracking-[4px] text-blue-400">
            AI CONTENT DETECTION
          </p>


          <h1 className="mt-5 text-5xl font-bold leading-tight">

            Detect.
            <br />

            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Analyze.
            </span>

            <br />

            Stay Ahead.

          </h1>


          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
            DeepAnalysis helps you analyze images, videos and
            audio to identify AI-generated and manipulated
            content.
          </p>


          {/* Feature Cards */}
          <div className="mt-10 space-y-4">

            <Feature
              icon="▣"
              title="Image Detection"
              description="Identify AI-generated images."
            />

            <Feature
              icon="▷"
              title="Video Detection"
              description="Analyze manipulated video content."
            />

            <Feature
              icon="♫"
              title="Audio Detection"
              description="Detect synthetic and AI-generated audio."
            />

          </div>

        </div>

      </div>


      {/* Login Card */}
      <div className="mx-auto w-full max-w-md">

        <div className="rounded-3xl border border-white/10 bg-[#0b1020]/90 p-7 shadow-2xl shadow-blue-950/30 backdrop-blur-xl sm:p-9">


          {/* Card Logo */}
          <div className="mb-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold shadow-lg shadow-blue-500/20">
              D
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Welcome Back
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to DeepAnalysis
            </p>

          </div>


          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email Address
              </label>

              <div className="relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-[#070b17] px-4 py-3.5 pl-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 disabled:opacity-60"
                />

              </div>

            </div>


            {/* Password */}
            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-300"
                >
                  Password
                </label>

              </div>


              <div className="relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                  ●
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-[#070b17] px-4 py-3.5 pl-11 pr-14 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 disabled:opacity-60"
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* Error */}
            {message && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {message}
              </div>
            )}


            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3.5 font-semibold shadow-lg shadow-blue-600/20 transition duration-300 hover:scale-[1.01] hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <span className="relative z-10">
                {loading
                  ? "Signing in..."
                  : "Login"}
              </span>

            </button>

          </form>


          {/* Divider */}
          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs text-slate-600">
              OR
            </span>

            <div className="h-px flex-1 bg-white/10" />

          </div>


          {/* Signup */}
          <div className="text-center">

            <p className="text-sm text-slate-500">
              Don't have an account?{" "}

              <Link
                href="/signup"
                className="font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Create Account
              </Link>

            </p>

          </div>

        </div>


        {/* Security Note */}
        <p className="mt-5 text-center text-xs text-slate-600">
          🔒 Your account information is securely protected.
        </p>

      </div>

    </div>

  </div>

</main>

);
}

/* =========================
FEATURE COMPONENT
========================= */

function Feature({
icon,
title,
description,
}) {
return ( <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">


  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-400">
    {icon}
  </div>

  <div>

    <p className="text-sm font-semibold text-slate-200">
      {title}
    </p>

    <p className="mt-1 text-xs text-slate-500">
      {description}
    </p>

  </div>

</div>


);
}
