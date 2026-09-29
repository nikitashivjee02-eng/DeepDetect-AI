
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanUsername ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5003/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: cleanUsername,
            email: cleanEmail,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Signup status:", response.status);
      console.log("Signup response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Signup failed."
        );
      }

      setSuccess(true);

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      setSuccess(false);

      setMessage(
        error?.message ||
          "Unable to connect to authentication server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060914] text-white">

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-180px] top-[-180px] h-[450px] w-[450px] rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute right-[-180px] bottom-[-180px] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/5 px-6 py-5 lg:px-12">

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-black shadow-lg shadow-blue-500/20">
            D
          </div>

          <div>
            <div className="text-lg font-bold tracking-tight">
              Deep<span className="text-blue-400">Analysis</span>
            </div>

            <div className="hidden text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:block">
              AI Content Detection
            </div>
          </div>
        </Link>

        <Link
          href="/"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500/40 hover:bg-white/5 hover:text-white"
        >
          ← Home
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-10">

        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">

          {/* LEFT SIDE */}
          <section className="hidden lg:block">

            <div className="mb-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
                Intelligent Detection Platform
              </div>

              <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight">
                Start your journey with{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  DeepAnalysis
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
                Create your account and analyze digital content
                with a modern AI-powered detection platform.
              </p>
            </div>

            <div className="space-y-4">

              <Feature
                icon="◈"
                title="Image Detection"
                description="Analyze images and identify AI-generated content."
              />

              <Feature
                icon="▶"
                title="Video Detection"
                description="Detect manipulated and synthetic video content."
              />

              <Feature
                icon="♫"
                title="Audio Detection"
                description="Analyze audio for AI-generated or manipulated content."
              />

            </div>

            {/* Small trust panel */}
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                ✓
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Secure account creation
                </p>
                <p className="text-xs text-slate-500">
                  Your authentication is handled by the DeepAnalysis server.
                </p>
              </div>
            </div>

          </section>

          {/* RIGHT SIDE - SIGNUP */}
          <section className="mx-auto w-full max-w-md">

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">

              {/* Card Header */}
              <div className="mb-7">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-black shadow-lg shadow-blue-500/20">
                  D
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Join DeepAnalysis and start detecting AI-generated content.
                </p>

              </div>

              {/* Form */}
              <form
                onSubmit={handleSignup}
                className="space-y-4"
              >

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="name"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:bg-black/30 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:bg-black/30 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
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

                    <span className="text-[11px] text-slate-600">
                      Min. 6 characters
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:bg-black/30 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-xs font-medium text-blue-400 transition hover:bg-white/5 hover:text-blue-300"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:bg-black/30 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-xs font-medium text-blue-400 transition hover:bg-white/5 hover:text-blue-300"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      success
                        ? "border-green-500/20 bg-green-500/10 text-green-400"
                        : "border-red-500/20 bg-red-500/10 text-red-400"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span>{success ? "✓" : "!"}</span>
                      <span>{message}</span>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3.5 font-semibold shadow-lg shadow-blue-900/20 transition hover:scale-[1.01] hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {loading ? "Creating account..." : "Create Account"}
                  </span>

                  {!loading && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-full" />
                  )}
                </button>

              </form>

              {/* Login */}
              <div className="mt-7 border-t border-white/10 pt-6 text-center">

                <p className="text-sm text-slate-500">
                  Already have an account?{" "}

                  <Link
                    href="/login"
                    className="font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    Login
                  </Link>
                </p>

              </div>

            </div>

            {/* Back */}
            <div className="mt-5 text-center">
              <Link
                href="/"
                className="text-sm text-slate-600 transition hover:text-slate-300"
              >
                ← Back to home
              </Link>
            </div>

          </section>

        </div>
      </div>

    </main>
  );
}

/* Feature Card */
function Feature({ icon, title, description }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:border-blue-500/20 hover:bg-white/[0.05]">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-lg text-blue-300 transition group-hover:scale-105">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}