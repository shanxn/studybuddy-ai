from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from study_planner.planner_logic import planner_logic

router = APIRouter(prefix="/planner", tags=["Study Planner"])

class PlannerRequest(BaseModel):
    weak_topics: List[str]
    exam_date: str

@router.post("/generate")
async def generate_study_plan(request: PlannerRequest):
    result = planner_logic.generate_plan(request.weak_topics, request.exam_date)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result
