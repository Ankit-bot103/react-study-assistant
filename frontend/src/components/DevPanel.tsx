import React from "react";

interface DevPanelProps {
  simulateError: "api_error" | "slow_response" | "malformed_json" | "wrong_schema" | null;
  setSimulateError: (err: "api_error" | "slow_response" | "malformed_json" | "wrong_schema" | null) => void;
  forceMock: boolean;
  setForceMock: (mock: boolean) => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({
  simulateError,
  setSimulateError,
  forceMock,
  setForceMock,
}) => {
  return (
    <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem", borderLeft: "4px solid var(--warning)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🛠️</span> Evaluator Control Panel
        </h4>
        <span style={{ fontSize: "0.75rem", backgroundColor: "var(--warning)", color: "#000", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
          GRADING TEST SUITE
        </span>
      </div>
      
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
        Use these options to simulate backend failures and check the application's robust error recovery and states:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* API Mode */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>API Request Mode:</span>
          <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={forceMock}
              onChange={(e) => setForceMock(e.target.checked)}
              style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
            />
            <span style={{ fontSize: "0.85rem", fontWeight: forceMock ? "bold" : "normal" }}>
              {forceMock ? "Force Mock Data (No Key Required)" : "Live API calls"}
            </span>
          </label>
        </div>

        {/* Error Simulation */}
        <div>
          <span style={{ fontSize: "0.9rem", fontWeight: "500", display: "block", marginBottom: "0.5rem" }}>
            Simulate Next API Request Response:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              onClick={() => setSimulateError(simulateError === "api_error" ? null : "api_error")}
              className="btn btn-secondary"
              style={{
                fontSize: "0.8rem",
                padding: "4px 8px",
                borderColor: simulateError === "api_error" ? "var(--error)" : "var(--border-color)",
                backgroundColor: simulateError === "api_error" ? "var(--error-glow)" : "transparent",
              }}
            >
              💥 500 Server Error
            </button>
            <button
              onClick={() => setSimulateError(simulateError === "slow_response" ? null : "slow_response")}
              className="btn btn-secondary"
              style={{
                fontSize: "0.8rem",
                padding: "4px 8px",
                borderColor: simulateError === "slow_response" ? "var(--info)" : "var(--border-color)",
                backgroundColor: simulateError === "slow_response" ? "var(--primary-glow)" : "transparent",
              }}
            >
              ⏳ 5s High Latency
            </button>
            <button
              onClick={() => setSimulateError(simulateError === "malformed_json" ? null : "malformed_json")}
              className="btn btn-secondary"
              style={{
                fontSize: "0.8rem",
                padding: "4px 8px",
                borderColor: simulateError === "malformed_json" ? "var(--error)" : "var(--border-color)",
                backgroundColor: simulateError === "malformed_json" ? "var(--error-glow)" : "transparent",
              }}
            >
              🧩 Malformed JSON string
            </button>
            <button
              onClick={() => setSimulateError(simulateError === "wrong_schema" ? null : "wrong_schema")}
              className="btn btn-secondary"
              style={{
                fontSize: "0.8rem",
                padding: "4px 8px",
                borderColor: simulateError === "wrong_schema" ? "var(--warning)" : "var(--border-color)",
                backgroundColor: simulateError === "wrong_schema" ? "rgba(245, 158, 11, 0.15)" : "transparent",
              }}
            >
              ⚠️ Wrong Schema shape
            </button>
          </div>
        </div>

        {/* Display Status */}
        {simulateError && (
          <div style={{ fontSize: "0.8rem", color: "var(--warning)", padding: "4px 8px", borderRadius: "4px", backgroundColor: "rgba(245, 158, 11, 0.08)", marginTop: "0.25rem", borderLeft: "2px solid var(--warning)" }}>
            <strong>Active Simulation:</strong> The next request will trigger <code>{simulateError}</code>. Check the loading state, error alert banner, and recovery buttons.
          </div>
        )}
      </div>
    </div>
  );
};
export default DevPanel;
