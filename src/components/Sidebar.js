"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { useAuth } from "@/context/AuthContext";
import { dayStructure } from "@/data/structure";

const dayColors = {
  1: "var(--tag-js)",
  2: "var(--tag-react)",
  3: "var(--tag-next)",
  4: "var(--tag-system)",
};

const dayLabels = {
  1: "JavaScript + Browser APIs",
  2: "React Deep Dive",
  3: "Next.js Production",
  4: "System Design & More",
};

function ProgressRing({ percent, size = 28, stroke = 2.5 }) {
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
      />
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
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getDayProgress, isComplete } = useProgress();
  const { user, signOut } = useAuth();
  const [expandedDay, setExpandedDay] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-expand based on current path
  const currentDay = pathname.match(/\/day\/(\d)/)?.[1];
  const activeDay = expandedDay ?? (currentDay ? parseInt(currentDay) : null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <Link href="/" className="block px-6 py-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <h1 className="text-xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          <span style={{ color: "var(--accent)" }}>Frontend</span>{" "}
          <span style={{ color: "var(--text-primary)" }}>Prepped</span>
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Interview Prep · 5+ YOE
        </p>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {Object.entries(dayStructure).map(([dayNum, topics]) => {
          const day = parseInt(dayNum);
          const topicIds = topics.map((t) => t.id);
          const percent = getDayProgress(topicIds);
          const isExpanded = activeDay === day;

          return (
            <div key={day} className="mb-1">
              {/* Day Header */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)]"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: `${dayColors[day]}18`,
                    color: dayColors[day],
                  }}
                >
                  {day}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    Day {day}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                    {dayLabels[day]}
                  </div>
                </div>
                <ProgressRing percent={percent} />
                <svg
                  className="w-3.5 h-3.5 shrink-0 transition-transform"
                  style={{
                    color: "var(--text-muted)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Topics */}
              {isExpanded && (
                <div className="ml-4 border-l" style={{ borderColor: "var(--border-subtle)" }}>
                  {topics.map((topic) => {
                    const href = `/day/${day}?topic=${topic.id}`;
                    const isActive =
                      pathname === `/day/${day}` &&
                      searchParams.get("topic") === topic.id;
                    const completed = isComplete(topic.id);

                    return (
                      <Link
                        key={topic.id}
                        href={href}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm transition-all hover:bg-[var(--bg-hover)]"
                        style={{
                          color: isActive ? "var(--accent)" : "var(--text-secondary)",
                          borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                          marginLeft: "-1px",
                          animation: "slideInLeft 0.2s ease forwards",
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[8px]"
                          style={{
                            borderColor: completed ? "var(--success)" : "var(--border)",
                            background: completed ? "var(--success)" : "transparent",
                            color: completed ? "var(--bg-primary)" : "transparent",
                          }}
                        >
                          {completed ? "✓" : ""}
                        </span>
                        <span className="truncate">{topic.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Interview Q&A Link */}
      <div className="px-4 py-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <Link
          href="/qa"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
          style={{
            color: pathname === "/qa" ? "#a855f7" : "var(--text-secondary)",
            background: pathname === "/qa" ? "rgba(168, 85, 247, 0.08)" : "transparent",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: "rgba(168, 85, 247, 0.15)",
              color: "#a855f7",
            }}
          >
            ?
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              Interview Q&A
            </div>
            <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
              Most Asked Questions
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
        {/* Progress */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
            <span>Total Progress</span>
            <span style={{ color: "var(--accent)" }}>
              {Object.values(dayStructure).flat().filter((t) => isComplete(t.id)).length}
              /{Object.values(dayStructure).flat().length} topics
            </span>
          </div>
          <div className="mt-2 h-1 rounded-full" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: "var(--accent)",
                width: `${
                  (Object.values(dayStructure).flat().filter((t) => isComplete(t.id)).length /
                    Object.values(dayStructure).flat().length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* User */}
        <div className="px-5 py-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
                >
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="text-[10px] font-medium px-2 py-1 rounded shrink-0 transition-colors"
                style={{ color: "var(--text-muted)", background: "var(--bg-hover)" }}
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
            >
              Sign in to save progress
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-50 lg:hidden border-b"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-subtle)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-medium" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            <span style={{ color: "var(--accent)" }}>Frontend</span>{" "}
            <span style={{ color: "var(--text-primary)" }}>Prepped</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-lg"
          style={{ color: "var(--text-primary)" }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-14 left-0 bottom-0 w-72 border-r flex flex-col z-50 lg:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-subtle)" }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-72 border-r flex-col z-50 hidden lg:flex"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-subtle)" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
