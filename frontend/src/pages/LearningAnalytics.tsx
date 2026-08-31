import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Flame, BookCheck, BarChart2, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LearningAnalytics() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:8000/analytics/profile', { timeout: 8000 });
        setProfile(res.data.profile);
      } catch {
        setError('Could not connect to backend. Start the server to see your analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (error || !profile) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
      <AlertCircle className="w-10 h-10" />
      <p className="text-center max-w-sm">{error || 'No analytics data yet. Upload notes and answer questions to start tracking your progress.'}</p>
    </div>
  );

  const trendData = (profile.accuracy_trend || []).map((val: number, idx: number) => ({
    name: `Q${idx + 1}`, accuracy: val
  }));

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Learning Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your topic mastery and exam readiness over time.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Exam Readiness', value: `${profile.exam_readiness ?? 0}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
          { label: 'Study Streak', value: `🔥 ${profile.study_streak ?? 0} days`, icon: Flame, color: 'text-orange-600 bg-orange-100' },
          { label: 'Topics Mastered', value: (profile.strong_topics || []).length, icon: BookCheck, color: 'text-emerald-600 bg-emerald-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color}`}><Icon className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black mt-0.5">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Accuracy Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Topic Mastery</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(profile.topic_mastery || {}).slice(0, 6).map(([topic, score]: [string, any]) => (
              <div key={topic} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate">{topic}</span>
                  <span className="text-muted-foreground text-xs shrink-0 ml-2">{score}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
