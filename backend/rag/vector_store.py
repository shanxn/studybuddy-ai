import os
import threading
from typing import Optional
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from rag.llm_manager import llm_manager

VECTOR_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "data", "vectors")
os.makedirs(VECTOR_DIR, exist_ok=True)
INDEX_PATH = os.path.join(VECTOR_DIR, "index")

class VectorStoreManager:
    def __init__(self):
        self.embeddings = llm_manager.get_embeddings()
        self.vector_store: Optional[FAISS] = None
        self._lock = threading.Lock()
        self._load_or_create_index()

    def _load_or_create_index(self):
        """Loads existing FAISS index or initializes a new one if it doesn't exist."""
        with self._lock:
            if os.path.exists(os.path.join(INDEX_PATH, "index.faiss")):
                print(f"Loading existing FAISS index from {INDEX_PATH}")
                self.vector_store = FAISS.load_local(
                    folder_path=INDEX_PATH,
                    embeddings=self.embeddings,
                    allow_dangerous_deserialization=True  # Trusted local environment
                )
            else:
                print("No existing index found. Will initialize upon first document insertion.")
            
    def add_documents(self, documents: list[Document]):
        """Adds chunked documents to the FAISS vector store and saves it."""
        if not documents:
            return

        with self._lock:
            vs = self.vector_store
            if vs is None:
                self.vector_store = FAISS.from_documents(documents, self.embeddings)
            else:
                vs.add_documents(documents)  # type: ignore[union-attr]

            # Save to disk
            if self.vector_store is not None:
                self.vector_store.save_local(INDEX_PATH)  # type: ignore[union-attr]

    def similarity_search(self, query: str, k: int = 4, filter: Optional[dict] = None) -> list[Document]:
        """Searches the vector database for the most relevant documents."""
        with self._lock:
            vs = self.vector_store
            if vs is None:
                return []
                
            kwargs: dict = {}
            if filter:
                kwargs["filter"] = filter
                
            return vs.similarity_search(query, k=k, **kwargs)

    def similarity_search_with_score(self, query: str, k: int = 4, filter: Optional[dict] = None):
        """Returns (Document, float) pairs — FAISS L2 score (lower = more relevant)."""
        with self._lock:
            vs = self.vector_store
            if vs is None:
                return []

            kwargs: dict = {}
            if filter:
                kwargs["filter"] = filter

            return vs.similarity_search_with_score(query, k=k, **kwargs)

vector_store_manager = VectorStoreManager()
