from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from rag.vector_store import vector_store_manager
from rag.llm_manager import llm_manager
from langchain_core.prompts import ChatPromptTemplate

router = APIRouter(prefix="/chat", tags=["AI Tutor & RAG"])

class ChatRequest(BaseModel):
    message: str
    mode: str = "Explain Mode"
    format: str = "standard"
    subject: Optional[str] = None

# System instructions per mode — context is injected at runtime
SYSTEM_TEMPLATES = {
    "Explain Mode": (
        "You are StudyBuddy AI, a strict personal tutor.\n"
        "You MUST answer ONLY from the Context provided. "
        "Do NOT use any pre-trained knowledge outside the context.\n"
        "If the answer is not in the Context, reply with EXACTLY: NOT_IN_NOTES\n\n"
        "Context:\n{context}"
    ),
    "Exam Mode": (
        "You are StudyBuddy AI, a strict exam examiner.\n"
        "Answer ONLY using the Context below. Emphasise key terms and marking criteria.\n"
        "If the answer is not in the Context, reply with EXACTLY: NOT_IN_NOTES\n\n"
        "Context:\n{context}"
    ),
    "Quick Answer Mode": (
        "You are StudyBuddy AI. Give the direct answer in 1-2 sentences "
        "based ONLY on the Context below.\n"
        "If the answer is not in the Context, reply with EXACTLY: NOT_IN_NOTES\n\n"
        "Context:\n{context}"
    ),
    "Step-by-Step Mode": (
        "You are StudyBuddy AI. Break down the answer into clear numbered steps "
        "based ONLY on the Context below.\n"
        "If the answer is not in the Context, reply with EXACTLY: NOT_IN_NOTES\n\n"
        "Context:\n{context}"
    ),
    "Socratic Mode": (
        "You are StudyBuddy AI, a Socratic tutor.\n"
        "Do NOT give the direct answer. Ask ONE guiding question that helps the student "
        "figure out the answer from the Context below.\n"
        "If the topic is not in the Context, reply with EXACTLY: NOT_IN_NOTES\n\n"
        "Context:\n{context}"
    ),
}

# FAISS L2 threshold — for all-MiniLM-L6-v2 with short notes, scores range 1.4-1.7
FAISS_THRESHOLD = 1.55
NOT_FOUND_MSG = "⚠️ This topic is not covered in your uploaded study material. Please upload relevant notes first."


@router.post("/")
async def ask_tutor(request: ChatRequest):
    """RAG-grounded AI tutor using ChatOllama with proper system/human message format."""
    filter_dict = {"subject": request.subject} if request.subject else None

    try:
        scored_docs = vector_store_manager.similarity_search_with_score(request.message, k=5, filter=filter_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database search failed: {str(e)}")

    # Layer 1: Hard FAISS gate — block clearly unrelated queries immediately
    if not scored_docs or scored_docs[0][1] > FAISS_THRESHOLD:
        return {"answer": NOT_FOUND_MSG, "sources": [], "mode_used": request.mode}

    docs = [doc for doc, _ in scored_docs]
    context_text = "\n\n".join([doc.page_content for doc in docs])
    sources = list(set([doc.metadata.get("source", "Unknown") for doc in docs]))

    # Layer 2: ChatPromptTemplate — system message holds context+rules, human message is just the question
    system_template = SYSTEM_TEMPLATES.get(request.mode, SYSTEM_TEMPLATES["Explain Mode"])
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_template),
        ("human", "{question}"),
    ])

    llm = llm_manager.get_llm()
    chain = prompt | llm

    try:
        response = chain.invoke({"context": context_text, "question": request.message})
        answer_text = response.content.strip()

        # Layer 3: Intercept NOT_IN_NOTES marker if LLM signals the topic is out of scope
        if answer_text.startswith("NOT_IN_NOTES"):
            return {"answer": NOT_FOUND_MSG, "sources": [], "mode_used": request.mode}

        return {"answer": answer_text, "sources": sources, "mode_used": request.mode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Generation failed: {str(e)}")
