from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "StudyBuddy AI API"
    version: str = "1.0.0"
    ollama_base_url: str = "http://localhost:11434"

settings = Settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Backend API for StudyBuddy AI platform"
)

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.llm_routes import router as llm_router
from api.upload_routes import router as upload_router
from api.chat_routes import router as chat_router
from api.math_routes import router as math_router
from api.paper_analyzer_routes import router as paper_router
from api.evaluation_routes import router as evaluation_router
from api.image_solver_routes import router as image_solver_router
from api.exam_predictor_routes import router as exam_predictor_router
from api.study_planner_routes import router as planner_router
from api.analytics_routes import router as analytics_router
from api.flashcard_routes import router as flashcard_router
from api.documents_routes import router as documents_router

app.include_router(llm_router)
app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(math_router)
app.include_router(paper_router)
app.include_router(evaluation_router)
app.include_router(image_solver_router)
app.include_router(exam_predictor_router)
app.include_router(planner_router)
app.include_router(analytics_router)
app.include_router(flashcard_router)
app.include_router(documents_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to StudyBuddy AI API", "status": "online"}
