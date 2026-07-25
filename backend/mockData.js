// High-quality mock data for testing without an API key or demonstrating error handling

export const PRESET_MOCK_DATA = {
  "react hooks": {
    topic: "React Hooks",
    summary: "React Hooks are functions that let you 'hook into' React state and lifecycle features from function components. Introduced in React 16.8, they solve the reuse of stateful logic, large complex components, and class-based confusion.",
    keyConcepts: [
      {
        concept: "useState",
        definition: "A Hook that allows functional components to declare and manage local state variables."
      },
      {
        concept: "useEffect",
        definition: "A Hook that lets you perform side effects in function components, such as data fetching, subscriptions, or manual DOM updates."
      },
      {
        concept: "useContext",
        definition: "A Hook that accepts a context object and returns the current context value, enabling cleaner state sharing across deep trees."
      },
      {
        concept: "Rules of Hooks",
        definition: "Only call Hooks at the top level (not inside loops or conditions) and only call Hooks from React function components."
      }
    ],
    flashcards: [
      {
        id: 1,
        question: "What is the primary purpose of useState?",
        answer: "To add local state to a functional component, returning the current state value and a function to update it."
      },
      {
        id: 2,
        question: "When does the cleanup function in useEffect run?",
        answer: "It runs before the component unmounts and before running the effect again, to clean up subscriptions or timers."
      },
      {
        id: 3,
        question: "What happens if you omit the dependency array in useEffect?",
        answer: "The effect runs after every single render of the component, which can lead to performance issues or infinite loops."
      },
      {
        id: 4,
        question: "What is the difference between useMemo and useCallback?",
        answer: "useMemo memoizes the *result* of a function calculation, while useCallback memoizes the *function instance* itself."
      }
    ],
    quiz: [
      {
        id: 1,
        question: "Which hook should you use to cache a CPU-intensive calculation?",
        options: ["useCallback", "useMemo", "useRef", "useEffect"],
        answerIndex: 1,
        explanation: "useMemo caches the returned value of a computation between renders, preventing expensive recalculations unless dependency values change."
      },
      {
        id: 2,
        question: "What is a key rule when writing React Hooks?",
        options: [
          "Hooks can be called inside loops",
          "Hooks should only be called at the top level",
          "Hooks can be used inside normal helper functions",
          "Hooks must be called inside class components"
        ],
        answerIndex: 1,
        explanation: "Hooks must only be called at the top level of React functions, before any early returns, to ensure Hooks run in the same order on every render."
      },
      {
        id: 3,
        question: "How does useRef persist values across renders?",
        options: [
          "It triggers a re-render when the .current property changes",
          "It saves values in local storage",
          "It returns a mutable object that persists for the full lifetime of the component without triggering renders",
          "It uses a Redux store internally"
        ],
        answerIndex: 2,
        explanation: "useRef returns a mutable object whose '.current' property persists across renders. Mutating it does not cause the component to re-render."
      }
    ]
  },
  "rust ownership": {
    topic: "Rust Ownership",
    summary: "Ownership is Rust's central feature that guarantees memory safety without a garbage collector. It governs memory management through a set of rules checked at compile-time.",
    keyConcepts: [
      {
        concept: "The Three Rules of Ownership",
        definition: "1. Each value in Rust has an owner. 2. There can only be one owner at a time. 3. When the owner goes out of scope, the value is dropped."
      },
      {
        concept: "Borrowing",
        definition: "Accessing a value without taking ownership. Can be immutable (&T) or mutable (&mut T)."
      },
      {
        concept: "The Borrow Checker",
        definition: "A compiler mechanism that enforces borrowing rules: you can have either one mutable reference OR any number of immutable references, never both at once."
      }
    ],
    flashcards: [
      {
        id: 1,
        question: "What is the difference between copy and move semantics?",
        answer: "Types stored on the stack (like integers) implement Copy and are duplicated on assignment. Types on the heap (like String) are Moved, transferring ownership and making the old variable invalid."
      },
      {
        id: 2,
        question: "What is a dangling reference?",
        answer: "A reference that points to a location in memory that has been deallocated. Rust prevents this at compile time using Lifetimes."
      }
    ],
    quiz: [
      {
        id: 1,
        question: "How many mutable references to a piece of data can you have in a scope?",
        options: ["Unlimited", "Zero", "Exactly one", "Up to three"],
        answerIndex: 2,
        explanation: "To prevent data races, Rust enforces that you can only have one mutable reference to a specific piece of data in a particular scope."
      }
    ]
  }
};

export function generateGenericMockData(topic) {
  const cleanTopic = topic.trim();
  return {
    topic: cleanTopic,
    summary: `This is a dynamically generated study session for '${cleanTopic}'. In mock mode, we generate custom study resources locally to demonstrate frontend interactivity.`,
    keyConcepts: [
      {
        concept: `${cleanTopic} Core Principles`,
        definition: `Fundamental concepts and architecture rules defining the domain of ${cleanTopic}.`
      },
      {
        concept: `Practical Application of ${cleanTopic}`,
        definition: `How practitioners implement and leverage ${cleanTopic} in production settings.`
      },
      {
        concept: `Common Pitfalls in ${cleanTopic}`,
        definition: `Typical mistakes, anti-patterns, and debugging challenges to watch out for.`
      }
    ],
    flashcards: [
      {
        id: 1,
        question: `What is the core idea of ${cleanTopic}?`,
        answer: `The core idea of ${cleanTopic} revolves around efficiency, structured design, and solving key problems in the domain.`
      },
      {
        id: 2,
        question: `How do you get started with ${cleanTopic}?`,
        answer: `Start by understanding the basic parameters, setting up your environment, and working through incremental practice challenges.`
      },
      {
        id: 3,
        question: `Can you explain a main benefit of ${cleanTopic}?`,
        answer: `It provides standardized structures, increases predictability, and reduces manual friction in everyday workflows.`
      }
    ],
    quiz: [
      {
        id: 1,
        question: `Which of the following best describes the main objective of ${cleanTopic}?`,
        options: [
          "To introduce complexity and overhead",
          "To optimize output, clarify concepts, and solve domain-specific problems",
          "To deprecate modern coding paradigms",
          "To run standalone processes without memory allocation"
        ],
        answerIndex: 1,
        explanation: `${cleanTopic} is designed to streamline operations and provide concrete problem-solving strategies in its subject area.`
      },
      {
        id: 2,
        question: `What is a common misconception about ${cleanTopic}?`,
        options: [
          "It is only useful for large-scale enterprise systems",
          "It guarantees absolute error-free execution automatically",
          "It is completely identical to general assembly language",
          "Both A and B"
        ],
        answerIndex: 3,
        explanation: "Many falsely believe it's only for enterprise systems or that it solves all errors automatically. In reality, it scale-adapts and requires proper logic."
      }
    ]
  };
}
