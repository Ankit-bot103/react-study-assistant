import React from "react";
import type { StudySessionData } from "../utils/parser";

interface SummaryTabProps {
  data: StudySessionData;
  completedConcepts: string[];
  onToggleConcept: (conceptName: string) => void;
  stats: {
    masteredCards: number;
    totalCards: number;
    quizScore: number | null;
    quizTotal: number;
  };
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  data,
  completedConcepts,
  onToggleConcept,
  stats
}) => {
  const percentConcepts = data.keyConcepts.length > 0 
    ? Math.round((completedConcepts.length / data.keyConcepts.length) * 100) 
    : 0;

  const percentCards = stats.totalCards > 0 
    ? Math.round((stats.masteredCards / stats.totalCards) * 100) 
    : 0;

  return (
    <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stats Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {/* Concept Progress */}
        <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>CONCEPTS LEARNED</span>
          <span style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
            {completedConcepts.length} / {data.keyConcepts.length}
          </span>
          <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-input)", borderRadius: "3px", overflow: "hidden", marginTop: "0.5rem" }}>
            <div style={{ width: `${percentConcepts}%`, height: "100%", backgroundColor: "var(--primary)", transition: "width 0.3s ease" }}></div>
          </div>
        </div>

        {/* Flashcard Mastery */}
        <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>CARDS MASTERED</span>
          <span style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
            {stats.masteredCards} / {stats.totalCards}
          </span>
          <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-input)", borderRadius: "3px", overflow: "hidden", marginTop: "0.5rem" }}>
            <div style={{ width: `${percentCards}%`, height: "100%", backgroundColor: "var(--success)", transition: "width 0.3s ease" }}></div>
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>QUIZ SCORE</span>
          <span style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
            {stats.quizScore !== null ? `${stats.quizScore} / ${stats.quizTotal}` : "Not Taken"}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            {stats.quizScore !== null 
              ? `High Score: ${Math.round((stats.quizScore / stats.quizTotal) * 100)}%` 
              : "Complete the quiz tab to see stats"}
          </span>
        </div>
      </div>

      {/* Main summary view */}
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <h3 style={{ fontSize: "1.35rem", marginBottom: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>📖</span> Summary Overview
        </h3>
        <p style={{ color: "var(--text-primary)", fontSize: "1rem", lineHeight: "1.65", whiteSpace: "pre-line" }}>
          {data.summary}
        </p>
      </div>

      {/* Concepts Checklist (Interactive component) */}
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.35rem", margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>✅</span> Core Learning Concepts
          </h3>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Check items as you study them
          </span>
        </div>

        {data.keyConcepts.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No key concepts found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.keyConcepts.map((item, idx) => {
              const isDone = completedConcepts.includes(item.concept);
              return (
                <div
                  key={idx}
                  className={`checklist-item ${isDone ? "completed" : ""}`}
                  onClick={() => onToggleConcept(item.concept)}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => {}} // Controlled via checklist-item click handler
                    className="checklist-checkbox"
                  />
                  <div className="checklist-content">
                    <span className="checklist-title" style={{ color: isDone ? "var(--text-secondary)" : "var(--text-primary)" }}>
                      {item.concept}
                    </span>
                    <p className="checklist-desc">{item.definition}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default SummaryTab;
