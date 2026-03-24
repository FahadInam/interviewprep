"use client";

import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import { dayStructure, dayMeta } from "@/data/structure";

const dayColors = {
  1: { main: "#f7df1e", glow: "rgba(247,223,30,0.12)", soft: "rgba(247,223,30,0.06)", text: "#f7df1e" },
  2: { main: "#61dafb", glow: "rgba(97,218,251,0.12)", soft: "rgba(97,218,251,0.06)", text: "#61dafb" },
  3: { main: "#ffffff", glow: "rgba(255,255,255,0.08)", soft: "rgba(255,255,255,0.04)", text: "#e8e6e3" },
  4: { main: "#ff6b6b", glow: "rgba(255,107,107,0.12)", soft: "rgba(255,107,107,0.06)", text: "#ff6b6b" },
};

const dayIcons = {
  1: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  2: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  ),
  3: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 19.5h20L12 2zm0 4l6.9 12H5.1L12 6z" />
    </svg>
  ),
  4: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M12 12h.01" />
      <path d="M17 12h.01" />
      <path d="M7 12h.01" />
      <path d="M2 10h20" />
      <path d="M2 14h20" />
      <path d="M7 6v12" />
      <path d="M17 6v12" />
    </svg>
  ),
};

function ProgressRing({ percent, size = 56, stroke = 3.5, color = "var(--accent)" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
        opacity={0.5}
      />
      {percent > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.6s ease",
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
      )}
    </svg>
  );
}

