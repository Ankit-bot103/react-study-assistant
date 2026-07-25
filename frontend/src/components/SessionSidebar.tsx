import React from "react";

interface SessionHeader {
  id: string;
  topic: string;
  timestamp: number;
}

interface SessionSidebarProps {
  sessions: SessionHeader[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  isOpen,
  onClose
}) => {
  const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 99,
            backdropFilter: "blur(2px)"
          }}
          className="mobile-backdrop-only"
        />
      )}

      <div
        className={`glass-panel ${isOpen ? "open" : ""}`}
        style={{
          width: "280px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
          borderRight: "1px solid var(--border-color)",
          borderLeft: "none",
          borderTop: "none",
          borderBottom: "none",
          backgroundColor: "var(--bg-secondary)",
          flexShrink: 0,
          zIndex: 100,
          transition: "transform 0.3s ease"
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "1.25rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.4rem" }}>🧠</span>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", fontFamily: "var(--font-heading)" }}>
              StudyAI
            </span>
          </div>
          <button
            onClick={onNewSession}
            className="btn btn-secondary"
            style={{ padding: "4px 8px", fontSize: "0.85rem", borderRadius: "6px" }}
            title="Create new session"
          >
            + New
          </button>
        </div>

        {/* Sessions List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.75rem"
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", paddingLeft: "8px", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Study Sessions ({sessions.length})
          </div>

          {sortedSessions.length === 0 ? (
            <div style={{ padding: "1.5rem 8px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              No study guides saved yet. Generate one to start!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {sortedSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      onClose(); // Close mobile drawer
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "6px",
                      backgroundColor: isActive ? "var(--primary-glow)" : "transparent",
                      border: "1px solid",
                      borderColor: isActive ? "var(--primary)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    className="sidebar-session-item"
                  >
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: "0.5rem" }}>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "var(--primary)" : "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {session.topic}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        {formatDate(session.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid selecting session
                        if (confirm(`Are you sure you want to delete "${session.topic}"?`)) {
                          onDeleteSession(session.id);
                        }
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      className="delete-session-btn"
                      title="Delete study guide"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div
          style={{
            padding: "1rem",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "rgba(0, 0, 0, 0.08)",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            textAlign: "center"
          }}
        >
          <div>All sessions saved locally</div>
        </div>

        {/* Global Styles for Sidebar drawer on mobile */}
        <style>{`
          @media (max-width: 768px) {
            .glass-panel.open {
              transform: translateX(0);
            }
            .glass-panel:not(.open) {
              transform: translateX(-100%);
              position: fixed;
            }
            .glass-panel {
              position: fixed;
              top: 0;
              left: 0;
              height: 100vh !important;
            }
          }
          
          .sidebar-session-item:hover {
            background-color: var(--bg-input);
          }
          .delete-session-btn:hover {
            color: var(--error) !important;
            background-color: var(--error-glow);
          }
        `}</style>
      </div>
    </>
  );
};
export default SessionSidebar;
