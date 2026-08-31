import { useState } from 'react';
import { TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

export default function ExamPredictor() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files?.length) return;
    setLoading(true); setError('');
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    try {
      const res = await axios.post('http://localhost:8000/exam-predict/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Could not connect to backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const confidence_color = (c: number) =>
    c >= 75 ? 'bg-red-100 text-red-700' : c >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-primary" /> Exam Predictor
        </h1>
        <p className="text-muted-foreground mt-1">Upload past exam papers or notes to predict likely exam topics and their probability.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Upload Past Papers / Notes (PDF / DOCX / TXT)</Label>
              <Input type="file" accept=".pdf,.docx,.txt" multiple
                onChange={e => setFiles(e.target.files)} />
            </div>
            <Button type="submit" disabled={loading || !files?.length} className="w-full">
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analysing Papers…</>
                : <><TrendingUp className="w-4 h-4 mr-2" /> Predict Exam Topics</>}
            </Button>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {result.predicted_topics?.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-bold text-lg">Predicted High-Probability Topics</h2>
                <div className="space-y-3">
                  {result.predicted_topics.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium text-sm">{item.topic}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${confidence_color(item.confidence ?? item.probability ?? 50)}`}>
                        {item.confidence ?? item.probability ?? '?'}% likely
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {result.advice && (
            <Card className="bg-blue-50/50 border-blue-100">
              <CardContent className="p-5">
                <p className="text-sm text-blue-800 leading-relaxed">💡 {result.advice}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
