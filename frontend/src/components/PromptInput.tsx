import React, { useState } from "react";

interface PromptInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  isRefine?: boolean;
}

const PRESETS = [
  "React Hooks",
  "Rust Ownership",
  "World War II Summary",
  "HTTP Protocol Basics"
];

export const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading,
  isRefine = false
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSubmit(inputValue);
    if (isRefine) {
      setInputValue(""); // Clear refinement input after submission
    }
  };

  return (
    <div className={`animate-slide-up ${isRefine ? "" : "glass-panel"}`} style={isRefine ? {} : { padding: "2rem", width: "100%", margin: "0 auto" }}>
      {!isRefine && (
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontWeight: 700 }}>
            What are we studying today?
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Paste your notes or enter any topic, and let the AI generate flashcards, summaries, and quizzes.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
          {isRefine ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Refine this study guide (e.g., 'add cards about closures', 'make the quiz harder', 'explain context hooks')"
              className="form-control"
              style={{ flex: 1, resize: "none", height: "60px", minHeight: "60px", padding: "10px" }}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          ) : (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste notes, copy a textbook page, or type a topic (e.g., 'CSS Flexbox vs Grid')..."
              className="form-control"
              style={{ flex: 1, resize: "vertical", minHeight: "100px", padding: "12px" }}
              disabled={isLoading}
              required
            />
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              alignSelf: "stretch", 
              padding: "0.5rem 1.5rem",
              borderRadius: "8px",
              minWidth: isRefine ? "100px" : "140px"
            }}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <span style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
                <span className="spinner" style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid #ffffff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }}></span>
                {isRefine ? "Refining..." : "Analyzing..."}
              </span>
            ) : (
              isRefine ? "Refine 🪄" : "Generate 🚀"
            )}
          </button>
        </div>

        {/* CSS for loading spinner in PromptInput */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        {!isRefine && (
          <div style={{ marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginRight: "0.75rem" }}>
              Quick Presets:
            </span>
            <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInputValue(preset)}
                  className="btn btn-secondary"
                  style={{
                    fontSize: "0.8rem",
                    padding: "4px 10px",
                    borderRadius: "20px"
                  }}
                  disabled={isLoading}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
export default PromptInput;
