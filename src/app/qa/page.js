"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { interviewQA } from "@/data/interview-qa";

const ALL_TAGS = (() => {
  const tags = new Set();
  [...interviewQA.conceptual, ...interviewQA.scenarioBased, ...interviewQA.outputBased].forEach((q) =>
    q.tags?.forEach((t) => tags.add(t))
  );
  return Array.from(tags).sort();
})();

function QuestionCard({ item, index }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${revealed ? "var(--border)" : "var(--border-subtle)"}`,
        animation: `fadeInUp 0.35s ease forwards`,
        animationDelay: `${index * 0.03}s`,
        opacity: 0,
      }}
    >
      {/* Question */}
      <button
        onClick={() => setRevealed(!revealed)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 transition-colors hover:bg-[var(--bg-hover)]"
      >
        <span
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5"
          style={{
            background: "var(--accent-glow)",
            color: "var(--accent)",
          }}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            {item.question}
          </h3>
          {item.tags && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--bg-hover)",
                    color: "var(--text-muted)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <svg
          className="w-4 h-4 shrink-0 mt-1 transition-transform"
          style={{
            color: "var(--text-muted)",
            transform: revealed ? "rotate(180deg)" : "rotate(0deg)",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Answer */}
      {revealed && (
        <div
          className="px-5 pb-5 border-t"
          style={{
            borderColor: "var(--border-subtle)",
            animation: "fadeInUp 0.25s ease",
          }}
        >
          <div
            className="mt-4 text-sm leading-relaxed whitespace-pre-line rounded-lg p-4"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          >
            {item.answer}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QAPage() {
  const [activeTab, setActiveTab] = useState("conceptual");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  const questions =
    activeTab === "conceptual"
      ? interviewQA.conceptual
      : activeTab === "scenario"
      ? interviewQA.scenarioBased
      : interviewQA.outputBased;

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        !search ||
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.answer.toLowerCase().includes(search.toLowerCase());
      const matchesTag =
        !selectedTag || q.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [questions, search, selectedTag]);

  const totalQuestions =
    interviewQA.conceptual.length + interviewQA.scenarioBased.length + interviewQA.outputBased.length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div
        className="sticky top-14 lg:top-0 z-40 border-b backdrop-blur-xl"
        style={{
          background: "rgba(8, 8, 10, 0.85)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs flex items-center gap-1 mr-3"
              style={{ color: "var(--text-muted)" }}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Home
            </Link>
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
              style={{
                background: "rgba(168, 85, 247, 0.15)",
                color: "#a855f7",
              }}
            >
              ?
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Interview Q&A
            </span>
          </div>
          <span
            className="text-xs hidden sm:inline"
            style={{ color: "var(--text-muted)" }}
          >
            {totalQuestions} questions
          </span>
        </div>

        {/* Tabs */}
        <div className="flex px-4 sm:px-8 pb-0 gap-1">
          {[
            {
              key: "conceptual",
              label: "Conceptual",
              count: interviewQA.conceptual.length,
              icon: "💡",
            },
            {
              key: "scenario",
              label: "Scenario-Based",
              count: interviewQA.scenarioBased.length,
              icon: "🛠️",
            },
            {
              key: "output",
              label: "Output-Based",
              count: interviewQA.outputBased.length,
              icon: "🧩",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearch("");
                setSelectedTag(null);
              }}
              className="shrink-0 px-4 py-2.5 text-xs font-medium transition-colors border-b-2"
              style={{
                color:
                  activeTab === tab.key ? "#a855f7" : "var(--text-muted)",
                borderColor:
                  activeTab === tab.key ? "#a855f7" : "transparent",
                background:
                  activeTab === tab.key
                    ? "rgba(168, 85, 247, 0.05)"
                    : "transparent",
              }}
            >
              {tab.icon} {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* Description */}
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl mb-2"
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              color: "var(--text-primary)",
            }}
          >
            {activeTab === "conceptual"
              ? "Conceptual Questions"
              : activeTab === "scenario"
              ? "Scenario-Based Questions"
              : "Output-Based Questions"}
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {activeTab === "conceptual"
              ? "Theory and knowledge questions — the fundamentals every senior frontend developer should be able to explain clearly."
              : activeTab === "scenario"
              ? "Practical problem-solving questions — how would you handle real-world challenges in production? Think out loud and show your decision-making."
              : "Tricky code output questions — predict what the code will print and explain why. Tests your understanding of JavaScript quirks and gotchas."}
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Tag Filter */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => setSelectedTag(null)}
            className="text-[11px] font-medium px-3 py-1 rounded-full transition-colors"
            style={{
              background: !selectedTag
                ? "rgba(168, 85, 247, 0.15)"
                : "var(--bg-hover)",
              color: !selectedTag ? "#a855f7" : "var(--text-muted)",
              border: `1px solid ${!selectedTag ? "rgba(168, 85, 247, 0.3)" : "var(--border-subtle)"}`,
            }}
          >
            All
          </button>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTag(selectedTag === tag ? null : tag)
              }
              className="text-[11px] font-medium px-3 py-1 rounded-full transition-colors"
              style={{
                background:
                  selectedTag === tag
                    ? "rgba(168, 85, 247, 0.15)"
                    : "var(--bg-hover)",
                color:
                  selectedTag === tag ? "#a855f7" : "var(--text-muted)",
                border: `1px solid ${selectedTag === tag ? "rgba(168, 85, 247, 0.3)" : "var(--border-subtle)"}`,
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div
          className="text-xs mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Showing {filtered.length} of {questions.length} questions
          {selectedTag && (
            <span>
              {" "}
              in <strong style={{ color: "#a855f7" }}>{selectedTag}</strong>
            </span>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <QuestionCard key={item.id} item={item} index={idx} />
          ))}
          {filtered.length === 0 && (
            <div
              className="text-center py-16 rounded-xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                No questions match your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
