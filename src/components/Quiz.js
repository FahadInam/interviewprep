"use client";

import { useState } from "react";

export function Quiz({ questions }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrentQ((c) => c + 1);
    setSelected(null);
    setShowResult(false);
  };

  const handleReset = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
      >
        <div
          className="text-5xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--error)",
          }}
        >
          {pct}%
        </div>
        <p className="text-sm mb-1" style={{ color: "var(--text-primary)" }}>
          {score}/{questions.length} correct
        </p>
        <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          {pct >= 80
            ? "Excellent! You're interview-ready on this topic."
            : pct >= 50
            ? "Good foundation, review the missed concepts."
            : "Needs more study. Re-read the concepts above."}
        </p>
        <button
          onClick={handleReset}
          className="px-5 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
        >
          Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
          Quiz Mode
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-0.5" style={{ background: "var(--border)" }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            background: "var(--accent)",
            width: `${((currentQ + (showResult ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <div className="p-5">
        <p className="text-sm font-medium mb-5 leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {q.question}
        </p>

        {/* Options */}
        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            let borderColor = "var(--border)";
            let bg = "transparent";
            if (showResult) {
              if (idx === q.correct) {
                borderColor = "var(--success)";
                bg = "rgba(74, 222, 128, 0.06)";
              } else if (idx === selected && idx !== q.correct) {
                borderColor = "var(--error)";
                bg = "rgba(248, 113, 113, 0.06)";
              }
            } else if (idx === selected) {
              borderColor = "var(--accent)";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className="w-full text-left p-3.5 rounded-lg text-sm transition-all"
                style={{
                  border: `1px solid ${borderColor}`,
                  background: bg,
                  color: "var(--text-primary)",
                  cursor: showResult ? "default" : "pointer",
                }}
              >
                <span className="font-mono text-xs mr-2.5" style={{ color: "var(--text-muted)" }}>
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && q.explanation && (
          <div
            className="mt-4 p-4 rounded-lg text-sm leading-relaxed"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-secondary)",
              animation: "fadeInUp 0.25s ease forwards",
            }}
          >
            <span className="font-bold text-xs uppercase tracking-wider block mb-1" style={{ color: "var(--accent-dim)" }}>
              Explanation
            </span>
            {q.explanation}
          </div>
        )}

        {/* Next Button */}
        {showResult && (
          <button
            onClick={handleNext}
            className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
          >
            {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
}
