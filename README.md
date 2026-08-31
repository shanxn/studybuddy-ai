# 🎓 StudyBuddy AI - Your Personal AI Tutor

StudyBuddy AI is a production-grade, locally-runnable AI learning platform designed to help students prepare for exams. It uses Retrieval-Augmented Generation (RAG), local large language models (via Ollama), open-source vector databases (ChromaDB), and sophisticated orchestration to act as an intelligent tutor based strictly on your uploaded study materials.

![Dashboard Preview](./dashboard-preview.png) *(Preview placeholder)*

## 🌟 Key Features

- **📚 Document Ingestion & RAG:** Upload PDFs and automatically process them with LangChain's chunking strategies. Embeddings are stored efficiently in a local ChromaDB instance.
- **🤖 AI Tutor Chat:** Converse with an AI that specifically references your uploaded notes. Choose answer formats like 2-Marks, 5-Marks, or 10-Marks (Essay) style.
- **🧠 Model Switching:** Dynamically switch between any open-source models downloaded via Ollama (e.g., LLaMA, Phi-3, DeepSeek) through the UI.
- **📊 Knowledge Map:** Visualize relationships between academic concepts across your materials using an interactive Cytoscape.js directed graph.
- **📝 Automated Mock Exams:** Generate adaptive multiple-choice quizzes (Easy, Medium, Hard) tailored exactly to your course syllabus. Take the exam and receive instant grading and explanations.
- **📐 Mathematical Solver:** Process algebraic equations and generate graph plots using a SymPy and Matplotlib engine.
- **📄 Paper Analyzer:** Upload past question papers to extract topics, analyze marking schemes, and predict highly-probable future questions.
- **✨ Premium UI:** Built with React, TailwindCSS, and ShadCN components for a modern, animated, glassmorphic aesthetic.

## 🛠️ Technology Stack

- **Frontend:** React, React Router, TailwindCSS, ShadCN UI, Lucide Icons, Cytoscape.js, Axios, Vite
- **Backend:** FastAPI (Python), Uvicorn
- **AI/ML Layer:** LangChain, Ollama (Local LLMs), HuggingFace Embeddings, ChromaDB
- **Math Engine:** SymPy, Matplotlib
- **Document Processing:** PyPDF2

## 🚀 Getting Started

### Prerequisites

1.  **Python 3.9+**
2.  **Node.js & npm**
3.  **Ollama:** Install Ollama from [ollama.com](https://ollama.com) and keep it running in the background.

Pull your desired models using Ollama before starting:
```bash
ollama run phi3:mini
ollama run llama3:8b
# Ollama will download the models to your machine.
```

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:
```bash
cd studybuddy-ai/backend
```

Install the Python dependencies:
```bash
pip install -r requirements.txt
```

Run the FastAPI server:
```bash
uvicorn api.main:app --reload
```
The backend API will run on `http://localhost:8000`.

### 2. Frontend Setup

Open a **new** terminal and navigate to the `frontend` directory:
```bash
cd studybuddy-ai/frontend
```

Install the NPM dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The web application will open on `http://localhost:5173`.

## 📂 Project Architecture

```
studybuddy-ai/
├── backend/
│   ├── api/                   # FastAPI routes (chat, upload, math, etc.)
│   ├── ingestion/             # Document loader and PDF parsing logic
│   ├── rag/                   # Prompt templates, Langchain LLM/Vector stores
│   ├── math_engine/           # SymPy equation solver and plotter
│   ├── paper_analyzer/        # Exam pattern extraction and prediction
│   ├── evaluation/            # Knowledge graphs, quiz generation
│   ├── storage/               # (Auto-generated) ChromaDB local persistence
│   └── uploads/               # (Auto-generated) Temporarily stored PDFs
└── frontend/
    ├── src/
    │   ├── components/ui/     # ShadCN building block components
    │   ├── layout/            # Sidebar, Header, App layout shells
    │   ├── pages/             # Main application views (Dashboard, Chat, Exam, etc.)
    │   ├── App.tsx            # React Router configuration
    │   └── index.css          # Tailwind and global styles
    └── tailwind.config.js     # Tailwind setup and custom colors
```

## 🔒 Privacy & Architecture Notes

StudyBuddy AI is designed with **100% data privacy** in mind. Because it utilizes Ollama and a local instance of ChromaDB, none of your study materials, chat logs, or analytics are ever sent to external cloud APIs like OpenAI or Anthropic. 

Everything runs directly on your machine.

---
*Built iteratively with robust modular components by Antigravity AI.*
