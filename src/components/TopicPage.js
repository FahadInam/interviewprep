"use client";

import { useProgress } from "@/context/ProgressContext";
import { ExplanationTabs } from "./ExplanationTabs";
import { CodeBlock, CollapsibleCode } from "./CodeBlock";
import { QuestionReveal } from "./QuestionReveal";
import { Quiz } from "./Quiz";
import { TopicSection, InfoBox, Concept } from "./TopicSection";

export function TopicPage({ topic }) {
  const { isComplete, markComplete, markIncomplete } = useProgress();
  const completed = isComplete(topic.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10" style={{ animation: "fadeInUp 0.35s ease forwards" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{topic.icon}</span>
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              background: `${topic.tagColor || "var(--accent)"}15`,
              color: topic.tagColor || "var(--accent)",
            }}
          >
            {topic.tag}
          </span>
        </div>
        <h1
          className="text-2xl sm:text-3xl md:text-4xl mb-2"
          style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--text-primary)" }}
        >
          {topic.title}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {topic.subtitle}
        </p>
      </div>

      {/* Concepts */}
      {topic.concepts &&
        topic.concepts.map((concept, idx) => (
          <Concept key={idx} title={concept.title}>
            {/* Explanation Tabs */}
            {concept.explanations && <ExplanationTabs explanations={concept.explanations} />}

            {/* Real World Usage */}
            {concept.realWorld && (
              <InfoBox type="tip" title="Real-World Usage">
                {concept.realWorld}
              </InfoBox>
            )}

            {/* When to Use / Not Use */}
            {concept.whenToUse && (
              <InfoBox type="info" title="When to Use">
                {concept.whenToUse}
              </InfoBox>
            )}
            {concept.whenNotToUse && (
              <InfoBox type="warning" title="When NOT to Use">
                {concept.whenNotToUse}
              </InfoBox>
            )}

            {/* Pitfalls */}
            {concept.pitfalls && (
              <InfoBox type="pitfall" title="Common Pitfalls">
                {concept.pitfalls}
              </InfoBox>
            )}

            {/* Code Examples */}
            {concept.codeExamples &&
              concept.codeExamples.map((ex, i) => (
                <CodeBlock key={i} code={ex.code} title={ex.title} />
              ))}
          </Concept>
        ))}

      {/* Interview Questions */}
      {topic.interviewQuestions && topic.interviewQuestions.length > 0 && (
        <TopicSection title="Interview Questions" icon="🎯" defaultOpen={true}>
          {topic.interviewQuestions.map((q, idx) => (
            <QuestionReveal
              key={idx}
              question={q.question}
              answer={q.answer}
              followUps={q.followUps}
              difficulty={q.difficulty}
            />
          ))}
        </TopicSection>
      )}

      {/* Coding Problems */}
      {topic.codingProblems && topic.codingProblems.length > 0 && (
        <TopicSection title="Coding Problems" icon="💻">
          {topic.codingProblems.map((prob, idx) => (
            <div
              key={idx}
              className="mb-6 pb-6 border-b last:border-0"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded"
                  style={{
                    color:
                      prob.difficulty === "easy"
                        ? "var(--success)"
                        : prob.difficulty === "hard"
                        ? "var(--error)"
                        : "var(--warning)",
                    background:
                      prob.difficulty === "easy"
                        ? "rgba(74, 222, 128, 0.12)"
                        : prob.difficulty === "hard"
                        ? "rgba(248, 113, 113, 0.12)"
                        : "rgba(251, 191, 36, 0.12)",
                  }}
                >
                  {prob.difficulty}
                </span>
                <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {prob.title}
                </h4>
              </div>
              <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {prob.description}
              </p>
              <CollapsibleCode code={prob.solution} title={prob.title + " — Solution"} />
              {prob.explanation && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {prob.explanation}
                </p>
              )}
            </div>
          ))}
        </TopicSection>
      )}

      {/* Quiz */}
      {topic.quiz && topic.quiz.length > 0 && (
        <TopicSection title="Test Your Knowledge" icon="🧠">
          <Quiz questions={topic.quiz} />
        </TopicSection>
      )}

      {/* Mark Complete */}
      <div className="mt-10 flex items-center justify-center">
        <button
          onClick={() => (completed ? markIncomplete(topic.id) : markComplete(topic.id))}
          className="px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
          style={{
            background: completed ? "var(--bg-hover)" : "var(--accent)",
            color: completed ? "var(--text-secondary)" : "var(--bg-primary)",
            boxShadow: completed ? "none" : "0 0 30px var(--accent-glow)",
          }}
        >
          {completed ? "✓ Completed — Click to Undo" : "Mark as Complete"}
        </button>
      </div>
    </div>
  );
}
