Here is a comprehensive **README.md** tailored for your **NexusLearn: Multimodal AI Knowledge Engine** project.

---

# 🎓 NexusLearn – Multimodal AI Knowledge Engine

**NexusLearn** is a multimodal learning and study workspace agent powered by Google AI Studio and Gemini. Designed to help students, developers, and researchers process dense learning materials efficiently, NexusLearn organizes resources into topic-specific workspaces, extracts deep structured notes from active browser tabs and videos, and resolves complex doubts with grounded AI assistance.

---

## 🌟 Key Features

### 📁 Topic-Isolated Workspaces

* Create dedicated environments (e.g., *Braze Architecture*, *Machine Learning & Transformers*) to isolate documents, notes, concept graphs, and flashcards by subject matter.
* Seamlessly append new insights to existing knowledge bases without cluttering prior notes.

### 📖 Active Reader & Video Hub

* Read articles, technical documentation, code snippets, and YouTube videos side-by-side.
* Choose from multiple **Note Detail Levels** (*Standard*, *Comprehensive*, *Exhaustive*) to control extraction depth.
* **Batch Material Synthesis**: Generate a unified *Master Study Guide* across all open resources in a single click.
* **Interactive Text Actions**: Highlight text within the reader to immediately generate snippets, request AI explanations, or simplify dense concepts.

### ❓ Grounded Confusion Clearing AI Agent

* Ask questions directly about your active workspace materials.
* Responses are grounded specifically in your active reading materials, video timestamps, and visual diagrams.
* Includes step-by-step logic, code snippets, real-world analogies, and self-assessment sanity checks.

### 🕸️ Cross-Referencer Concept Graph

* Visual reference mesh connecting reading materials, synthesized notes, video markers, diagram figures, and key concept nodes.
* Seamlessly cross-reference related topics across multiple documents.

### 🎴 Active Recall Flashcards

* Automatically convert synthesized notes into interactive flashcard decks for effective study and review.

🎨 **Design Theme**: Includes a sleek, modern **Frosted Glass** UI (`backdrop-blur-xl`, semi-transparent glass cards, dark slate canvas, and indigo glow accents).

---

## 🛠️ Tech Stack

* **Frontend Framework**: React / TypeScript
* **Styling**: Tailwind CSS (Frosted Glass / Modern Slate Theme)
* **Icons**: Lucide React
* **AI & LLM Integration**: Gemini AI Engine via `@google/genai` / Express Backend API
* **Build Tooling**: Vite

---

## 📁 Project Structure

```text
.
├── server.ts                    # Backend API server handling AI synthesis & grounded Q&A
├── src/
│   ├── App.tsx                  # Main application router & view switcher
│   ├── types.ts                 # TypeScript type definitions (Workspaces, Notes, Resources)
│   ├── index.css                # Global styles & Frosted Glass Tailwind utilities
│   ├── components/
│   │   ├── Navbar.tsx           # Workspace header & switcher navigation bar
│   │   ├── ActiveTabReader.tsx  # Document/Video reader & interactive note workbench
│   │   ├── KnowledgeBaseView.tsx# Centralized note repository & append history timeline
│   │   ├── ConfusionSolverView.tsx # Grounded AI Q&A agent interface
│   │   ├── CrossReferencerView.tsx # Interactive concept node graph
│   │   ├── FlashcardsView.tsx   # Interactive study flashcards deck
│   │   └── MarkdownRenderer.tsx # Markdown & code block formatting renderer
│   └── data/
│       └── initialData.ts       # Starter mock workspace data & initial resources
├── package.json
└── README.md

```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/your-username/nexus-learn.git
cd nexus-learn

```


2. **Install dependencies**:
```bash
npm install

```


3. **Configure Environment Variables**:
Create a `.env` file in the root directory and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000

```


4. **Run the Application**:
```bash
npm run dev

```


5. Open your browser and navigate to `http://localhost:3000`.

---

## 💡 How to Use

1. **Select or Create a Workspace**: Use the top dropdown menu to switch between topic workspaces or create a new one.
2. **Add Materials**: Upload documents or add web links/YouTube videos to your workspace.
3. **Read & Extract Notes**: Open the **Reader**, highlight key text to generate snippet notes, or click **"Synthesize All Materials"** to build a comprehensive study guide.
4. **Resolve Doubts**: Head over to **Clear Confusion AI** to ask specific questions about confusing topics.
5. **Review**: Use the **Graph** to view connections between concepts and test yourself with **Flashcards**.

---

## 📄 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
