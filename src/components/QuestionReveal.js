"use client";

import { useState } from "react";

export function QuestionReveal({ question, answer, followUps = [], difficulty = "mid" }) {
  const [revealed, setRevealed] = useState(false);

  const diffColors = {
    easy: "var(--success)",
    mid: "var(--warning)",
    hard: "var(--error)",
  };

  return (
    <div
      className="rounded-xl p-4 sm:p-5 my-3 transition-all"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${revealed ? "var(--border)" : "var(--border-subtle)"}`,
      }}
    >
      {/* Question */}
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            color: diffColors[difficulty],
            background: `${diffColors[difficulty]}15`,
          }}
        >
          {difficulty}
        </span>
        <h4 className="text-sm font-medium leading-relaxed" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
          {question}
        </h4>
      </div>

      {/* Answer */}
      <div className="mt-4">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "var(--bg-hover)",
              color: "var(--accent)",
              border: "1px dashed var(--border)",
            }}
          >
            Click to reveal answer
          </button>
        ) : (
          <div style={{ animation: "fadeInUp 0.3s ease forwards" }}>
            <div
              className="text-sm leading-relaxed whitespace-pre-line p-4 rounded-lg"
              style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            >
              {answer}
            </div>

            {followUps.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--accent-dim)" }}>
                  Follow-up Questions
                </h5>
                <ul className="space-y-1.5">
                  {followUps.map((fu, i) => (
                    <li
                      key={i}
                      className="text-sm pl-3 border-l-2"
                      style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
                    >
                      {fu}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setRevealed(false)}
              className="mt-3 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Hide answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
