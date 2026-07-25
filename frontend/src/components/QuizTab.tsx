import React, { useState, useEffect } from "react";
import type { QuizQuestion } from "../utils/parser";

interface QuizTabProps {
  questions: QuizQuestion[];
  onSaveHighScore: (score: number) => void;
  savedHighScore: number | null;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  questions,
  onSaveHighScore,
  savedHighScore
}) => {
  // We keep a separate active subset of questions to support "Re-test Wrong Answers"
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [gradedAnswers, setGradedAnswers] = useState<{ [qId: number]: boolean }>({});
  
  // Track incorrect questions for retest
  const [incorrectQuestionIds, setIncorrectQuestionIds] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isRetestMode, setIsRetestMode] = useState(false);

  // Sync questions if the core session data changes
  useEffect(() => {
    setActiveQuestions(questions);
    resetQuiz();
  }, [questions]);

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setGradedAnswers({});
    setIncorrectQuestionIds([]);
    setQuizFinished(false);
    setIsRetestMode(false);
    setActiveQuestions(questions);
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    // If already graded, do nothing
    if (gradedAnswers[questionId]) return;

    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    
    // Auto-grade immediately on selection (excellent instant feedback loop)
    setGradedAnswers((prev) => ({ ...prev, [questionId]: true }));

    const question = activeQuestions.find((q) => q.id === questionId);
    if (question) {
      const isCorrect = optionIdx === question.answerIndex;
      if (!isCorrect) {
        setIncorrectQuestionIds((prev) => [...prev, questionId]);
      }
    }
  };

  const handleNext = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Calculate final score
      let correctCount = 0;
      activeQuestions.forEach((q) => {
        if (selectedAnswers[q.id] === q.answerIndex) {
          correctCount++;
        }
      });

      // Save high score to session if it's the full quiz, or if it exceeds previous
      if (!isRetestMode) {
        onSaveHighScore(correctCount);
      }
      setQuizFinished(true);
    }
  };

  // Re-testing only the incorrect answers
  const handleRetestWrong = () => {
    const wrongQuestions = questions.filter((q) => incorrectQuestionIds.includes(q.id));
    
    setActiveQuestions(wrongQuestions);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setGradedAnswers({});
    setIncorrectQuestionIds([]);
    setQuizFinished(false);
    setIsRetestMode(true);
  };

  const activeQuestion = activeQuestions[currentIdx];
  const totalQuestions = activeQuestions.length;

  if (questions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
        <h3>📭 No quiz questions available for this topic.</h3>
      </div>
    );
  }

  // Quiz completion card
  if (quizFinished) {
    let score = 0;
    activeQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.answerIndex) {
        score++;
      }
    });

    const percent = Math.round((score / totalQuestions) * 100);

    return (
      <div className="glass-panel animate-slide-up" style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
        <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "1rem" }}>
          {percent >= 80 ? "🏆" : percent >= 50 ? "🎉" : "📚"}
        </span>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
          {isRetestMode ? "Review Quiz Complete!" : "Quiz Complete!"}
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {percent >= 80 
            ? "Fantastic! You have an excellent grasp of this material." 
            : percent >= 50 
              ? "Good job! A little more study and you'll master it completely." 
              : "Keep studying. Try reviewing your flashcards and testing again!"}
        </p>

        <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1.5rem", maxWidth: "320px", margin: "0 auto 2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>YOUR SCORE:</span>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: percent >= 70 ? "var(--success)" : "var(--primary)", fontFamily: "var(--font-heading)" }}>
              {score} / {totalQuestions}
            </div>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>({percent}%)</span>
          </div>

          {!isRetestMode && savedHighScore !== null && (
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Previous High Score: {savedHighScore} / {questions.length}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={resetQuiz}>
            🔄 Restart Full Quiz
          </button>

          {incorrectQuestionIds.length > 0 && (
            <button className="btn btn-primary" onClick={handleRetestWrong}>
              ✏️ Re-test Incorrect ({incorrectQuestionIds.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  const isGraded = gradedAnswers[activeQuestion.id];
  const userSelection = selectedAnswers[activeQuestion.id];

  return (
    <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Quiz Progress Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
            {isRetestMode ? "⚡ RE-TEST MODE" : "✍️ PRACTICE QUIZ"}
          </span>
          <h3 style={{ margin: 0 }}>Question {currentIdx + 1} of {totalQuestions}</h3>
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Score: {Object.values(selectedAnswers).filter((ans, idx) => ans === activeQuestions[idx]?.answerIndex).length} / {currentIdx + (isGraded ? 1 : 0)}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-input)", borderRadius: "4px", overflow: "hidden" }}>
        <div 
          style={{ 
            width: `${((currentIdx + 1) / totalQuestions) * 100}%`, 
            height: "100%", 
            backgroundColor: "var(--primary)", 
            transition: "width 0.3s ease" 
          }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="quiz-question-card">
        <p style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "1.25rem" }}>
          {activeQuestion.question}
        </p>

        <div className="options-list">
          {activeQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = userSelection === idx;
            const isCorrect = idx === activeQuestion.answerIndex;

            let optionClass = "";
            if (isGraded) {
              if (isCorrect) optionClass = "correct";
              else if (isSelected) optionClass = "incorrect";
            } else if (isSelected) {
              optionClass = "selected";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(activeQuestion.id, idx)}
                disabled={isGraded}
                className={`option-btn ${optionClass}`}
              >
                <span className="option-badge">{letter}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant Feedback & Explanatory Block */}
      {isGraded && (
        <div
          className="glass-panel animate-slide-up"
          style={{
            padding: "1.25rem",
            backgroundColor: userSelection === activeQuestion.answerIndex ? "var(--success-glow)" : "var(--error-glow)",
            borderLeft: `4px solid ${userSelection === activeQuestion.answerIndex ? "var(--success)" : "var(--error)"}`
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "0.25rem", color: userSelection === activeQuestion.answerIndex ? "var(--success)" : "var(--error)" }}>
            {userSelection === activeQuestion.answerIndex ? "✓ Correct!" : "✗ Incorrect"}
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
            {activeQuestion.explanation}
          </p>
        </div>
      )}

      {/* Next controls */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!isGraded}
        >
          {currentIdx === totalQuestions - 1 ? "Finish Quiz 🏁" : "Next Question ➡️"}
        </button>
      </div>
    </div>
  );
};
export default QuizTab;
