# React Study Assistant 🚀✨


<img width="1024" height="1024" alt="human_image" src="https://github.com/user-attachments/assets/9d8dd22f-8dbd-4c52-9219-860b6d65be9e" />


## 🙋‍♀️ Human Representation

<img src="./human_image.png" alt="React Study Assistant Human" style="max-width:100%; height:auto;" />

[![License](https://img.shields.io/github/license/Ankit-bot103/react-study-assistant)](LICENSE) [![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/) [![npm](https://img.shields.io/badge/npm-%3E%3D9-blue)](https://www.npmjs.com/)

A premium, interactive study tool that transforms unstructured notes, texts, or topics into structured, interactive study workspaces. The app automatically builds high‑fidelity **Checklists**, **3D Flashcards**, and **Dynamic Quizzes** powered by Gemini AI, with real‑time refinement, local persistence, and keyboard navigation.

---

## 📚 Table of Contents
- [Overview](#-overview)
- [Demo](#-demo)
- [Features](#-features)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [Development](#-development)
- [Testing](#-testing)
- [Project Overview & Assignment Coverage](#-project-overview--assignment-coverage)
- [Interview Preparation](#-interview-preparation)
- [Questionnaire Answers](#-questionnaire-answers)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 📖 Overview
React Study Assistant is a **premium‑grade** web application built for the Frontend Internship Assignment. It showcases:
- Seamless **AI‑driven content generation** with Gemini 2.5 Flash.
- Robust **error‑handling** via a developer control panel.
- Persistent state using **localStorage**.
- A sleek **glass‑morphic UI** that works beautifully on desktop and mobile.

---

## 🎥 Demo
<img width="1917" height="1022" alt="demo_image1" src="https://github.com/user-attachments/assets/fc9ce853-03cf-4958-b62c-5c786045da8c" />


---

## ✨ Features
- **Tabbed Workspace** – Overview & Checklist, 3D Flashcards, Practice Quiz.
- **Keyboard Navigation** – Arrow keys to move, Space to flip cards, Enter to master.
- **Refinement Loop** – Prompt Gemini to add or improve cards & quiz questions.
- **Developer Control Panel** – Simulate 500 errors, latency, malformed JSON, schema mismatches, and stale‑request protection.
- **Responsive Design** – Glass‑morphic UI adapts to all screen sizes.
- **Local Persistence** – Sessions, progress, and scores saved in `localStorage`.

---

## 🏗️ Architecture
- **Frontend**: React (hooks, functional components), Vite, TypeScript, custom glass‑morphic CSS.
- **Backend**: Node.js 24, Express proxy (keeps Gemini API key secret).
- **AI Integration**: Gemini 2.5 Flash with JSON‑Schema enforcement for structured responses.
- **State Management**: Context API + `localStorage` sync.

---

## 🚀 Installation
```bash
# Clone the repository (replace <your-username> if you forked)
git clone https://github.com/Ankit-bot103/react-study-assistant.git
cd react-study-assistant

# Install all dependencies (frontend + backend)
npm install
```
### Optional: Gemini API key
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set GEMINI_API_KEY=your_key
```
If omitted, the app runs in **Mock Mode** with pre‑generated educational content.

---

## 🎮 Usage
```bash
npm start   # launches both backend proxy and Vite dev server
```
Open your browser at the address shown (usually `http://localhost:5173`).

---

## 🛠️ Development
- Run the frontend in isolation: `npm run dev --workspace frontend`.
- Run the backend alone: `npm run dev --workspace backend`.
- Linting & formatting: `npm run lint` and `npm run format`.
- To add new UI components, follow the existing design‑system conventions in `frontend/src/styles/`.

---

## 🧪 Testing
Automated tests are not included yet, but you can manually verify:
1. **AI generation** – enter a topic and check the checklist, flashcards, and quiz.
2. **Failure panel** – open the Developer Control Panel and trigger each simulated error.
3. **Persistence** – refresh the page; progress should be retained.

---

## 📋 Project Overview & Assignment Coverage
**Project Idea**: Study Assistant – generate flashcards and quizzes from free‑form text.
**LLM Provider**: OpenAI (`gpt-4o-mini`), accessed via Gemini proxy.
**Backend Hostname**: `api.local.dev` (configured in `backend/hostname.config.js`).
**Styling**: Dark‑mode with glass‑morphism, custom teal‑purple gradient palette, pure CSS micro‑animations.
**Scope**: Core functionality (AI‑driven generation, UI tabs, persistence, error handling) fully implemented within the 8‑hour budget. No extra stretch features were added to stay within the time limit.
**Deliverables**: Fully functional React app, Express proxy, comprehensive README, and reusable UI components (`LoadingSpinner`, `ErrorBanner`).

---

## Interview Questions & Answers

**1️⃣ Why use a proxy backend instead of calling the LLM directly from the front‑end?**
**Answer:**
- Keeps the API key secret; the key never reaches the browser.
- Centralises request validation, schema enforcement, and error handling.
- Enables mock mode for offline development.
- Simplifies CORS configuration.

**2️⃣ How does the ErrorBanner component improve UX?**
**Answer:**
- Gives immediate visual feedback on failures.
- Provides actionable buttons: retry, switch to mock data, dismiss.
- Prevents the UI from hanging in a loading state.
- Reusable across the app for consistent error handling.

**3️⃣ What is Ajv and why is it used?**
**Answer:**
- Ajv is a fast JSON‑schema validator.
- It guarantees the response from the LLM matches the expected `studySchema`.
- Protects the front‑end from malformed data and runtime crashes.

**4️⃣ Explain the mock data generation strategy.**
**Answer:**
- `generateMock(topic)` returns deterministic JSON shaped exactly like the schema.
- Triggered when `forceMock` is true or when no API key is provided.
- Allows development without network latency or API cost.

**5️⃣ How is dark‑mode and glass‑morphism achieved?**
**Answer:**
- CSS custom properties toggle between light and dark palettes.
- The `glass-panel` class uses a semi‑transparent background, `backdrop-filter: blur(12px)`, and subtle borders to create a glass‑morphic effect.
- Theme toggling updates root variables, instantly re‑styling the UI.

**6️⃣ What would you improve to make the backend more scalable?**
**Answer:**
- Deploy the Express server as a serverless function or containerised service.
- Add rate‑limiting, request caching, and a job queue for heavy prompts.
- Store secrets in a secret manager rather than `.env`.
- Implement structured logging and monitoring (e.g., Winston + Grafana).
### Key Talking Points
- **Design Decisions**: Used a proxy backend to keep the API key secret and centralize schema validation with `ajv`. Glass‑morphic CSS provides a premium UI.
- **Error Resilience**: Developer control panel simulates failure modes; UI degrades gracefully via `ErrorBanner`.
- **State Management**: React hooks plus `localStorage` persist sessions, progress, and scores.
- **Performance**: Memoized filtered lists, lazy‑loaded large data sets, minimal re‑renders.
- **Accessibility**: Keyboard navigation, proper ARIA roles, and sufficient colour contrast.
- **Testing Strategy**: Manual end‑to‑end verification; future work could add Jest/React Testing Library tests for component rendering and API error handling.

---

## ❓ Questionnaire Answers
1. **Which project idea should we build?**
   - **Study Assistant** (flashcards / quiz).
2. **Preferred LLM provider / API?**
   - **OpenAI** (`gpt-4o-mini`).
3. **Custom local hostname for the backend?**
   - **`api.local.dev`** (configured in `backend/hostname.config.js`).
4. **Styling preferences?**
   - Dark‑mode with glass‑morphism (default), teal‑purple gradient palette, pure CSS animations.
5. **Include any stretch features within the 8‑hour budget?**
   - Focused on core functionality only to ensure stable delivery.

---

## 🤝 Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Follow the existing code‑style (Prettier + ESLint).
4. Open a Pull Request with a clear description of changes.
See `CONTRIBUTING.md` for detailed guidelines.

---

## 📜 License
This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements
- **Antigravity** (Google DeepMind) – AI coding assistant that helped scaffold, style, and document the project.
- **Gemini 2.5 Flash** – powering the intelligent study‑content generation.
- **Vite** – fast development server and build tool.

---

*End of README*
