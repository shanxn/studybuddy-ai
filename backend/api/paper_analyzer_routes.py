import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from paper_analyzer.engine import paper_analyzer_engine
from ingestion.document_processor import processor

router = APIRouter(prefix="/analyze-paper", tags=["Paper Analyzer & Diagram OCR"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "notes")

@router.post("/process")
async def process_exam_paper(file: UploadFile = File(...)):
    """Uploads a past exam paper, extracts text via processor, and ranks topics."""
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    try:
        # 1. Use existing document processor to get text (PDF, DOCX, Img OCR)
        docs = processor.process_file(file_path, {"type": "exam_paper"})
        if not docs:
            return {"status": "error", "message": "No text extracted."}
            
        full_text = "\n".join([d.page_content for d in docs])
        
        # 2. Analyze the paper details with LLM
        analysis_result = paper_analyzer_engine.analyze_paper_text(full_text)
        
        if analysis_result["status"] == "error":
            raise HTTPException(status_code=500, detail=analysis_result["message"])
            
        # 3. Predict Questions based on this single paper analysis (For MVP Demo)
        prediction_result = paper_analyzer_engine.predict_questions(analysis_result["topic_analysis"])
        
        return {
            "status": "success",
            "paper_analysis": analysis_result["topic_analysis"],
            "mock_predictions": prediction_result.get("predictions")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
