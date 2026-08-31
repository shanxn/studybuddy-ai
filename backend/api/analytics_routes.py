from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from analytics_engine.user_profile import user_profile

router = APIRouter(prefix="/analytics", tags=["Learning Analytics"])

class MasteryUpdateRequest(BaseModel):
    topic: str
    score: float

@router.get("/profile")
async def get_user_profile():
    return user_profile.get_profile()

@router.post("/update-mastery")
async def update_user_mastery(request: MasteryUpdateRequest):
    return user_profile.update_mastery(request.topic, request.score)
