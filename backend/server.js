import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PRESET_MOCK_DATA, generateGenericMockData } from "./mockData.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to sleep for simulation
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Schema to enforce structured outputs in Gemini API
const GEMINI_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    topic: { type: "STRING" },
    summary: { type: "STRING" },
    keyConcepts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          concept: { type: "STRING" },
          definition: { type: "STRING" }
        },
        required: ["concept", "definition"]
      }
    },
    flashcards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "NUMBER" },
          question: { type: "STRING" },
          answer: { type: "STRING" }
        },
        required: ["id", "question", "answer"]
      }
    },
    quiz: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "NUMBER" },
          question: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          answerIndex: { type: "NUMBER" },
          explanation: { type: "STRING" }
        },
        required: ["id", "question", "options", "answerIndex", "explanation"]
      }
    }
  },
  required: ["topic", "summary", "keyConcepts", "flashcards", "quiz"]
};

// Common prompt details
const SYSTEM_INSTRUCTION = `
You are an expert educational study assistant. Your goal is to convert user notes, topics, or explanations into structured study materials.
Always provide a concise, high-quality summary, a checklist of 3-5 key concepts, a list of 4-6 flashcards for active recall, and a 3-5 question multiple-choice quiz.
Ensure the quiz has exactly 4 options per question, correct 0-indexed answerIndex, and a clear explanation.
`;

// Helper to handle LLM calls
async function callGemini(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }]
        }
      ],
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_JSON_SCHEMA
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("No content received from Gemini model.");
  }

  return JSON.parse(textResponse);
}

// Generate study session endpoint
app.post("/api/generate", async (req, res) => {
  const { topic, text, simulateError, forceMock } = req.body;
  const targetTopic = topic || text || "General Topic";

  console.log(`[API] Generate request for topic: "${targetTopic}"`);

  // Handle Developer Failures Simulation
  if (simulateError) {
    console.log(`[Dev] Simulating error: ${simulateError}`);
    if (simulateError === "api_error") {
      return res.status(500).json({ error: "Simulated Internal Server Error (500)." });
    }
    if (simulateError === "slow_response") {
      await sleep(5000);
      // Let it fall through after sleep to generate the response
    }
    if (simulateError === "malformed_json") {
      // Return plain text that isn't valid JSON
      res.setHeader("Content-Type", "application/json");
      return res.send(`{"topic": "${targetTopic}", "summary": "This is a malformed response designed to check error resilience. It cuts off abruptly here`);
    }
    if (simulateError === "wrong_schema") {
      // Return valid JSON but with wrong shape
      return res.json({
        topic: targetTopic,
        brokenMessage: "This schema is incorrect and lacks flashcards and quiz fields.",
        garbageData: [1, 2, 3]
      });
    }
  }

  // Fallback to Mock Data if requested, or if API key is not configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (forceMock || !apiKey) {
    if (!apiKey) {
      console.log("[API] No API key detected. Falling back to Mock Data.");
    } else {
      console.log("[API] Force Mock enabled. Falling back to Mock Data.");
    }
    
    // Check if preset mock data exists (case-insensitive)
    const presetKey = targetTopic.toLowerCase().trim();
    let resultData = PRESET_MOCK_DATA[presetKey];
    
    if (!resultData) {
      resultData = generateGenericMockData(targetTopic);
    }
    
    await sleep(800); // Simulate network overhead
    return res.json(resultData);
  }

  try {
    const promptText = `Generate study assistant materials for: "${targetTopic}"`;
    const studySession = await callGemini(promptText);
    res.json(studySession);
  } catch (error) {
    console.error("[API Error] Generation failed:", error.message);
    res.status(500).json({ error: error.message || "Failed to generate study materials." });
  }
});

// Refinement endpoint
app.post("/api/refine", async (req, res) => {
  const { previousData, prompt, simulateError, forceMock } = req.body;

  if (!previousData || !prompt) {
    return res.status(400).json({ error: "Missing previousData or prompt for refinement." });
  }

  console.log(`[API] Refinement request: "${prompt}"`);

  // Handle Developer Failures Simulation
  if (simulateError) {
    console.log(`[Dev] Simulating error: ${simulateError}`);
    if (simulateError === "api_error") {
      return res.status(500).json({ error: "Simulated Refinement Server Error." });
    }
    if (simulateError === "slow_response") {
      await sleep(5000);
    }
    if (simulateError === "malformed_json") {
      res.setHeader("Content-Type", "application/json");
      return res.send(`{"topic": "${previousData.topic}", "summary": "Broken during refinement...`);
    }
    if (simulateError === "wrong_schema") {
      return res.json({
        topic: previousData.topic,
        errorMsg: "Nonsense schema returned from LLM refinement."
      });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (forceMock || !apiKey) {
    console.log("[API] Mocking refinement response.");
    await sleep(1000); // Simulate network overhead

    // Modify previous data slightly to reflect the prompt
    const updatedData = JSON.parse(JSON.stringify(previousData));
    updatedData.summary += ` (Refined based on request: "${prompt}")`;
    
    // Add a new flashcard as evidence of refinement
    const newId = updatedData.flashcards.length + 1;
    updatedData.flashcards.push({
      id: newId,
      question: `New flashcard added for: ${prompt}?`,
      answer: `This is a refined study detail answering: '${prompt}'.`
    });

    // Add a new concept
    updatedData.keyConcepts.push({
      concept: `Refined: ${prompt.substring(0, 20)}...`,
      definition: `Detailed concept generated to satisfy: "${prompt}".`
    });

    return res.json(updatedData);
  }

  try {
    const promptText = `
We have an active study session for the topic "${previousData.topic}".
Here is the current study session data in JSON format:
${JSON.stringify(previousData)}

The user wants to refine/modify this session with the following request:
"${prompt}"

Please update the study session content accordingly. You may:
1. Add new flashcards, concepts, or quiz questions.
2. Edit existing items to make them harder, easier, or add more details.
3. Update the summary to incorporate the new concepts.
Ensure the output matches the exact JSON schema requested. Do not change the overall structure, and return the FULL updated JSON document.
`;

    const updatedSession = await callGemini(promptText);
    res.json(updatedSession);
  } catch (error) {
    console.error("[API Error] Refinement failed:", error.message);
    res.status(500).json({ error: error.message || "Failed to refine study materials." });
  }
});

// Health check / index route
app.get("/", (req, res) => {
  res.send("Study Assistant Backend is running.");
});

app.listen(PORT, () => {
  console.log(`[Server] Study Assistant backend listening on http://localhost:${PORT}`);
});
