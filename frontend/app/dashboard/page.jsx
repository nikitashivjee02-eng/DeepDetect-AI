"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ============================================================
   AUTH SERVER
============================================================ */

const authUrl = (path) => {
  return `https://deepanalysis-auth.onrender.com${path}`;
};


/* ============================================================
   DASHBOARD PAGE
============================================================ */

export default function DashboardPage() {

  const router = useRouter();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);


  /* ==========================================================
     LOAD DASHBOARD DATA
  ========================================================== */

  useEffect(() => {

    let mounted = true;

    async function loadDashboard() {

      try {

        /* ====================================================
           CURRENT USER
        ==================================================== */

        const meRes = await fetch(
          authUrl("/api/me"),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const me = await meRes.json();

        console.log("Current user:", me);


        /* ====================================================
           LOGIN CHECK
        ==================================================== */

        if (!meRes.ok || !me.success) {

          localStorage.removeItem("user");

          router.replace("/login");

          return;
        }


        /* ====================================================
           STOP IF COMPONENT UNMOUNTED
        ==================================================== */

        if (!mounted) {
          return;
        }


        /* ====================================================
           SAVE USER
        ==================================================== */

        setUser(me.user);

        localStorage.setItem(
          "user",
          JSON.stringify(me.user)
        );


        /* ====================================================
           GET STATS
        ==================================================== */

        const statsRes = await fetch(
          authUrl("/api/stats"),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );


        const statsData = await statsRes.json();

        console.log(
          "Stats response:",
          statsData
        );


        if (
          mounted &&
          statsRes.ok &&
          statsData.success
        ) {

          setStats(statsData.stats);

        }


        /* ====================================================
           GET HISTORY
        ==================================================== */

        const historyRes = await fetch(
          authUrl("/api/history"),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );


        const historyData = await historyRes.json();

        console.log(
          "History response:",
          historyData
        );


        if (
          mounted &&
          historyRes.ok &&
          historyData.success
        ) {

          setHistory(
            Array.isArray(historyData.history)
              ? historyData.history
              : []
          );

        }

      } catch (error) {

        console.error(
          "Dashboard error:",
          error
        );

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }


    loadDashboard();


    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {

      mounted = false;

    };

  }, [router]);


  /* ==========================================================
     LOGOUT
  ========================================================== */

  async function logout() {

    try {

      await fetch(
        authUrl("/api/logout"),
        {
          method: "POST",
          credentials: "include",
        }
      );

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    } finally {

      localStorage.removeItem("user");

      router.replace("/login");

    }

  }


  /* ==========================================================
     LOADING SCREEN
  ========================================================== */

  if (loading) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070914] text-white">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

          <p className="mt-4 text-sm text-slate-400">
            Loading DeepAnalysis...
          </p>

        </div>

      </main>
    );

  }


  /* ==========================================================
     NO USER
  ========================================================== */

  if (!user) {

    return null;

  }


  /* ==========================================================
     MAIN DASHBOARD
  ========================================================== */

  return (

    <main className="min-h-screen bg-[#070914] text-white">

      <div className="flex min-h-screen">


        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0b0e1a] lg:flex lg:min-h-screen lg:flex-col lg:p-5">


          {/* =================================================
              LOGO
          ================================================= */}

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


          {/* =================================================
              MENU
          ================================================= */}

          <p className="mt-12 px-3 text-xs uppercase tracking-widest text-slate-500">
            Menu
          </p>


          <nav className="mt-4 space-y-2">

            <Nav
              href="/dashboard"
              icon="▦"
              text="Dashboard"
              active
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
            />

          </nav>

        </aside>


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <section className="flex-1">


          {/* =================================================
              HEADER
          ================================================= */}

          <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-10">


            {/* =================================================
                HEADER LEFT
            ================================================= */}

            <div>

              <p className="text-xs uppercase tracking-[3px] text-blue-400">
                Dashboard
              </p>

              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                Welcome back, {user.username}
              </h1>

            </div>


            {/* =================================================
                HEADER RIGHT
            ================================================= */}

            <div className="flex items-center gap-3">


              {/* ===============================================
                  USER
              =============================================== */}

              <div className="hidden items-center gap-3 sm:flex">


                {/* AVATAR */}

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold">

                  {user.username
                    ?.charAt(0)
                    ?.toUpperCase()}

                </div>


                {/* USER DETAILS */}

                <div className="max-w-[170px]">

                  <p className="truncate text-sm font-semibold text-white">
                    {user.username}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user.email}
                  </p>

                </div>

              </div>


              {/* ===============================================
                  LOGOUT
              =============================================== */}

              <button
                onClick={logout}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-400"
              >
                Logout
              </button>

            </div>

          </header>


          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="mx-auto max-w-7xl p-6 lg:p-10">


            {/* =================================================
                HERO
            ================================================= */}

            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-purple-600/10 p-7">

              <p className="text-sm text-blue-400">
                AI CONTENT ANALYSIS
              </p>

              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Detect AI-generated content
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">

                Upload images, videos, or audio and analyze
                whether the content is real or AI-generated.

              </p>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


              <Stat
                title="Total Analyses"
                value={
                  stats?.totalAnalyses ?? 0
                }
              />


              <Stat
                title="Real Content"
                value={
                  stats?.realContent ?? 0
                }
                color="text-emerald-400"
              />


              <Stat
                title="AI Content"
                value={
                  stats?.aiContent ?? 0
                }
                color="text-red-400"
              />


              <Stat
                title="Confidence"
                value={`${Number(
                  stats?.averageConfidence ?? 0
                ).toFixed(1)}%`}
                color="text-blue-400"
              />

            </div>


            {/* =================================================
                DETECTION TOOLS
            ================================================= */}

            <section className="mt-12">


              <p className="text-xs uppercase tracking-[2px] text-slate-500">
                Analysis Tools
              </p>


              <h2 className="mt-2 text-2xl font-bold">
                Choose Detection Type
              </h2>


              <div className="mt-6 grid gap-5 md:grid-cols-3">


                <Tool
                  href="/image"
                  icon="▣"
                  title="Image Detection"
                  description="Analyze images for AI-generated content."
                />


                <Tool
                  href="/video"
                  icon="▶"
                  title="Video Detection"
                  description="Analyze videos for deepfake content."
                />


                <Tool
                  href="/audio"
                  icon="♫"
                  title="Audio Detection"
                  description="Analyze audio for AI-generated speech."
                />

              </div>

            </section>


            {/* =================================================
                RECENT HISTORY
            ================================================= */}

            <section className="mt-12">


              {/* =================================================
                  TITLE
              ================================================= */}

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-[2px] text-slate-500">
                    Activity
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Recent Analysis
                  </h2>

                </div>


                <Link
                  href="/dashboard/history"
                  className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400 transition hover:bg-blue-500/20"
                >
                  View All →
                </Link>

              </div>


              {/* =================================================
                  HISTORY
              ================================================= */}

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">


                {history.length === 0 ? (

                  <div className="p-12 text-center">

                    <p className="text-lg font-semibold">
                      No detection history
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Upload your first file to start analyzing.
                    </p>

                  </div>

                ) : (

                  history
                    .slice(0, 5)
                    .map((item) => (

                      <HistoryRow
                        key={
                          item.id ||
                          `${item.filename}-${item.created_at}`
                        }
                        item={item}
                      />

                    ))

                )}

              </div>

            </section>

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
  active = false,
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

      <span className="w-5 text-center">
        {icon}
      </span>

      {text}

    </Link>

  );

}


