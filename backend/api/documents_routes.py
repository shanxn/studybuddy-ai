"""
documents_routes.py  —  REST API for browsing the persistent document registry.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from db.document_registry import document_registry

router = APIRouter(prefix="/documents", tags=["Document Registry"])


@router.get("/")
async def list_documents(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    q: Optional[str] = Query(None, description="Full-text search in name / topic / subject"),
):
    """Return all persisted documents, optionally filtered."""
    if q:
        docs = document_registry.search(q)
    elif subject:
        docs = document_registry.get_by_subject(subject)
    else:
        docs = document_registry.get_all()
    return {"status": "success", "total": len(docs), "documents": docs}


@router.delete("/{doc_id}")
async def delete_document(doc_id: int):
    """Remove a document record from the registry (does NOT delete the file or FAISS chunks)."""
    deleted = document_registry.delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "success", "message": f"Document {doc_id} removed from registry"}