function DayCard({ day, meta, topics, percent, done }) {
  const colors = dayColors[day];
  const topicCount = topics.length;

  return (
    <Link
      key={day}
      href={`/day/${day}?topic=${topics[0].id}`}
      className="group relative block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "var(--bg-card)",
        border: `1px solid var(--border)`,
        animation: `fadeInUp 0.5s ease forwards`,
        animationDelay: `${day * 0.1}s`,
        opacity: 0,
      }}
    >
      {/* Colored top accent line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, ${colors.main}, transparent)`,
          opacity: 0.7,
        }}
      />

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 0%, ${colors.glow}, transparent 60%)`,
        }}
      />

      {/* Corner glow - always visible but subtle */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: colors.main,
          opacity: 0.03,
          filter: "blur(40px)",
        }}
      />

      <div className="relative p-5 sm:p-6">
        {/* Header: Icon + Day info + Progress Ring */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3.5">
            {/* Icon with colored background */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${colors.glow}, ${colors.soft})`,
                color: colors.main,
                border: `1px solid ${colors.main}20`,
                boxShadow: `0 0 20px ${colors.soft}`,
              }}
            >
              {dayIcons[day]}
            </div>

            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.15em] block mb-0.5"
                style={{ color: colors.text, opacity: 0.8 }}
              >
                Day {day}
              </span>
              <h2
                className="text-lg sm:text-xl font-semibold leading-snug"
                style={{
                  fontFamily: "var(--font-display), Georgia, serif",
                  color: "var(--text-primary)",
                }}
              >
                {meta.title}
              </h2>
            </div>
          </div>

          {/* Progress ring with percentage */}
          <div className="flex flex-col items-center gap-1">
            <ProgressRing
              percent={percent}
              size={44}
              stroke={3}
              color={colors.main}
            />
            {percent > 0 && (
              <span className="text-[10px] font-medium" style={{ color: colors.text }}>
                {percent}%
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p
          className="text-[13px] mb-5 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {meta.subtitle}
        </p>

        {/* Footer: Stats + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Topic count badge */}
            <span
              className="text-[11px] font-medium px-2.5 py-1 rounded-md"
              style={{
                background: "var(--bg-hover)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {topicCount} topics
            </span>
            {done > 0 && (
              <span
                className="text-[11px] font-medium px-2.5 py-1 rounded-md"
                style={{
                  background: colors.soft,
                  color: colors.text,
                  border: `1px solid ${colors.main}15`,
                }}
              >
                {done} done
              </span>
            )}
          </div>

          {/* CTA Button */}
          <span
            className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group-hover:gap-2.5"
            style={{
              color: colors.main,
              background: colors.soft,
              border: `1px solid ${colors.main}15`,
            }}
          >
            {percent === 100 ? "Review" : "Continue"}
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>

        {/* Progress Bar */}
        <div
          className="mt-4 h-[3px] rounded-full overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              background: percent > 0
                ? `linear-gradient(90deg, ${colors.main}, ${colors.main}aa)`
                : "transparent",
              width: `${Math.max(percent, 0)}%`,
              boxShadow: percent > 0 ? `0 0 8px ${colors.glow}` : "none",
            }}
          />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { getDayProgress, isComplete } = useProgress();
  const allTopicIds = Object.values(dayStructure).flat().map((t) => t.id);
  const totalDone = allTopicIds.filter((id) => isComplete(id)).length;
  const totalPercent =
    allTopicIds.length > 0
      ? Math.round((totalDone / allTopicIds.length) * 100)
      : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div
        className="relative px-4 sm:px-6 md:px-10 pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ background: "var(--accent)" }}
        />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent)",
                border: "1px solid rgba(201,247,49,0.15)",
              }}
            >
              4-Day System
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              · {allTopicIds.length} Topics · 5+ YOE
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-4"
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
            }}
          >
            <span style={{ color: "var(--text-primary)" }}>Frontend </span>
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent), #e2ff8a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Prepped
            </span>
          </h1>

          <p
            className="text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            A no-gap interview preparation system for senior frontend engineers.
            Every concept taught from fundamentals to edge cases, then tested
            with real interview questions.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
            <div className="flex items-center gap-3">
              <ProgressRing percent={totalPercent} />
              <div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {totalPercent}%
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Overall Progress
                </div>
              </div>
            </div>
            <div
              className="h-10 w-px hidden sm:block"
              style={{ background: "var(--border)" }}
            />
            <div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {totalDone}/{allTopicIds.length}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Topics Completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Cards */}
      <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          {[1, 2, 3, 4].map((day) => {
            const meta = dayMeta[day];
            const topics = dayStructure[day];
            const topicIds = topics.map((t) => t.id);
            const percent = getDayProgress(topicIds);
            const done = topicIds.filter((id) => isComplete(id)).length;

            return (
              <DayCard
                key={day}
                day={day}
                meta={meta}
                topics={topics}
                percent={percent}
                done={done}
              />
            );
          })}
        </div>

        {/* Interview Q&A Card */}
        <Link
          href="/qa"
          className="group relative block rounded-2xl overflow-hidden mt-5 w-full transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            animation: "fadeInUp 0.5s ease forwards",
            animationDelay: "0.5s",
            opacity: 0,
          }}
        >
          {/* Purple top accent */}
          <div
            className="h-[2px] w-full"
            style={{
              background: "linear-gradient(90deg, #a855f7, #6d28d9, transparent)",
              opacity: 0.7,
            }}
          />

          {/* Hover glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 30% 0%, rgba(168,85,247,0.08), transparent 60%)",
            }}
          />

          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))",
                    color: "#a855f7",
                    border: "1px solid rgba(168,85,247,0.15)",
                    boxShadow: "0 0 20px rgba(168,85,247,0.06)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.15em] block mb-0.5"
                    style={{ color: "#a855f7", opacity: 0.8 }}
                  >
                    Bonus Module
                  </span>
                  <h2
                    className="text-lg sm:text-xl font-semibold leading-snug"
                    style={{
                      fontFamily: "var(--font-display), Georgia, serif",
                      color: "var(--text-primary)",
                    }}
                  >
                    Interview Q&A
                  </h2>
                </div>
              </div>

              {/* Question count badge */}
              <span
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(168,85,247,0.08)",
                  color: "#a855f7",
                  border: "1px solid rgba(168,85,247,0.12)",
                }}
              >
                102 Qs
              </span>
            </div>

            <p
              className="text-[13px] mb-4 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Most frequently asked frontend interview questions with clear,
              easy-to-understand answers. Conceptual, scenario-based, and
              output-based.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {["Conceptual", "Scenario", "Output"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded"
                    style={{
                      background: "var(--bg-hover)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span
                className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group-hover:gap-2.5"
                style={{
                  color: "#a855f7",
                  background: "rgba(168,85,247,0.06)",
                  border: "1px solid rgba(168,85,247,0.12)",
                }}
              >
                Start Practicing
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>

        {/* Quick Start / How to Use */}
        <div
          className="w-full mt-10 rounded-2xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="h-[2px] w-full"
            style={{
              background: "linear-gradient(90deg, var(--accent), transparent)",
              opacity: 0.4,
            }}
          />
          <div className="p-6 sm:p-8">
            <h3
              className="text-2xl mb-6"
              style={{
                fontFamily: "var(--font-display), Georgia, serif",
                color: "var(--text-primary)",
              }}
            >
              How This Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: "01",
                  title: "Learn",
                  desc: "Each topic has three explanation levels \u2014 Layman, Mid-Level, and Senior \u2014 so you understand concepts at every depth.",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                    </svg>
                  ),
                },
                {
                  step: "02",
                  title: "Practice",
                  desc: "Real interview questions with reveal-on-click answers, follow-up questions, and coding problems with solutions.",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  ),
                },
                {
                  step: "03",
                  title: "Test",
                  desc: "Quiz mode for each topic tests your understanding. Track progress and identify weak areas.",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{
                        background: "var(--accent-glow)",
                        border: "1px solid rgba(201,247,49,0.1)",
                      }}
                    >
                      {item.icon}
                    </div>
                    <span
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: "var(--font-display), Georgia, serif",
                        color: "var(--accent)",
                        opacity: 0.25,
                      }}
                    >
                      {item.step}
                    </span>
                  </div>
                  <h4
                    className="text-base font-semibold mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
