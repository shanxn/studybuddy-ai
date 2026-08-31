from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List
from exam_predictor.pattern_detector import pattern_detector
import PyPDF2
import io

router = APIRouter(prefix="/exam-predictor", tags=["Exam Predictor"])

@router.post("/analyze")
async def analyze_past_papers(files: List[UploadFile] = File(...)):
    """Upload past papers (PDFs) to detect patterns and predict topics."""
    papers_text = []
    try:
        for file in files:
            contents = await file.read()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            papers_text.append(text)
            
        analysis = pattern_detector.analyze_papers(papers_text)
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
