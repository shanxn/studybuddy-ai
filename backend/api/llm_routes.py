from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/llm", tags=["LLM"])

OLLAMA_BASE_URL = "http://localhost:11434"

@router.get("/models")
async def get_available_models():
    """Fetch available models from the local Ollama instance."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2.0)
            if response.status_code == 200:
                models = response.json().get("models", [])
                return {"status": "success", "models": [m["name"] for m in models]}
            return {"status": "error", "message": "Failed to fetch from Ollama"}
    except Exception as e:
        return {"status": "error", "message": f"Ollama is not running or accessible. {str(e)}"}

from pydantic import BaseModel
from rag.llm_manager import llm_manager

class ModelRequest(BaseModel):
    model_name: str

@router.post("/set_model")
def set_active_model(req: ModelRequest):
    try:
        updated = llm_manager.set_model(req.model_name)
        return {"status": "success", "message": f"Active model set to {updated}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/current_model")
def get_active_model():
    return {"status": "success", "model": llm_manager.model_name}
