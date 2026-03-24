"use client";

import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import { dayStructure, dayMeta } from "@/data/structure";

const dayColors = {
  1: "var(--tag-js)",
  2: "var(--tag-react)",
  3: "var(--tag-next)",
  4: "var(--tag-system)",
};

function ProgressRing({ percent, size = 56, stroke = 3.5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

export default function Home() {
  const { getDayProgress, isComplete } = useProgress();
  const allTopicIds = Object.values(dayStructure).flat().map((t) => t.id);
  const totalDone = allTopicIds.filter((id) => isComplete(id)).length;
  const totalPercent = allTopicIds.length > 0 ? Math.round((totalDone / allTopicIds.length) * 100) : 0;

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

        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
              style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
            >
              4-Day System
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              · {allTopicIds.length} Topics · 5+ YOE
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-4"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            <span style={{ color: "var(--text-primary)" }}>Frontend </span>
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent), #e2ff8a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Mastery
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            A no-gap interview preparation system for senior frontend engineers.
            Every concept taught from fundamentals to edge cases, then tested with
            real interview questions.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
            <div className="flex items-center gap-3">
              <ProgressRing percent={totalPercent} />
              <div>
                <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {totalPercent}%
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Overall Progress
                </div>
              </div>
            </div>
            <div className="h-10 w-px hidden sm:block" style={{ background: "var(--border)" }} />
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {totalDone}/{allTopicIds.length}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Topics Completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Cards */}
      <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl">
          {[1, 2, 3, 4].map((day) => {
            const meta = dayMeta[day];
            const topics = dayStructure[day];
            const topicIds = topics.map((t) => t.id);
            const percent = getDayProgress(topicIds);
            const done = topicIds.filter((id) => isComplete(id)).length;

            return (
              <Link
                key={day}
                href={`/day/${day}?topic=${topics[0].id}`}
                className="group block rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  animation: `fadeInUp 0.4s ease forwards`,
                  animationDelay: `${day * 0.08}s`,
                  opacity: 0,
                }}
              >
                {/* Day Number + Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{
                        background: `${dayColors[day]}15`,
                        color: dayColors[day],
                      }}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: dayColors[day] }}
                      >
                        Day {day}
                      </span>
                      <h2
                        className="text-xl leading-snug"
                        style={{
                          fontFamily: "var(--font-display), Georgia, serif",
                          color: "var(--text-primary)",
                        }}
                      >
                        {meta.title}
                      </h2>
                    </div>
                  </div>
                  <ProgressRing percent={percent} size={40} stroke={2.5} />
                </div>

                {/* Description */}
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {meta.subtitle}
                </p>

                {/* Topic Count + Progress */}
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {topics.length} topics · {done} completed
                  </span>
                  <span
                    className="text-xs font-medium flex items-center gap-1 transition-colors group-hover:gap-2"
                    style={{ color: "var(--accent)" }}
                  >
                    {percent === 100 ? "Review" : "Continue"}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-1 rounded-full" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ background: dayColors[day], width: `${percent}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Interview Q&A Card */}
        <Link
          href="/qa"
          className="group block rounded-2xl p-6 mt-5 max-w-5xl transition-all duration-300 hover:scale-[1.01]"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            animation: "fadeInUp 0.4s ease forwards",
            animationDelay: "0.4s",
            opacity: 0,
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{
                  background: "rgba(168, 85, 247, 0.15)",
                  color: "#a855f7",
                }}
              >
                ?
              </div>
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "#a855f7" }}
                >
                  Bonus
                </span>
                <h2
                  className="text-xl leading-snug"
                  style={{
                    fontFamily: "var(--font-display), Georgia, serif",
                    color: "var(--text-primary)",
                  }}
                >
                  Interview Q&A
                </h2>
              </div>
            </div>
          </div>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            102 most frequently asked frontend interview questions with clear, easy-to-understand answers. Conceptual, scenario-based, and output-based.
          </p>
          <span
            className="text-xs font-medium flex items-center gap-1 transition-colors group-hover:gap-2"
            style={{ color: "#a855f7" }}
          >
            Start Practicing
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        {/* Quick Start / How to Use */}
        <div
          className="max-w-5xl mt-10 rounded-2xl p-8"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
        >
          <h3
            className="text-2xl mb-4"
            style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--text-primary)" }}
          >
            How This Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Learn",
                desc: "Each topic has three explanation levels — Layman, Mid-Level, and Senior — so you understand concepts at every depth.",
              },
              {
                step: "02",
                title: "Practice",
                desc: "Real interview questions with reveal-on-click answers, follow-up questions, and coding problems with solutions.",
              },
              {
                step: "03",
                title: "Test",
                desc: "Quiz mode for each topic tests your understanding. Track progress and identify weak areas.",
              },
            ].map((item) => (
              <div key={item.step}>
                <span
                  className="text-3xl font-bold block mb-2"
                  style={{
                    fontFamily: "var(--font-display), Georgia, serif",
                    color: "var(--accent)",
                    opacity: 0.4,
                  }}
                >
                  {item.step}
                </span>
                <h4 className="text-base font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
