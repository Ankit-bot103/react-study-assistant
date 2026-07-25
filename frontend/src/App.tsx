import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import PromptInput from "./components/PromptInput";
import SessionSidebar from "./components/SessionSidebar";
import SummaryTab from "./components/SummaryTab";
import FlashcardsTab from "./components/FlashcardsTab";
import QuizTab from "./components/QuizTab";
import DevPanel from "./components/DevPanel";
import { parseAndValidateStudyData } from "./utils/parser";
import type { StudySessionData } from "./utils/parser";

interface Session {
  id: string;
  topic: string;
  timestamp: number;
  data: StudySessionData;
  completedConcepts: string[];
  masteredCards: number[]; // Array of Flashcard IDs
  quizHighScore: number | null;
  isMockMode: boolean;
}

const API_BASE = "http://localhost:5000";

function App() {
  // Theme & Layout state
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("study-assistant-theme");
    return (saved as "dark" | "light") || "dark";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("summary");

  // Study Sessions state
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem("study-assistant-sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem("study-assistant-active-id");
  });

  // Request & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type?: string; raw?: string } | null>(null);
  const [lastAction, setLastAction] = useState<{ type: "generate" | "refine"; payload: any } | null>(null);

  // Evaluator Simulation states
  const [simulateError, setSimulateError] = useState<"api_error" | "slow_response" | "malformed_json" | "wrong_schema" | null>(null);
  const [forceMock, setForceMock] = useState<boolean>(true); // Default to true so it works out-of-the-box

  // Stale request tracking
  const requestCount = useRef<number>(0);

  // Sync theme to document body
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("study-assistant-theme", theme);
  }, [theme]);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem("study-assistant-sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("study-assistant-active-id", activeSessionId);
    } else {
      localStorage.removeItem("study-assistant-active-id");
    }
  }, [activeSessionId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Handles generating new study materials
  const handleGenerate = async (topicOrText: string) => {
    const requestId = ++requestCount.current;
    setIsLoading(true);
    setError(null);
    setLastAction({ type: "generate", payload: topicOrText });

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicOrText,
          simulateError,
          forceMock
        })
      });

      // Stale response check
      if (requestId !== requestCount.current) return;

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error! Status: ${response.status}`);
      }

      // Check if the response is JSON (resilient parsing)
      const contentType = response.headers.get("content-type");
      let rawText = "";
      
      if (contentType && contentType.includes("application/json")) {
        rawText = await response.text();
      } else {
        rawText = await response.text();
      }

      // Parse and validate raw text output
      const validatedData = parseAndValidateStudyData(rawText);

      // Create new session
      const newSession: Session = {
        id: `session_${Date.now()}`,
        topic: validatedData.topic,
        timestamp: Date.now(),
        data: validatedData,
        completedConcepts: [],
        masteredCards: [],
        quizHighScore: null,
        isMockMode: forceMock
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setActiveTab("summary");
      setSimulateError(null); // Clear simulated error on success
    } catch (err: any) {
      if (requestId !== requestCount.current) return;
      console.error("[Generation Error]", err);
      setError({
        message: err.message || "An unexpected error occurred during generation.",
        type: err.name || "Error",
        raw: err.rawOutput || ""
      });
    } finally {
      if (requestId === requestCount.current) {
        setIsLoading(false);
      }
    }
  };

  // Handles refinement prompts for the active study guide
  const handleRefine = async (refinePrompt: string) => {
    if (!activeSession) return;
    const requestId = ++requestCount.current;
    setIsLoading(true);
    setError(null);
    setLastAction({ type: "refine", payload: refinePrompt });

    try {
      const response = await fetch(`${API_BASE}/api/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previousData: activeSession.data,
          prompt: refinePrompt,
          simulateError,
          forceMock
        })
      });

      // Stale response check
      if (requestId !== requestCount.current) return;

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error! Status: ${response.status}`);
      }

      const rawText = await response.text();
      const validatedData = parseAndValidateStudyData(rawText);

      // Update sessions state by merging refinement changes
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            // Keep user state for flashcards if IDs match
            const mergedFlashcards = validatedData.flashcards.map((newCard) => {
              const matchedPrevCard = s.data.flashcards.find((c) => c.id === newCard.id);
              return {
                ...newCard,
                isMastered: matchedPrevCard ? matchedPrevCard.isMastered : false
              };
            });

            // Keep checklist state for completed concepts if concepts match
            const updatedCompletedConcepts = s.completedConcepts.filter((c) =>
              validatedData.keyConcepts.some((kc) => kc.concept === c)
            );

            // Re-evaluate flashcards mastery
            const updatedMasteredCards = s.masteredCards.filter((id) =>
              validatedData.flashcards.some((c) => c.id === id)
            );

            return {
              ...s,
              topic: validatedData.topic,
              timestamp: Date.now(),
              data: {
                ...validatedData,
                flashcards: mergedFlashcards
              },
              completedConcepts: updatedCompletedConcepts,
              masteredCards: updatedMasteredCards,
              isMockMode: forceMock
            };
          }
          return s;
        })
      );

      setSimulateError(null);
    } catch (err: any) {
      if (requestId !== requestCount.current) return;
      console.error("[Refinement Error]", err);
      setError({
        message: err.message || "An unexpected error occurred during refinement.",
        type: err.name || "Error",
        raw: err.rawOutput || ""
      });
    } finally {
      if (requestId === requestCount.current) {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    if (!lastAction) return;
    if (lastAction.type === "generate") {
      handleGenerate(lastAction.payload);
    } else if (lastAction.type === "refine") {
      handleRefine(lastAction.payload);
    }
  };

  const handleBypassWithMock = () => {
    const originalForceMock = forceMock;
    setForceMock(true);
    setSimulateError(null);
    setError(null);
    
    // Defer generation call slightly to allow state to settle
    setTimeout(() => {
      if (lastAction) {
        if (lastAction.type === "generate") {
          setIsLoading(true);
          const targetTopic = lastAction.payload;
          
          // Generate mock data manually to avoid call overhead if server is offline
          fetch(`${API_BASE}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic: targetTopic, forceMock: true })
          })
            .then((r) => r.json())
            .then((data) => {
              const validated = parseAndValidateStudyData(JSON.stringify(data));
              const newSession: Session = {
                id: `session_${Date.now()}`,
                topic: validated.topic,
                timestamp: Date.now(),
                data: validated,
                completedConcepts: [],
                masteredCards: [],
                quizHighScore: null,
                isMockMode: true
              };
              setSessions((prev) => [newSession, ...prev]);
              setActiveSessionId(newSession.id);
              setActiveTab("summary");
            })
            .catch(() => {
              // Complete offline client fallback
              const fallback = {
                topic: targetTopic,
                summary: `This is a locally generated fallback session for '${targetTopic}'. The server appears to be unreachable, but the application remains functional.`,
                keyConcepts: [
                  { concept: "Offline Fallback Concept 1", definition: "A fallback card for offline exploration." },
                  { concept: "Offline Fallback Concept 2", definition: "Verify UI components safely." }
                ],
                flashcards: [
                  { id: 1, question: `What is the offline fallback topic?`, answer: `You are studying ${targetTopic} in offline mock mode.` }
                ],
                quiz: [
                  { id: 1, question: `Is the app running offline?`, options: ["Yes, fully stateful", "No", "Partially", "None of the above"], answerIndex: 0, explanation: "We loaded fallback structures to avoid crashing." }
                ]
              };
              const newSession: Session = {
                id: `session_${Date.now()}`,
                topic: fallback.topic,
                timestamp: Date.now(),
                data: fallback,
                completedConcepts: [],
                masteredCards: [],
                quizHighScore: null,
                isMockMode: true
              };
              setSessions((prev) => [newSession, ...prev]);
              setActiveSessionId(newSession.id);
              setActiveTab("summary");
            })
            .finally(() => {
              setIsLoading(false);
              setForceMock(originalForceMock);
            });
        }
      }
    }, 50);
  };

  // State modification handlers
  const handleToggleConcept = (conceptName: string) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          const isDone = s.completedConcepts.includes(conceptName);
          const completedConcepts = isDone
            ? s.completedConcepts.filter((name) => name !== conceptName)
            : [...s.completedConcepts, conceptName];
          return { ...s, completedConcepts };
        }
        return s;
      })
    );
  };

  const handleToggleCardMastery = (cardId: number) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          const isMastered = s.masteredCards.includes(cardId);
          const masteredCards = isMastered
            ? s.masteredCards.filter((id) => id !== cardId)
            : [...s.masteredCards, cardId];

          // Also toggle the state flag inside the data object itself for ease of reference
          const updatedFlashcards = s.data.flashcards.map((c) => {
            if (c.id === cardId) {
              return { ...c, isMastered: !isMastered };
            }
            return c;
          });

          return {
            ...s,
            masteredCards,
            data: { ...s.data, flashcards: updatedFlashcards }
          };
        }
        return s;
      })
    );
  };

  const handleSaveHighScore = (score: number) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          const prevHigh = s.quizHighScore || 0;
          return {
            ...s,
            quizHighScore: Math.max(prevHigh, score)
          };
        }
        return s;
      })
    );
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setError(null);
  };

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <div className="app-container">
      {/* Sessions Sidebar */}
      <SessionSidebar
        sessions={sessions.map((s) => ({ id: s.id, topic: s.topic, timestamp: s.timestamp }))}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onDeleteSession={handleDeleteSession}
        onNewSession={handleNewSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top Navbar */}
        <div style={{ padding: "1rem 2rem 0", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <Header
            topic={activeSession ? activeSession.topic : ""}
            theme={theme}
            toggleTheme={toggleTheme}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hasData={activeSession !== null}
            isMockMode={activeSession?.isMockMode || false}
          />
        </div>

        {/* Main Work Area */}
        <main className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          
          {/* Error Banner (Resilience Showcase) */}
          {error && (
            <div
              className="glass-panel animate-slide-up"
              style={{
                padding: "1.25rem",
                marginBottom: "1.5rem",
                borderLeft: "4px solid var(--error)",
                backgroundColor: "var(--error-glow)"
              }}
            >
              <h4 style={{ margin: 0, color: "var(--error)", marginBottom: "0.25rem" }}>
                ⚠️ AI Output Failure Handled ({error.type})
              </h4>
              <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>{error.message}</p>
              
              {error.raw && (
                <details style={{ marginBottom: "1rem", cursor: "pointer" }}>
                  <summary style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                    View Raw Model Response Debug Details
                  </summary>
                  <pre
                    style={{
                      fontSize: "0.75rem",
                      backgroundColor: "rgba(0,0,0,0.3)",
                      padding: "8px",
                      borderRadius: "6px",
                      marginTop: "4px",
                      overflowX: "auto",
                      maxHeight: "150px"
                    }}
                  >
                    {error.raw}
                  </pre>
                </details>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn btn-secondary" onClick={handleRetry} style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
                  🔄 Retry Request
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleBypassWithMock}
                  style={{ fontSize: "0.85rem", padding: "6px 12px", backgroundColor: "var(--success)" }}
                >
                  ✨ Run in Mock Mode (Bypass API)
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setError(null)}
                  style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Skeleton Loaders (Visual States) */}
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="skeleton skeleton-title"></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                <div className="skeleton" style={{ height: "80px" }}></div>
                <div className="skeleton" style={{ height: "80px" }}></div>
                <div className="skeleton" style={{ height: "80px" }}></div>
              </div>
              <div className="skeleton skeleton-card"></div>
            </div>
          )}

          {/* Core App Routing */}
          {!isLoading && (
            <>
              {activeSession ? (
                // Active session workspace
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>
                  {/* Dev Panel inside workspace */}
                  <DevPanel
                    simulateError={simulateError}
                    setSimulateError={setSimulateError}
                    forceMock={forceMock}
                    setForceMock={setForceMock}
                  />

                  {/* Render active tab */}
                  <div style={{ flex: 1 }}>
                    {activeTab === "summary" && (
                      <SummaryTab
                        data={activeSession.data}
                        completedConcepts={activeSession.completedConcepts}
                        onToggleConcept={handleToggleConcept}
                        stats={{
                          masteredCards: activeSession.masteredCards.length,
                          totalCards: activeSession.data.flashcards.length,
                          quizScore: activeSession.quizHighScore,
                          quizTotal: activeSession.data.quiz.length
                        }}
                      />
                    )}

                    {activeTab === "flashcards" && (
                      <FlashcardsTab
                        cards={activeSession.data.flashcards}
                        onToggleMastery={handleToggleCardMastery}
                      />
                    )}

                    {activeTab === "quiz" && (
                      <QuizTab
                        questions={activeSession.data.quiz}
                        onSaveHighScore={handleSaveHighScore}
                        savedHighScore={activeSession.quizHighScore}
                      />
                    )}
                  </div>

                  {/* Refinement Prompt Loop Panel */}
                  <div className="glass-panel" style={{ padding: "1.25rem", marginTop: "1.5rem", borderTop: "2px solid var(--primary-glow)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "1.1rem" }}>🪄</span>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Refine Study Guide</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        - Add subtopics, customize flashcards, or increase quiz difficulty
                      </span>
                    </div>
                    <PromptInput onSubmit={handleRefine} isLoading={isLoading} isRefine={true} />
                  </div>
                </div>
              ) : (
                // Home/Landing page to create first session
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "800px", margin: "3rem auto 0", width: "100%" }}>
                  <DevPanel
                    simulateError={simulateError}
                    setSimulateError={setSimulateError}
                    forceMock={forceMock}
                    setForceMock={setForceMock}
                  />

                  <PromptInput onSubmit={handleGenerate} isLoading={isLoading} />

                  {/* Previous Sessions grid on dashboard */}
                  {sessions.length > 0 && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <h3 style={{ fontSize: "1.1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem" }}>
                        Recent Study Guides
                      </h3>
                      <div className="grid-cols-2">
                        {sessions.slice(0, 4).map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setActiveSessionId(s.id);
                              setActiveTab("summary");
                            }}
                            className="glass-panel"
                            style={{
                              padding: "1rem",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{s.topic}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                                {s.data.flashcards.length} cards • {s.data.quiz.length} questions
                              </div>
                            </div>
                            <span style={{ fontSize: "1.2rem" }}>➡️</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
