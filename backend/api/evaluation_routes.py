from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from evaluation.engine import eval_engine

router = APIRouter(prefix="/learning", tags=["Learning & Evaluation"])

class QuizRequest(BaseModel):
    topic: str
    count: int = 5
    difficulty: str = "medium"

class EvalRequest(BaseModel):
    question: str
    user_answer: str
    marks: int = 5

class GraphRequest(BaseModel):
    topic: str

@router.post("/quiz")
async def generate_quiz(request: QuizRequest):
    result = eval_engine.generate_quiz(request.topic, request.count, request.difficulty)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return result

@router.post("/evaluate")
async def evaluate_answer(request: EvalRequest):
    result = eval_engine.evaluate_answer(request.question, request.user_answer, request.marks)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return result

@router.post("/knowledge-graph")
async def get_knowledge_graph(request: GraphRequest):
    result = eval_engine.generate_knowledge_graph(request.topic)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return result
