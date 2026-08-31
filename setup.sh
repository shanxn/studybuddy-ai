#!/usr/bin/env bash
# ============================================================
#  StudyBuddy AI  —  One-click Setup Script (macOS / Linux)
#  Run:  chmod +x setup.sh && ./setup.sh
# ============================================================

set -e

echo ""
echo "============================================================"
echo " StudyBuddy AI  |  One-Click Setup"
echo "============================================================"
echo ""

# ── Step 1: Check Python ─────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo "[ERROR] Python 3.10+ is required."
  echo "        Install from https://www.python.org/downloads/"
  exit 1
fi
echo "[OK] $(python3 --version)"

# ── Step 2: Check Node.js ────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "[ERROR] Node.js 18+ is required."
  echo "        Install from https://nodejs.org/"
  exit 1
fi
echo "[OK] $(node --version)"

# ── Step 3: Ollama ───────────────────────────────────────────
if ! command -v ollama &>/dev/null; then
  echo "[WARN] Ollama not found. Install from https://ollama.com"
  echo "       Then run:  ollama pull phi3:mini"
else
  echo "[OK] Ollama: $(ollama --version)"
fi

echo ""
echo "── Installing Backend Dependencies ──────────────────────"
cd "$(dirname "$0")/backend"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
pip install sentence-transformers langchain-ollama langchain-huggingface \
            faiss-cpu youtube-transcript-api --quiet
echo "[OK] Backend packages installed."

echo ""
echo "── Installing Frontend Dependencies ─────────────────────"
cd ../frontend
npm install --silent
echo "[OK] Frontend packages installed."

echo ""
echo "── Creating Data Directories ─────────────────────────────"
mkdir -p ../backend/data/notes ../backend/data/faiss_db
echo "[OK] Data directories ready."

echo ""
echo "============================================================"
echo " Setup Complete!"
echo ""
echo " HOW TO RUN:"
echo " 1. Terminal 1 (Backend):"
echo "    cd backend && source venv/bin/activate && uvicorn api.main:app --reload"
echo ""
echo " 2. Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo " 3. Open http://localhost:5173 in your browser"
echo " 4. Ensure Ollama is running: ollama serve"
echo "============================================================"
echo ""
