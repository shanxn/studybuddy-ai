import os
from langchain_ollama import ChatOllama
from langchain_huggingface import HuggingFaceEmbeddings

class LLMManager:
    def __init__(self, model_name: str = "phi3:mini", ollama_base_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.ollama_base_url = ollama_base_url
        self.llm = self._initialize_llm()
        self.embeddings = self._initialize_embeddings()

    def _initialize_llm(self):
        """Initialize the local Ollama LLM."""
        return ChatOllama(
            base_url=self.ollama_base_url,
            model=self.model_name,
            temperature=0.2, # Low temperature for factual RAG responses
        )

    def _initialize_embeddings(self):
        """Initialize the sentence-transformer embeddings model."""
        # all-MiniLM-L6-v2 is fast and effective for local semantic search
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}, # Use CPU for embedding generation
            encode_kwargs={'normalize_embeddings': True}
        )

    def get_llm(self):
        return self.llm
        
    def get_embeddings(self):
        return self.embeddings

    def set_model(self, model_name: str):
        self.model_name = model_name
        self.llm = self._initialize_llm()
        return self.model_name

# Singleton instance to be used across the app
llm_manager = LLMManager()
