"""Diagnose FAISS L2 scores to calibrate the relevance threshold."""
import sys, os
sys.path.insert(0, r"d:\AI-study\studybuddy-ai\backend")

from rag.vector_store import vector_store_manager

queries = [
    "tell me about videogames",
    "what is locking in databases?",
    "photosynthesis in plants",
    "what is a mutex?",
]

for q in queries:
    result = vector_store_manager.similarity_search_with_score(q, k=3)
    scores = [round(score, 4) for _, score in result]
    print(f"Q: {q!r:50s}  best={scores[0] if scores else 'N/A'}  all={scores}")
