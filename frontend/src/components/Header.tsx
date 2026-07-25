import React from "react";

interface HeaderProps {
  topic: string;
  theme: "dark" | "light";
  toggleTheme: () => void;
  onMenuToggle: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasData: boolean;
  isMockMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  topic,
  theme,
  toggleTheme,
  onMenuToggle,
  activeTab,
  setActiveTab,
  hasData,
  isMockMode
}) => {
  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "1rem",
        marginBottom: "1.5rem"
      }}
    >
      {/* Top row: Title, theme toggles, menu */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Mobile hamburger menu */}
          <button
            onClick={onMenuToggle}
            className="btn btn-secondary mobile-menu-btn"
            style={{ padding: "8px", display: "none", alignItems: "center", justifyContent: "center" }}
            title="Toggle sidebar"
          >
            ☰
          </button>
          
          <h1 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 700, fontFamily: "var(--font-heading)" }}>
            {hasData ? topic : "Study Guide Generator"}
          </h1>

          {hasData && isMockMode && (
            <span style={{ fontSize: "0.7rem", backgroundColor: "var(--border-color)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "20px", fontWeight: "bold" }}>
              LOCAL MOCK DATA
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={toggleTheme}
            style={{
              background: "none",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              fontSize: "1.1rem",
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--bg-secondary)"
            }}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Tabs navigation row */}
      {hasData && (
        <div className="tab-list">
          <button
            onClick={() => setActiveTab("summary")}
            className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
          >
            📝 Overview & Summary
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`tab-btn ${activeTab === "flashcards" ? "active" : ""}`}
          >
            🎴 Flashcards
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
          >
            ✍️ Quiz
          </button>
        </div>
      )}

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
};
export default Header;
