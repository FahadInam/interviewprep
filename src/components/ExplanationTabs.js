"use client";

import { useState } from "react";

const levels = [
  { key: "layman", label: "Layman", color: "var(--layman)" },
  { key: "mid", label: "Mid-Level", color: "var(--mid)" },
  { key: "senior", label: "Senior", color: "var(--senior)" },
];

export function ExplanationTabs({ explanations }) {
  const [active, setActive] = useState("layman");

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
      {/* Tab Headers */}
      <div className="flex border-b" style={{ borderColor: "var(--border-subtle)" }}>
        {levels.map((level) => (
          <button
            key={level.key}
            onClick={() => setActive(level.key)}
            className="flex-1 py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-all relative"
            style={{
              color: active === level.key ? level.color : "var(--text-muted)",
              background: active === level.key ? `${level.color}08` : "transparent",
            }}
          >
            {level.label}
            {active === level.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: level.color }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5" key={active} style={{ animation: "fadeInUp 0.25s ease forwards" }}>
        <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
          {explanations[active]}
        </div>
      </div>
    </div>
  );
}
