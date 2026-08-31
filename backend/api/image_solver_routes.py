from fastapi import APIRouter, File, UploadFile, HTTPException
from image_solver.ocr_engine import ocr_engine
from image_solver.graph_analyzer import graph_analyzer
from math_engine.solver import math_solver

router = APIRouter(prefix="/image-solver", tags=["Image Solvers"])

@router.post("/solve")
async def solve_image_equation(file: UploadFile = File(...)):
    """Upload an equation image, OCR it, and solve."""
    try:
        contents = await file.read()
        extracted_text = ocr_engine.extract_math_from_image(contents)
        
        if not extracted_text:
            raise HTTPException(status_code=400, detail="Could not detect any text/equations in the image.")
            
        result = math_solver.solve_equation(extracted_text)
        result["extracted_text"] = extracted_text
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-graph")
async def analyze_graph_image(file: UploadFile = File(...)):
    """Upload a graph and process shape / curves using CV2."""
    try:
        contents = await file.read()
        analysis = graph_analyzer.analyze_graph_image(contents)
        return {"status": "success", "data": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
