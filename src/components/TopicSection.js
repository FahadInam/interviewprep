"use client";

import { useState } from "react";

export function TopicSection({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden my-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--bg-hover)]"
      >
        {icon && <span className="text-lg">{icon}</span>}
        <span className="flex-1 text-base font-medium" style={{ color: "var(--text-primary)" }}>
          {title}
        </span>
        <svg
          className="w-4 h-4 transition-transform shrink-0"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--border-subtle)", animation: "fadeInUp 0.25s ease" }}>
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

export function InfoBox({ type = "info", title, children }) {
  const styles = {
    info: { border: "var(--mid)", bg: "rgba(96, 165, 250, 0.06)", icon: "💡" },
    warning: { border: "var(--warning)", bg: "rgba(251, 191, 36, 0.06)", icon: "⚠️" },
    danger: { border: "var(--error)", bg: "rgba(248, 113, 113, 0.06)", icon: "🚨" },
    tip: { border: "var(--success)", bg: "rgba(74, 222, 128, 0.06)", icon: "✅" },
    pitfall: { border: "var(--senior)", bg: "rgba(244, 114, 182, 0.06)", icon: "🕳️" },
  };

  const s = styles[type] || styles.info;

  return (
    <div
      className="rounded-lg p-4 my-3 text-sm leading-relaxed"
      style={{
        background: s.bg,
        borderLeft: `3px solid ${s.border}`,
        color: "var(--text-primary)",
      }}
    >
      {title && (
        <div className="font-bold text-xs uppercase tracking-wider mb-2" style={{ color: s.border }}>
          {s.icon} {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function Concept({ title, children }) {
  return (
    <div className="mb-8">
      <h3
        className="text-xl mb-4 pb-2 border-b"
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          color: "var(--text-primary)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
