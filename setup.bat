@echo off
REM ============================================================
REM  StudyBuddy AI  —  One-click Setup Script (Windows)
REM  Run this once after cloning/copying the project.
REM ============================================================

echo.
echo ============================================================
echo  StudyBuddy AI  ^|  One-Click Setup
echo ============================================================
echo.

REM ── Step 1: Check Python ──────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.10+ is not installed or not on PATH.
    echo Download from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python found.

REM ── Step 2: Check Node.js ─────────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 18+ is not installed or not on PATH.
    echo Download from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found.

REM ── Step 3: Check Ollama ──────────────────────────────────
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Ollama not found. You will need to install it from https://ollama.com
    echo        and pull a model: ollama pull phi3:mini
) else (
    echo [OK] Ollama found.
)

echo.
echo ── Installing Backend Dependencies ──────────────────────
cd /d "%~dp0backend"
python -m venv venv
call venv\Scripts\activate.bat
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
pip install sentence-transformers langchain-ollama langchain-huggingface faiss-cpu youtube-transcript-api --quiet
echo [OK] Backend packages installed.

echo.
echo ── Installing Frontend Dependencies ─────────────────────
cd /d "%~dp0frontend"
call npm install --silent
echo [OK] Frontend packages installed.

echo.
echo ── Creating Data Directories ─────────────────────────────
cd /d "%~dp0"
if not exist backend\data\notes    mkdir backend\data\notes
if not exist backend\data\faiss_db mkdir backend\data\faiss_db
echo [OK] Data directories ready.

echo.
echo ============================================================
echo  Setup Complete!
echo.
echo  HOW TO RUN:
echo  1. Terminal 1 ^(Backend^):
echo     cd backend ^&^& venv\Scripts\activate ^&^& uvicorn api.main:app --reload
echo.
echo  2. Terminal 2 ^(Frontend^):
echo     cd frontend ^&^& npm run dev
echo.
echo  3. Open http://localhost:5173 in your browser
echo  4. Make sure Ollama is running: ollama serve
echo ============================================================
echo.
pause
