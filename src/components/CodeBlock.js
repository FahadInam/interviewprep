"use client";

import { useState } from "react";

export function CodeBlock({ code, language = "javascript", title = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden my-4" style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <span className="text-xs ml-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {title || language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-2.5 py-1 rounded transition-colors"
          style={{
            color: copied ? "var(--success)" : "var(--text-muted)",
            background: "var(--bg-hover)",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <pre className="p-4 sm:p-5 overflow-x-auto text-[13px] sm:text-sm leading-6 sm:leading-7" style={{ color: "var(--text-primary)" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function CollapsibleCode({ code, language = "javascript", title = "Solution" }) {
  const [show, setShow] = useState(false);

  return (
    <div className="my-4">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        style={{
          color: "var(--accent)",
          background: "var(--accent-glow)",
        }}
      >
        <svg
          className="w-3.5 h-3.5 transition-transform"
          style={{ transform: show ? "rotate(90deg)" : "rotate(0deg)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {show ? "Hide" : "Show"} {title}
      </button>
      {show && <CodeBlock code={code} language={language} title={title} />}
    </div>
  );
}
