from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from rag.flashcard_db import flashcard_db

router = APIRouter(prefix="/flashcards", tags=["Flashcards API"])

@router.get("/decks")
async def get_all_decks():
    """Retrieve all available flashcard decks."""
    try:
        decks = flashcard_db.get_all_decks()
        return {"status": "success", "decks": decks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/decks/{deck_id}")
async def get_deck(deck_id: str):
    """Retrieve a specific deck of flashcards."""
    deck = flashcard_db.get_deck(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return {"status": "success", "deck": deck}

@router.put("/decks/{deck_id}/cards/{card_id}/mastery")
async def update_mastery(deck_id: str, card_id: str, payload: Dict[str, int]):
    """Update the mastery level of a specific card (0-3)."""
    new_level = payload.get("mastery_level")
    if new_level is None or not (0 <= new_level <= 3):
        raise HTTPException(status_code=400, detail="mastery_level must be an integer between 0 and 3")
        
    success = flashcard_db.update_card_mastery(deck_id, card_id, new_level)
    if not success:
        raise HTTPException(status_code=404, detail="Deck or Card not found")
        
    return {"status": "success", "message": "Mastery updated"}
