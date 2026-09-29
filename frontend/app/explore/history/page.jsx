"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const authUrl = (path) =>
  `http://${
    typeof window === "undefined"
      ? "localhost"
      : window.location.hostname
  }:5003${path}`;

export default function HistoryPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD USER + HISTORY
  ===================================================== */

  useEffect(() => {
    async function loadHistory() {
      try {
        const meRes = await fetch(authUrl("/api/me"), {
          credentials: "include",
          cache: "no-store",
        });

        const me = await meRes.json();

        if (!meRes.ok || !me.success) {
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        setUser(me.user);
        localStorage.setItem("user", JSON.stringify(me.user));

        const historyRes = await fetch(authUrl("/api/history"), {
          credentials: "include",
          cache: "no-store",
        });

        const historyData = await historyRes.json();

        if (historyData.success) {
          setHistory(historyData.history);
        }
      } catch (error) {
        console.error("History error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [router]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function logout() {
    try {
      await fetch(authUrl("/api/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070914] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

          <p className="mt-4 text-sm text-slate-400">
            Loading History...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#070914] text-white">
      <div className="flex min-h-screen">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0b0e1a] lg:flex lg:min-h-screen lg:flex-col lg:p-5">

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3 px-2"
          >
            <Logo />

            <div>
              <p className="font-bold">
                Deep
                <span className="text-blue-500">
                  Analysis
                </span>
              </p>

              <p className="text-[10px] tracking-[3px] text-slate-500">
                AI DETECTION
              </p>
            </div>
          </Link>

          {/* MENU */}

          <p className="mt-12 px-3 text-xs uppercase tracking-widest text-slate-500">
            Menu
          </p>

          <nav className="mt-4 space-y-2">
            <Nav
              href="/dashboard"
              icon="▦"
              text="Dashboard"
            />

            <Nav
              href="/image"
              icon="▣"
              text="Image Detection"
            />

            <Nav
              href="/video"
              icon="▶"
              text="Video Detection"
            />

            <Nav
              href="/audio"
              icon="♫"
              text="Audio Detection"
            />

            <Nav
              href="/dashboard/history"
              icon="◷"
              text="History"
              active
            />
          </nav>
        </aside>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section className="flex-1">

          {/* =================================================
              TOP HEADER
              USERNAME + EMAIL + LOGOUT
          ================================================= */}

          <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-10">

            {/* LEFT SIDE */}

            <div>
              <p className="text-xs uppercase tracking-[3px] text-blue-400">
                Activity
              </p>

              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                Detection History
              </h1>
            </div>

            {/* TOP-RIGHT USER + LOGOUT */}

            <div className="flex items-center gap-3">

              {/* USERNAME + EMAIL */}

              <div className="flex items-center gap-3">

                {/* AVATAR */}

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>

                {/* USER DETAILS */}

                <div className="hidden max-w-[180px] sm:block">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.username}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* LOGOUT */}

              <button
                onClick={logout}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-400"
              >
                Logout
              </button>
            </div>
          </header>

          {/* =================================================
              HISTORY CONTENT
          ================================================= */}

          <div className="mx-auto max-w-7xl p-6 lg:p-10">

            {/* TITLE */}

            <div className="flex items-end justify-between">

              <div>
                <p className="text-xs uppercase tracking-[2px] text-slate-500">
                  Your Activity
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  All Analyses
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  View your previous AI detection results.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-500/40 hover:text-blue-400 sm:block"
              >
                ← Dashboard
              </Link>
            </div>

            {/* MOBILE DASHBOARD BUTTON */}

            <div className="mt-4 sm:hidden">
              <Link
                href="/dashboard"
                className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-300"
              >
                ← Dashboard
              </Link>
            </div>

            {/* =================================================
                HISTORY LIST
            ================================================= */}

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">

              {history.length === 0 ? (
                <div className="p-12 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                    ◷
                  </div>

                  <p className="mt-5 text-lg font-semibold">
                    No detection history
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Upload an image, video, or audio file
                    to start analyzing.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <HistoryRow
                    key={item.id}
                    item={item}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   LOGO
============================================================ */

function Logo() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 font-bold">
      D
    </div>
  );
}

/* ============================================================
   NAVIGATION
============================================================ */

function Nav({
  href,
  icon,
  text,
  active,
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
        active
          ? "bg-blue-600/15 text-blue-400"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span>{icon}</span>
      {text}
    </Link>
  );
}

/* ============================================================
   HISTORY ROW
============================================================ */

function HistoryRow({ item }) {
  const prediction =
    item.prediction?.toLowerCase() || "";

  const isAI = prediction.includes("ai");

  const detectionType =
    item.detection_type?.toLowerCase() || "";

  let icon = "▣";

  if (detectionType.includes("video")) {
    icon = "▶";
  }

  if (detectionType.includes("audio")) {
    icon = "♫";
  }

  if (detectionType.includes("image")) {
    icon = "▣";
  }

  return (
    <div className="flex flex-col gap-4 border-b border-white/10 p-5 last:border-0 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">

      {/* FILE */}

      <div className="flex min-w-0 items-center gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm text-slate-300">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="truncate text-sm font-medium text-white">
            {item.filename || "Unnamed file"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {item.detection_type || "Unknown"}{" "}
            ·{" "}
            {new Date(item.created_at).toLocaleString()}
          </p>

        </div>
      </div>

      {/* RESULT */}

      <div className="flex items-center gap-5 sm:justify-end">

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isAI
              ? "bg-red-500/10 text-red-400"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {item.prediction}
        </span>

        <div className="min-w-[60px] text-right">

          <p className="text-sm font-semibold text-white">
            {Number(item.confidence).toFixed(1)}%
          </p>

          <p className="text-[8px] uppercase tracking-wider text-slate-600">
            Confidence
          </p>

        </div>
      </div>
    </div>
  );
}