export interface KeyConcept {
  concept: string;
  definition: string;
}

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  isMastered?: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface StudySessionData {
  topic: string;
  summary: string;
  keyConcepts: KeyConcept[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

/**
 * Custom error class for JSON parsing issues
 */
export class JSONParseError extends Error {
  public rawOutput: string;
  constructor(message: string, rawOutput: string) {
    super(message);
    this.name = "JSONParseError";
    this.rawOutput = rawOutput;
  }
}

/**
 * Extract JSON string from markdown code block if present
 */
function extractJsonString(raw: string): string {
  const trimmed = raw.trim();
  
  // Check if it's wrapped in markdown code blocks
  const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = trimmed.match(markdownRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return trimmed;
}

/**
 * Attempts to repair basic JSON omissions (e.g., missing closing brackets)
 */
function attemptBasicRepair(raw: string): string {
  let json = raw.trim();

  // If it doesn't start with '{', it's probably completely garbage
  if (!json.startsWith("{")) return json;

  // Let's count bracket balances
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{") openBraces++;
      if (char === "}") openBraces--;
      if (char === "[") openBrackets++;
      if (char === "]") openBrackets--;
    }
  }

  // Close unclosed arrays first, then objects
  while (openBrackets > 0) {
    json += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    json += "}";
    openBraces--;
  }

  return json;
}

/**
 * Parses and validates raw LLM output against the StudySessionData schema
 */
export function parseAndValidateStudyData(rawInput: string): StudySessionData {
  if (!rawInput || rawInput.trim() === "") {
    throw new JSONParseError("The response from the model is empty.", rawInput);
  }

  let cleaned = extractJsonString(rawInput);
  let parsedObj: any;

  try {
    parsedObj = JSON.parse(cleaned);
  } catch (initialError: any) {
    // Attempt parsing repair
    console.warn("[Parser] Initial JSON parse failed. Attempting basic repairs...", initialError.message);
    const repaired = attemptBasicRepair(cleaned);
    try {
      parsedObj = JSON.parse(repaired);
    } catch (repairError) {
      throw new JSONParseError(
        `Failed to parse response as JSON: ${initialError.message}`,
        rawInput
      );
    }
  }

  // Schema Validation and Safe Defaulting
  // Rather than crashing if minor fields are missing, we default them.
  const topic = typeof parsedObj.topic === "string" ? parsedObj.topic : "Untitled Topic";
  const summary = typeof parsedObj.summary === "string" ? parsedObj.summary : "No summary provided.";

  const keyConcepts: KeyConcept[] = [];
  if (Array.isArray(parsedObj.keyConcepts)) {
    parsedObj.keyConcepts.forEach((item: any, index: number) => {
      if (item && typeof item === "object") {
        keyConcepts.push({
          concept: typeof item.concept === "string" ? item.concept : `Concept ${index + 1}`,
          definition: typeof item.definition === "string" ? item.definition : "No definition provided."
        });
      }
    });
  }

  const flashcards: Flashcard[] = [];
  if (Array.isArray(parsedObj.flashcards)) {
    parsedObj.flashcards.forEach((item: any, index: number) => {
      if (item && typeof item === "object") {
        flashcards.push({
          id: typeof item.id === "number" ? item.id : index + 1,
          question: typeof item.question === "string" ? item.question : "Empty Question?",
          answer: typeof item.answer === "string" ? item.answer : "Empty Answer.",
          isMastered: false // Initial UI state
        });
      }
    });
  }

  const quiz: QuizQuestion[] = [];
  if (Array.isArray(parsedObj.quiz)) {
    parsedObj.quiz.forEach((item: any, index: number) => {
      if (item && typeof item === "object") {
        // Enforce 4 options
        let options = Array.isArray(item.options) ? item.options.map(String) : [];
        while (options.length < 4) {
          options.push(`Option ${options.length + 1}`);
        }
        options = options.slice(0, 4);

        let answerIndex = typeof item.answerIndex === "number" ? item.answerIndex : 0;
        if (answerIndex < 0 || answerIndex > 3) {
          answerIndex = 0;
        }

        quiz.push({
          id: typeof item.id === "number" ? item.id : index + 1,
          question: typeof item.question === "string" ? item.question : "Empty Quiz Question?",
          options,
          answerIndex,
          explanation: typeof item.explanation === "string" ? item.explanation : "No explanation provided."
        });
      }
    });
  }

  // If both flashcards and quiz are completely missing, we throw an error to signal wrong shape
  if (keyConcepts.length === 0 && flashcards.length === 0 && quiz.length === 0) {
    throw new JSONParseError(
      "The response lacks study assistant data (flashcards, quiz, concepts are missing).",
      JSON.stringify(parsedObj, null, 2)
    );
  }

  return {
    topic,
    summary,
    keyConcepts,
    flashcards,
    quiz
  };
}
