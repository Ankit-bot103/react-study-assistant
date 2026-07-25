import React, { useState, useEffect } from "react";
import type { Flashcard } from "../utils/parser";

interface FlashcardsTabProps {
  cards: Flashcard[];
  onToggleMastery: (id: number) => void;
}

type FilterType = "all" | "review" | "mastered";

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  cards,
  onToggleMastery
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  // Apply filters
  const filteredCards = cards.filter((card) => {
    if (filter === "mastered") return card.isMastered;
    if (filter === "review") return !card.isMastered;
    return true;
  });

  // Adjust current index if the list changes and the index goes out of range
  useEffect(() => {
    if (currentIndex >= filteredCards.length && filteredCards.length > 0) {
      setCurrentIndex(filteredCards.length - 1);
    } else if (filteredCards.length === 0) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [filter, cards.length]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keypresses if the user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (filteredCards.length === 0) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
      } else if (e.code === "Enter") {
        e.preventDefault();
        const activeCard = filteredCards[currentIndex];
        if (activeCard) {
          onToggleMastery(activeCard.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, filteredCards, onToggleMastery]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleMasteryClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent card from flipping
    onToggleMastery(id);
  };

  const activeCard = filteredCards[currentIndex];

  return (
    <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Filtering Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "var(--bg-secondary)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          {(["all", "review", "mastered"] as FilterType[]).map((f) => {
            const count = cards.filter((c) => {
              if (f === "mastered") return c.isMastered;
              if (f === "review") return !c.isMastered;
              return true;
            }).length;

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 12px",
                  fontSize: "0.85rem",
                  border: "none",
                  background: filter === f ? "var(--bg-input)" : "transparent",
                  color: filter === f ? "var(--primary)" : "var(--text-secondary)",
                  fontWeight: filter === f ? 600 : 500,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {f === "all" && "All"}
                {f === "review" && "Needs Review"}
                {f === "mastered" && "Mastered"} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {filteredCards.length > 0 && `Card ${currentIndex + 1} of ${filteredCards.length}`}
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
          <h3>📭 No cards found</h3>
          <p style={{ marginTop: "0.5rem" }}>
            {filter === "mastered" 
              ? "You haven't mastered any flashcards yet. Study and mark them mastered!" 
              : "Amazing! You have mastered all cards under this filter."}
          </p>
        </div>
      ) : (
        <>
          {/* 3D Flashcard */}
          <div className={`flashcard-wrapper ${isFlipped ? "flipped" : ""}`} onClick={handleFlip}>
            <div className="flashcard-inner">
              {/* Front Side */}
              <div className="flashcard-front">
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "1rem" }}>
                  Question
                </span>
                <p style={{ fontSize: "1.35rem", fontWeight: 600, maxWidth: "600px" }}>
                  {activeCard?.question}
                </p>
                <div style={{ position: "absolute", bottom: "1.25rem", color: "var(--text-secondary)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>🔄</span> Click to show answer
                </div>

                {/* Mastery Indicator Pin */}
                <button
                  onClick={(e) => handleMasteryClick(e, activeCard.id)}
                  style={{
                    position: "absolute",
                    top: "1.25rem",
                    right: "1.25rem",
                    border: "1px solid var(--border-color)",
                    backgroundColor: activeCard?.isMastered ? "var(--success-glow)" : "transparent",
                    color: activeCard?.isMastered ? "var(--success)" : "var(--text-secondary)",
                    borderColor: activeCard?.isMastered ? "var(--success)" : "var(--border-color)",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                  title="Mark as mastered"
                >
                  {activeCard?.isMastered ? "✨ Mastered" : "⭐ Master"}
                </button>
              </div>

              {/* Back Side */}
              <div className="flashcard-back">
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "1rem" }}>
                  Answer
                </span>
                <p style={{ fontSize: "1.15rem", maxWidth: "600px", lineHeight: "1.6" }}>
                  {activeCard?.answer}
                </p>
                <div style={{ position: "absolute", bottom: "1.25rem", color: "var(--text-secondary)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>🔄</span> Click to show question
                </div>

                {/* Mastery Indicator Pin */}
                <button
                  onClick={(e) => handleMasteryClick(e, activeCard.id)}
                  style={{
                    position: "absolute",
                    top: "1.25rem",
                    right: "1.25rem",
                    border: "1px solid var(--border-color)",
                    backgroundColor: activeCard?.isMastered ? "var(--success-glow)" : "transparent",
                    color: activeCard?.isMastered ? "var(--success)" : "var(--text-secondary)",
                    borderColor: activeCard?.isMastered ? "var(--success)" : "var(--border-color)",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {activeCard?.isMastered ? "✨ Mastered" : "⭐ Master"}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button className="btn btn-secondary" onClick={handlePrev}>
              ⬅️ Previous
            </button>

            <button
              className="btn btn-primary"
              style={{
                backgroundColor: activeCard?.isMastered ? "var(--bg-input)" : "var(--success)",
                color: "#fff",
                borderColor: "transparent",
                boxShadow: "none"
              }}
              onClick={(e) => handleMasteryClick(e, activeCard.id)}
            >
              {activeCard?.isMastered ? "⭐ Mark Review" : "✨ Mark Mastered"}
            </button>

            <button className="btn btn-secondary" onClick={handleNext}>
              Next ➡️
            </button>
          </div>

          {/* Keyboard Helpers Footer */}
          <div
            className="glass-panel"
            style={{
              padding: "0.75rem",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              textAlign: "center",
              backgroundColor: "rgba(0, 0, 0, 0.05)"
            }}
          >
            💡 <strong>Keyboard Shortcuts:</strong> Use <code>Left/Right Arrow</code> to navigate, <code>Spacebar</code> to flip, and <code>Enter</code> to toggle mastery.
          </div>
        </>
      )}
    </div>
  );
};
export default FlashcardsTab;
