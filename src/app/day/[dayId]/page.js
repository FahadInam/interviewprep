"use client";

import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { dayStructure, dayMeta } from "@/data/structure";
import { getTopicData } from "@/data/topics";
import { TopicPage } from "@/components/TopicPage";
import { useProgress } from "@/context/ProgressContext";
import Link from "next/link";

const dayColors = {
  1: "var(--tag-js)",
  2: "var(--tag-react)",
  3: "var(--tag-next)",
  4: "var(--tag-system)",
};

export default function DayPage({ params }) {
  const { dayId } = use(params);
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const day = parseInt(dayId);
  const meta = dayMeta[day];
  const topics = dayStructure[day] || [];
  const { isComplete, getDayProgress } = useProgress();

  // Default to first topic
  const [activeTopic, setActiveTopic] = useState(topicParam || topics[0]?.id);

  // Sync with URL changes
  useEffect(() => {
    if (topicParam) setActiveTopic(topicParam);
  }, [topicParam]);

  const topicData = getTopicData(activeTopic);

  if (!meta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: "var(--text-muted)" }}>Day not found.</p>
      </div>
    );
  }

  const topicIds = topics.map((t) => t.id);
  const currentIdx = topics.findIndex((t) => t.id === activeTopic);
  const prevTopic = currentIdx > 0 ? topics[currentIdx - 1] : null;
  const nextTopic = currentIdx < topics.length - 1 ? topics[currentIdx + 1] : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Day Header Bar */}
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
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </Link>
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
              style={{ background: `${dayColors[day]}15`, color: dayColors[day] }}
            >
              {day}
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {meta.title}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs hidden sm:inline" style={{ color: "var(--text-muted)" }}>
              {topicIds.filter((id) => isComplete(id)).length}/{topics.length} complete
            </span>
            <div className="w-16 sm:w-24 h-1 rounded-full" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  background: dayColors[day],
                  width: `${getDayProgress(topicIds)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Topic Tab Bar - Horizontal scrollable */}
        <div className="flex overflow-x-auto px-4 pb-0 gap-0.5 hide-scrollbar">
          {topics.map((t) => (
            <Link
              key={t.id}
              href={`/day/${day}?topic=${t.id}`}
              className="shrink-0 px-3.5 py-2 text-xs font-medium transition-colors border-b-2 whitespace-nowrap"
              style={{
                color: activeTopic === t.id ? dayColors[day] : "var(--text-muted)",
                borderColor: activeTopic === t.id ? dayColors[day] : "transparent",
                background: activeTopic === t.id ? `${dayColors[day]}08` : "transparent",
              }}
            >
              {isComplete(t.id) && (
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: "var(--success)" }} />
              )}
              {t.title}
            </Link>
          ))}
        </div>
      </div>

      {/* Topic Content */}
      <div className="flex-1">
        {topicData ? (
          <TopicPage key={activeTopic} topic={topicData} />
        ) : (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: "var(--text-muted)" }}>Topic data not found for "{activeTopic}".</p>
          </div>
        )}
      </div>

      {/* Prev/Next Navigation */}
      <div
        className="border-t px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {prevTopic ? (
          <Link
            href={`/day/${day}?topic=${prevTopic.id}`}
            className="flex items-center gap-2 text-xs sm:text-sm transition-colors hover:opacity-80 max-w-[40%]"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="truncate">{prevTopic.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {nextTopic ? (
          <Link
            href={`/day/${day}?topic=${nextTopic.id}`}
            className="flex items-center gap-2 text-xs sm:text-sm transition-colors hover:opacity-80 max-w-[40%]"
            style={{ color: "var(--accent)" }}
          >
            <span className="truncate">{nextTopic.title}</span>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : day < 4 ? (
          <Link
            href={`/day/${day + 1}?topic=${dayStructure[day + 1]?.[0]?.id}`}
            className="flex items-center gap-2 text-xs sm:text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            Start Day {day + 1}
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
