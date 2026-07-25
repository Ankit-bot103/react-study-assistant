# AI-Powered Study Assistant 🧠✨

A premium, interactive study tool designed to turn unstructured notes, texts, or topics into structured, interactive study workspaces. The app automatically builds high-fidelity **Checklists**, **3D Flashcards**, and **Dynamic Quizzes** based on AI responses, complete with real-time refinement inputs, LocalStorage saving, and keyboard navigation.

This project was built for the **Frontend Internship Assignment** and prioritizes **robust AI error handling, validation, and recovery** (which is showcased using a custom Developer Control Panel).

---

## 🛠️ Stack & Architecture

- **Frontend**: React (hooks, functional components), Vite, TypeScript, and custom premium CSS styling (glassmorphic dark/light variable layers).
- **Backend**: Node.js, Express.js proxy.
  *Keeps API keys safe by routing LLM calls through a local backend proxy. Runs natively on Node 24.*
- **AI Integration**: Gemini 2.5 Flash API using JSON Schema enforcement (`responseMimeType: "application/json"`) for maximum output structure reliability.
- **State Preservation**: Saves current/previous sessions to `localStorage` (checklists checked state, mastered cards, and high scores are persistent).

---

## 🚀 Setup & Running Locally

The project includes a root-level workspace manager to install and run both frontend and backend concurrently with minimal commands.

### Prerequisites
- Node.js (v18 or higher recommended. Built & verified on **v24.16.0**)
- NPM (v9 or higher. Verified on **v11.13.0**)

### Steps to Run

1. **Clone & Open Workspace**:
   Navigate into the project root directory:
   ```bash
   cd Project_falm_frontened
   ```

2. **Install All Dependencies**:
   Run the following command at the root. The postinstall hook will automatically install packages for both the `frontend/` and `backend/` sub-directories:
   ```bash
   npm install
   ```

3. **Configure API Key (Optional)**:
   - Create a `.env` file in the `backend/` folder (or copy from `backend/.env.example`):
     ```bash
     cp backend/.env.example backend/.env
     ```
   - Open `backend/.env` and paste your Gemini API key:
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   *Note: If no API key is specified, the application will **automatically run in Mock Mode** with pre-configured high-quality educational guides (e.g. React Hooks, Rust Ownership) and dynamically generated local fallbacks, allowing instant evaluation out-of-the-box!*

4. **Launch Application**:
   Start both the backend proxy and Vite frontend dev server concurrently:
   ```bash
   npm start
   ```
   Open your browser to the local address displayed by Vite (usually **http://localhost:5173**).

---

## 💡 Developer Control Panel (Failure Testing Suite)

To make evaluating this assignment as easy as possible, a **Developer Control Panel** is stickied to the interface. You can click options to force simulated failure modes on the next request:
1. **500 Server Error**: Tests how the UI handles network/API outages. Displays an alert banner with a **Retry** button.
2. **5s High Latency**: Triggers mock skeleton load states to verify smooth page loading.
3. **Malformed JSON String**: Returns cut-off, syntactically broken JSON content. The parser catches the error and provides options to Retry or use a local Mock Data bypass to avoid a crash.
4. **Wrong Schema Shape**: Sends valid JSON lacking required arrays. The client safely initializes empty arrays using defaults instead of crashing.
5. **Stale Request Prevention**: Demonstrates built-in request counter mapping that ignores out-of-order responses if multiple prompts are sent rapidly.

---

## 🎨 Interactive Features Showcase

### 1. Tabbed Workspace
- **Overview & Checklist**: Tracks progress dynamically. Checking a concept persists in localStorage.
- **3D Flashcards**: Fully responsive flip animation. Mark cards as "Mastered" vs "Needs Review".
  *Keyboard Controls*: Left/Right arrow keys to browse, Spacebar to flip, Enter to master.
- **Practice Quiz**: Interactive option buttons with instant correct/incorrect visual feedback and immediate explanation panels. High scores are persistent.
- **Re-test Incorrect**: Clicking this option filters the quiz and starts a sub-session containing *only* questions answered incorrectly.

### 2. Refinement Loop
Submit text prompts like *"Add cards about closures"* or *"Make the quiz questions harder"* at the bottom of the workspace. The client merges changes into the session state while preserving flashcard mastery and checklist checks if card IDs/concepts match.

### 3. Session Persistence
Switch between past study guides or delete sessions from the sidebar (auto-collapses on mobile).

---

## 🤖 AI Usage Disclosure

- **Coding Assistant**: Antigravity (powered by Google DeepMind) was used to bootstrap folder scaffolding, generate styled CSS variable patterns, and build safe parse fallbacks.
- **Writing Assistance**: Standard code structures, JSDocs, and README styling were reviewed for clarity.
- **Interview Verification**: Every line of code written has been thoroughly documented and checked. I am fully prepared to explain design patterns (stale request prevention, state merging, regex repair fallbacks) and live-extend features during the interview.

---

## ⏱️ Metadata & Limitations

- **Time Spent**: ~4.5 hours (Planning, backend routing setup, custom CSS structuring, state sync + persistence, error testing panels, and validation optimization).
- **Known Limitations**:
  * If the model returns highly nested custom HTML elements in descriptions, they are stripped and rendered as plain text for security and styling consistency.
  * In mock mode, refinement actions generate generic expanded nodes instead of actual context-intelligent responses.
