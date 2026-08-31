import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Library, ChevronLeft, ChevronRight, RotateCcw, AlertCircle } from "lucide-react";
import axios from "axios";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastery_level: number;
}

interface Deck {
  id: string;
  topic: string;
  source: string;
  card_count: number;
}

export default function Flashcards() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get("http://localhost:8000/flashcards/decks", { timeout: 8000 });
      setDecks(res.data.decks || []);
    } catch {
      setError('Cannot connect to backend. Start the server and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDeck = async (deckId: string) => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`http://localhost:8000/flashcards/decks/${deckId}`, { timeout: 8000 });
      setCards(res.data.deck.cards || []);
      setActiveDeckId(deckId);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch {
      setError('Failed to load deck.');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150); // slight delay for flip-back animation
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
    }, 150);
  };

  const updateMastery = async (level: number) => {
    if (!activeDeckId || cards.length === 0) return;
    
    const currentCard = cards[currentIndex];
    try {
      await axios.put(`http://localhost:8000/flashcards/decks/${activeDeckId}/cards/${currentCard.id}/mastery`, {
        mastery_level: level
      });
      // Optionally update local state
      const newCards = [...cards];
      newCards[currentIndex].mastery_level = level;
      setCards(newCards);
      nextCard();
    } catch (error) {
      console.error("Failed to update mastery:", error);
    }
  };

  if (loading && !activeDeckId) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !activeDeckId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
        <AlertCircle className="w-10 h-10" />
        <p className="text-center">{error}</p>
        <Button variant="outline" onClick={fetchDecks}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Flashcards</h1>
        <p className="text-muted-foreground mt-2">Interactive study decks auto-generated from your knowledge base and YouTube lectures.</p>
      </div>

      {!activeDeckId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.length === 0 ? (
            <div className="col-span-full p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
              <Library className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium text-lg text-foreground">No flashcards yet.</p>
              <p>Upload a note or YouTube video to let the AI automatically generate flashcards for you!</p>
            </div>
          ) : (
            decks.map((deck) => (
              <Card 
                key={deck.id} 
                className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg bg-card/60 backdrop-blur-md"
                onClick={() => loadDeck(deck.id)}
              >
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-1 truncate">{deck.topic}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-1">Source: {deck.source}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {deck.card_count} Cards
                    </span>
                    <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                      Study <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => setActiveDeckId(null)}>
            <ChevronLeft className="mr-2 w-4 h-4" /> Back to Decks
          </Button>

          {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span className="flex items-center gap-2"><Library className="w-4 h-4" /> {decks.find(d => d.id === activeDeckId)?.topic}</span>
              </div>

              {/* 3D Flip Card Container */}
              <div 
                className="relative w-full aspect-[4/3] cursor-pointer group perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div 
                  className={`w-full h-full duration-500 preserve-3d relative transition-transform shadow-xl ${isFlipped ? "rotate-y-180" : ""}`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-white border border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                    <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">FRONT</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{cards[currentIndex]?.front}</h2>
                    <p className="absolute bottom-6 text-sm text-muted-foreground flex items-center gap-2 animate-pulse">
                      <RotateCcw className="w-4 h-4" /> Click to flip
                    </p>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-50 border border-indigo-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                    <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-indigo-400">BACK</span>
                    <div className="overflow-y-auto max-h-[80%] custom-scrollbar">
                      <p className="text-lg md:text-xl font-medium text-indigo-900 leading-relaxed">
                        {cards[currentIndex]?.back}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-4 mt-8">
                {isFlipped ? (
                  <div className="grid grid-cols-4 gap-2 animate-in slide-in-from-bottom-2">
                    <Button variant="outline" className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200" onClick={(e) => { e.stopPropagation(); updateMastery(0); }}>Again (1m)</Button>
                    <Button variant="outline" className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200" onClick={(e) => { e.stopPropagation(); updateMastery(1); }}>Hard (10m)</Button>
                    <Button variant="outline" className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200" onClick={(e) => { e.stopPropagation(); updateMastery(2); }}>Good (1d)</Button>
                    <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200" onClick={(e) => { e.stopPropagation(); updateMastery(3); }}>Easy (4d)</Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center px-4">
                    <Button variant="ghost" onClick={(e) => { e.stopPropagation(); prevCard(); }}><ChevronLeft className="mr-2" /> Prev Card</Button>
                    <Button variant="outline" className="rounded-full shadow-sm" onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}>Show Answer</Button>
                    <Button variant="ghost" onClick={(e) => { e.stopPropagation(); nextCard(); }}>Next Card <ChevronRight className="ml-2" /></Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
