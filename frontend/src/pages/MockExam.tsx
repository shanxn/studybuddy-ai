import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Loader2, Target } from "lucide-react";
import axios from "axios";

export default function MockExam() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<{question: string; options: string[]; correct_answer: string; explanation: string}[]>([]);
  const [started, setStarted] = useState(false);
  
  // Quiz taking state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const startExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/learning/quiz", { topic, count: 5, difficulty });
      setQuiz(res.data.quiz || []);
      setStarted(true);
      setShowResults(false);
      setSelectedAnswers({});
      setCurrentIdx(0);
    } catch {
      alert("Failed to generate exam. Ensure backend and DB have context for this topic.");
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_answer) score++;
    });
    return score;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mock Exam Simulator</h1>
        <p className="text-muted-foreground mt-2">Generate adaptive quizzes based on your exact study materials.</p>
      </div>

      {!started ? (
        <Card className="bg-card/60 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="text-primary h-5 w-5" />
              <span>Configure Exam</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={startExam} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic or Subject</label>
                <Input 
                  placeholder="e.g. Operating Systems" 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v || "medium")}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy Foundation</SelectItem>
                    <SelectItem value="medium">Medium Standard</SelectItem>
                    <SelectItem value="hard">Hard Analytical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={!topic || loading} className="w-full h-12 text-lg mt-4">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <GraduationCap className="h-5 w-5 mr-2" />}
                Generate & Start Exam
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : showResults ? (
        <Card className="bg-card/60 backdrop-blur-md border-primary/50 shadow-lg shadow-primary/10 animate-in zoom-in-95 duration-500">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-primary">{calculateScore()}/{quiz.length}</span>
            </div>
            <CardTitle className="text-2xl">Exam Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {quiz.map((q, idx) => {
              const uAns = selectedAnswers[idx];
              const isCorrect = uAns === q.correct_answer;
              return (
                <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <p className="font-medium mb-3">{idx+1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {q.options.map((opt: string) => (
                      <div key={opt} className={`p-2 rounded-md ${opt === q.correct_answer ? 'bg-green-500/20 text-green-700 font-semibold' : opt === uAns ? 'bg-red-500/20 text-red-700' : 'bg-background'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground pt-3 border-t border-border/50">
                    <span className="font-semibold text-foreground">Explanation: </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setStarted(false)} className="w-full h-12">Take Another Exam</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="bg-card/60 backdrop-blur-md border-border/50 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-1 bg-primary transition-all duration-300"
            style={{ width: `${((currentIdx) / quiz.length) * 100}%` }}
          />
          <CardHeader>
            <div className="text-sm font-medium text-muted-foreground mb-2">Question {currentIdx + 1} of {quiz.length}</div>
            <CardTitle className="leading-normal">{quiz[currentIdx]?.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quiz[currentIdx]?.options.map((option: string, idx: number) => {
               const isSelected = selectedAnswers[currentIdx] === option;
               return (
                 <div 
                   key={idx} 
                   onClick={() => setSelectedAnswers(prev => ({...prev, [currentIdx]: option}))}
                   className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10' : 'border-muted bg-muted/30 hover:border-primary/50'}`}
                 >
                   <div className="flex items-center space-x-3">
                     <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-muted-foreground'}`}>
                       {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                     </div>
                     <span>{option}</span>
                   </div>
                 </div>
               )
            })}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/50 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
            >
              Previous
            </Button>
            
            {currentIdx === quiz.length - 1 ? (
              <Button 
                onClick={() => setShowResults(true)} 
                className="bg-green-600 hover:bg-green-700"
                disabled={!selectedAnswers[currentIdx]}
              >
                Submit Exam
              </Button>
            ) : (
              <Button 
                onClick={() => setCurrentIdx(p => Math.min(quiz.length - 1, p + 1))}
                disabled={!selectedAnswers[currentIdx]}
              >
                Next Question
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
