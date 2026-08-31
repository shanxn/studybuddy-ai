from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from math_engine.solver import math_solver

router = APIRouter(prefix="/math", tags=["Math Engine"])

class MathRequest(BaseModel):
    equation: str

@router.post("/solve")
async def solve_math(request: MathRequest):
    """Parses, solves, and plots mathematical equations."""
    result = math_solver.solve_equation(request.equation)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
        
    return result
