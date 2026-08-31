import os
import shutil
import re
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import Optional
from ingestion.document_processor import processor
from rag.vector_store import vector_store_manager
from rag.auto_summarizer import auto_summarizer
from formula_database.extractor import formula_extractor
from db.document_registry import document_registry

router = APIRouter(prefix="/upload", tags=["Knowledge Ingestion"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "notes")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ─── Background helpers (slow LLM calls run after the HTTP response is sent) ─

def _run_background_processing(full_text: str, source: str, topic: str):
    """Called in background after response is already returned to the user."""
    try:
        formula_extractor.extract_and_store(full_text, source=source)
    except Exception as e:
        print(f"[BG] Formula extraction error: {e}")
    try:
        auto_summarizer.generate_revision_assets(full_text, source=source, topic=topic)
    except Exception as e:
        print(f"[BG] Auto-summarizer error: {e}")


# ─── File upload ───────────────────────────────────────────────────────────

@router.post("/")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    subject: str = Form(...),
    unit: str = Form(...),
    topic: str = Form(...),
    difficulty: Optional[str] = Form("medium"),
    marks_weightage: Optional[int] = Form(0),
):
    """
    Upload a study file (PDF / DOCX / TXT / image).
    Returns quickly after embedding; summarisation runs in the background.
    """
    filename = file.filename or "upload"
    if not filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    file_path = os.path.join(UPLOAD_DIR, filename)

    # 1. Save file to disk
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    metadata = {
        "subject": subject, "unit": unit, "topic": topic,
        "difficulty": difficulty, "marks_weightage": marks_weightage,
    }

    # 2. Text extraction + chunking (fast — no LLM)
    try:
        documents = processor.process_file(file_path, metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {e}")

    if not documents:
        return {"status": "warning", "message": "No text could be extracted from the file."}

    # 3. Embedding + FAISS (may be slow on first-ever call while model downloads)
    try:
        vector_store_manager.add_documents(documents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding/FAISS error: {e}")

    # 4. Persist metadata to SQLite immediately (fast)
    full_text = "\n".join([doc.page_content for doc in documents])
    document_registry.add_document(
        name=filename,
        source_type="file",
        subject=subject,
        unit=unit,
        topic=topic,
        difficulty=difficulty or "medium",
        marks_weight=marks_weightage or 0,
        chunks=len(documents),
    )

    # 5. Heavy LLM work (formula extraction + summarisation) runs AFTER response
    background_tasks.add_task(_run_background_processing, full_text, filename, topic)

    return {
        "status": "success",
        "message": f"✅ Embedded {len(documents)} chunks from '{filename}'. AI summary generating in background.",
        "chunks_created": len(documents),
    }


# ─── YouTube URL endpoint ──────────────────────────────────────────────────

def _extract_video_id(url: str) -> str:
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    return match.group(1) if match else url


@router.post("/youtube")
async def ingest_youtube(
    background_tasks: BackgroundTasks,
    url: str = Form(...),
    subject: str = Form(...),
    unit: str = Form(...),
    topic: str = Form(...),
    difficulty: Optional[str] = Form("medium"),
    marks_weightage: Optional[int] = Form(0),
):
    """Ingest a YouTube transcript. Returns after embedding; summarisation is background."""
    video_id = _extract_video_id(url)
    metadata = {
        "subject": subject, "unit": unit, "topic": topic,
        "difficulty": difficulty, "marks_weightage": marks_weightage,
    }

    try:
        documents = processor.process_file(f"youtube:{video_id}", metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcript extraction failed: {e}")

    if not documents:
        return {"status": "warning", "message": "No transcript could be extracted."}

    try:
        vector_store_manager.add_documents(documents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding/FAISS error: {e}")

    full_text = "\n".join([doc.page_content for doc in documents])
    source_name = f"YouTube: {video_id}"

    document_registry.add_document(
        name=source_name,
        source_type="youtube",
        subject=subject,
        unit=unit,
        topic=topic,
        difficulty=difficulty or "medium",
        marks_weight=marks_weightage or 0,
        chunks=len(documents),
    )

    background_tasks.add_task(_run_background_processing, full_text, source_name, topic)

    return {
        "status": "success",
        "message": f"✅ Embedded {len(documents)} chunks from YouTube '{video_id}'. AI summary generating in background.",
        "chunks_created": len(documents),
    }
