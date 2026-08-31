from rag.llm_manager import llm_manager
from langchain_core.prompts import PromptTemplate
import json
from rag.flashcard_db import flashcard_db

class AutoSummarizer:
    def __init__(self):
        self.llm = llm_manager.get_llm()

    def generate_revision_assets(self, text: str, source: str = "Unknown", topic: str = "General") -> dict:
        """Generates summary, flashcards, and revision notes from ingested text."""
        # Truncate text if too long to avoid token limits for summary
        text_chunk = text[:4000] if len(text) > 4000 else text
        
        prompt = PromptTemplate(
            template="""You are an expert tutor. Create revision assets based on the text below.
Format your response as a pure JSON object containing:
1. "summary": A very short 2-3 sentence overview.
2. "flashcards": An array of objects, e.g., [{{"front": "concept", "back": "definition"}}]. Provide 3 flashcards.
3. "revision_notes": 3 bullet points with the most critical facts.

Text: {text}

JSON Response:""",
            input_variables=["text"]
        )
        
        chain = prompt | self.llm
        try:
            res = chain.invoke({"text": text_chunk})
            json_str = res.content.replace('```json', '').replace('```', '').strip()
            parsed_data = json.loads(json_str)
            
            # Save the flashcards to the database
            if "flashcards" in parsed_data and isinstance(parsed_data["flashcards"], list):
                flashcard_db.add_deck(topic, source, parsed_data["flashcards"])
                
            return {"status": "success", "assets": parsed_data}
        except Exception as e:
            return {"status": "error", "message": str(e)}

auto_summarizer = AutoSummarizer()