/* ============================================================
   STAT CARD
============================================================ */

function Stat({
  title,
  value,
  color = "text-white",
}) {

  return (

    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className={`mt-4 text-3xl font-bold ${color}`}>
        {value}
      </p>

    </div>

  );

}


/* ============================================================
   DETECTION TOOL
============================================================ */

function Tool({
  href,
  icon,
  title,
  description,
}) {

  return (

    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent p-6 transition hover:-translate-y-1 hover:border-blue-500/40"
    >


      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-xl">
        {icon}
      </div>


      <h3 className="mt-6 font-semibold">
        {title}
      </h3>


      <p className="mt-3 text-sm text-slate-500">
        {description}
      </p>


      <p className="mt-5 text-xs font-semibold uppercase text-blue-400">
        Start Detection →
      </p>

    </Link>

  );

}


/* ============================================================
   HISTORY ROW
============================================================ */

function HistoryRow({
  item,
}) {

  const prediction =
    String(
      item?.prediction || "Unknown"
    );


  const isAI =
    prediction
      .toLowerCase()
      .includes("ai");


  const confidence =
    Number(
      item?.confidence ?? 0
    );


  let formattedDate = "Unknown date";


  if (item?.created_at) {

    const date =
      new Date(item.created_at);

    if (!Number.isNaN(date.getTime())) {

      formattedDate =
        date.toLocaleString();

    }

  }


  return (

    <div className="flex flex-col gap-3 border-b border-white/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">


      {/* =====================================================
          FILE INFORMATION
      ===================================================== */}

      <div className="min-w-0">

        <p className="truncate font-medium">
          {item?.filename || "Unnamed file"}
        </p>


        <p className="mt-1 text-xs text-slate-500">

          {item?.detection_type || "Detection"}

          {" · "}

          {formattedDate}

        </p>

      </div>


      {/* =====================================================
          RESULT
      ===================================================== */}

      <div className="flex items-center gap-6">


        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isAI
              ? "bg-red-500/10 text-red-400"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >

          {prediction}

        </span>


        <span className="text-sm font-semibold">

          {confidence.toFixed(1)}%

        </span>

      </div>

    </div>

  );

}