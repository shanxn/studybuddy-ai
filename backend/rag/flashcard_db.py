import os
import json
import threading
from uuid import uuid4
from typing import List, Dict

class FlashcardDatabase:
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Default to the data directory
            self.db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "flashcards_db.json")
        else:
            self.db_path = db_path
            
        self._lock = threading.Lock()
        self._ensure_db_exists()

    def _ensure_db_exists(self):
        with self._lock:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            if not os.path.exists(self.db_path):
                with open(self.db_path, "w", encoding="utf-8") as f:
                    json.dump({"decks": {}}, f)

    def _load_db(self) -> dict:
        with self._lock:
            with open(self.db_path, "r", encoding="utf-8") as f:
                return json.load(f)

    def _save_db(self, data: dict):
        with self._lock:
            with open(self.db_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)

    def add_deck(self, topic: str, source: str, cards: List[Dict[str, str]]) -> str:
        """
        Adds a new deck of flashcards to the database.
        cards expected format: [{"front": "Q...", "back": "A..."}, ...]
        """
        db = self._load_db()
        deck_id = str(uuid4())
        
        # Add IDs to individual cards for tracking later if needed
        processed_cards = []
        for card in cards:
            processed_cards.append({
                "id": str(uuid4()),
                "front": card.get("front", ""),
                "back": card.get("back", ""),
                "mastery_level": 0 # 0=New, 1=Learning, 2=Review, 3=Mastered
            })
            
        db["decks"][deck_id] = {
            "topic": topic,
            "source": source,
            "created_at": str(os.path.getctime(self.db_path)),
            "cards": processed_cards
        }
        
        self._save_db(db)
        return deck_id

    def get_all_decks(self) -> List[dict]:
        db = self._load_db()
        decks = []
        for deck_id, deck_data in db.get("decks", {}).items():
            decks.append({
                "id": deck_id,
                "topic": deck_data.get("topic", "Unknown"),
                "source": deck_data.get("source", "Unknown"),
                "card_count": len(deck_data.get("cards", []))
            })
        return decks

    def get_deck(self, deck_id: str) -> dict:
        db = self._load_db()
        return db.get("decks", {}).get(deck_id, None)

    def update_card_mastery(self, deck_id: str, card_id: str, new_level: int):
        db = self._load_db()
        deck = db.get("decks", {}).get(deck_id)
        if deck:
            for card in deck.get("cards", []):
                if card.get("id") == card_id:
                    # constrain to 0-3
                    card["mastery_level"] = max(0, min(3, new_level))
                    self._save_db(db)
                    return True
        return False

flashcard_db = FlashcardDatabase()
