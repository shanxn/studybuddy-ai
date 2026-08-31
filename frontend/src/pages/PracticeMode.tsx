import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import axios from "axios";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

export default function PracticeMode() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const generateQuiz = async () => {
    if (!topic) return;
    setLoading(true); setError(''); setScores({}); setSelected({});
    try {
      const res = await axios.post('http://localhost:8000/learning/quiz', {
        topic, count: 5, difficulty
      }, { timeout: 30000 });
      setQuiz(res.data.quiz || []);
      if (!res.data.quiz?.length) setError('No questions generated. Try a more specific topic.');
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Could not connect to backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIdx: number, option: string, correct: string) => {
    if (scores[qIdx] !== undefined) return; // already answered
    setSelected(prev => ({ ...prev, [qIdx]: option }));
    setScores(prev => ({ ...prev, [qIdx]: option === correct }));
  };

  const totalAnswered = Object.keys(scores).length;
  const totalCorrect = Object.values(scores).filter(Boolean).length;

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Target className="w-7 h-7 text-primary" /> Endless Practice Mode
        </h1>
        <p className="text-muted-foreground mt-1">Generate unlimited AI-powered practice questions from your notes.</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <Label>Topic</Label>
              <Input
                placeholder="e.g. Photosynthesis, Newton's Laws…"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateQuiz()}
              />
            </div>
            <div className="w-40 space-y-1">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateQuiz} disabled={loading || !topic} className="w-full sm:w-auto">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</> : '▶ Start Practice'}
              </Button>
            </div>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score summary */}
      {totalAnswered > 0 && (
        <div className="flex items-center gap-4 px-5 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="font-bold text-primary text-lg">{totalCorrect}/{totalAnswered}</span>
          <span className="text-sm text-muted-foreground">answered correctly so far</span>
          <div className="ml-auto flex gap-1">
            {Array.from({ length: quiz.length }, (_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${
                scores[i] === undefined ? 'bg-muted' : scores[i] ? 'bg-emerald-500' : 'bg-red-400'
              }`} />
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      {quiz.length > 0 && (
        <div className="space-y-5">
          {quiz.map((q, idx) => (
            <Card key={idx} className={scores[idx] !== undefined
              ? scores[idx] ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'
              : ''}>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-base">{idx + 1}. {q.question}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(q.options || []).map((opt, i) => {
                    const isCorrect = opt === q.correct_answer;
                    const isChosen = selected[idx] === opt;
                    const answered = scores[idx] !== undefined;
                    let cls = 'w-full text-left p-3 rounded-lg border text-sm transition-all font-medium ';
                    if (!answered) cls += 'hover:bg-muted/50 border-border cursor-pointer';
                    else if (isCorrect) cls += 'bg-emerald-100 border-emerald-300 text-emerald-800';
                    else if (isChosen && !isCorrect) cls += 'bg-red-100 border-red-300 text-red-800';
                    else cls += 'bg-muted/40 border-border text-muted-foreground opacity-60';
                    return (
                      <button key={i} className={cls} onClick={() => handleSelect(idx, opt, q.correct_answer)}>
                        <span className="flex items-center gap-2">
                          {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {answered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {scores[idx] !== undefined && q.explanation && (
                  <div className="text-sm bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-lg">
                    💡 {q.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" className="w-full" onClick={generateQuiz}>
            🔄 Generate New Set
          </Button>
        </div>
      )}
    </div>
  );
}
