import { useState } from 'react';
import { Calendar, LayoutList, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

interface DayPlan {
  day: number;
  date: string;
  focus: string;
  tasks: string[];
}

interface Plan {
  days_until_exam: number;
  plan: DayPlan[];
}

export default function StudyPlanner() {
  const [examDate, setExamDate] = useState('');
  const [topics, setTopics] = useState('Calculus, Physics');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePlan = async () => {
    if (!examDate) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/planner/generate', {
        weak_topics: topics.split(',').map(t => t.trim()),
        exam_date: examDate
      }, { timeout: 30000 });
      setPlan(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Could not connect to backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Study Planner</h1>
        <p className="text-muted-foreground mt-1">Generate a personalized daily schedule mapped to your weak areas and exam date.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Exam Date</Label>
              <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Topics to Focus On <span className="text-muted-foreground text-xs">(comma separated)</span></Label>
              <Input type="text" value={topics} onChange={e => setTopics(e.target.value)}
                placeholder="e.g. Kinematics, Integrals, Thermodynamics" />
            </div>
          </div>
          <Button onClick={generatePlan} disabled={loading || !examDate} className="mt-5 w-full">
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Smart Plan…</>
              : <><Calendar className="w-4 h-4 mr-2" /> Generate AI Study Plan</>}
          </Button>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {plan && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-lg font-medium">
            <LayoutList className="w-5 h-5" />
            <span>{plan.days_until_exam} days until your exam — you've got this! 💪</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(plan.plan || []).map((day) => (
              <Card key={day.day} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold">Day {day.day}</h3>
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600">Focus: {day.focus}</p>
                  <ul className="space-y-1">
                    {(day.tasks || []).map((task, i) => (
                      <li key={i} className="flex gap-2 items-start text-sm text-muted-foreground">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
