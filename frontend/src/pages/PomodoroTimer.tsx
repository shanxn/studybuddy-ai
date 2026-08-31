import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Target, Coffee, Award, Clock } from "lucide-react";
import axios from "axios";

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    if (isWorkSession) {
      try {
        await axios.post("http://localhost:8000/analytics/log-study-session", {
          user_id: "default_user", duration_minutes: 25, topic: "Pomodoro Focus Session"
        });
      } catch { /* backend may not be running */ }
      setSessionsCompleted((p) => p + 1);
    }
    setIsWorkSession(!isWorkSession);
    setTimeLeft(!isWorkSession ? WORK_TIME : BREAK_TIME);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(isWorkSession ? WORK_TIME : BREAK_TIME); };
  const skipSession = () => { setIsActive(false); setIsWorkSession(!isWorkSession); setTimeLeft(!isWorkSession ? WORK_TIME : BREAK_TIME); };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const totalTime = isWorkSession ? WORK_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Focus Timer</h1>
        <p className="text-muted-foreground mt-2">Pomodoro technique — 25 min work / 5 min break</p>
      </div>

      {/* Main timer card */}
      <Card className="w-full max-w-xl mx-auto overflow-hidden">
        <div className={`h-1.5 w-full ${isWorkSession ? "bg-primary" : "bg-teal-500"} transition-colors duration-700`} />
        <CardContent className="p-8 flex flex-col items-center gap-8">

          {/* Status badge */}
          <div className={`flex items-center gap-2 px-5 py-1.5 rounded-full font-bold text-sm uppercase tracking-widest
            ${isWorkSession ? "bg-primary/15 text-primary" : "bg-teal-500/15 text-teal-600"}`}>
            {isWorkSession ? <><Target className="w-4 h-4" /> Deep Work</> : <><Coffee className="w-4 h-4" /> Break Time</>}
          </div>

          {/* SVG Circle Timer */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r={radius} fill="none" strokeWidth="8"
                className="stroke-muted/30" />
              <circle cx="100" cy="100" r={radius} fill="none" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ease-linear ${isWorkSession ? "stroke-primary" : "stroke-teal-500"}`} />
            </svg>
            <span className={`relative text-6xl font-black font-mono tabular-nums
              ${isWorkSession ? "text-foreground" : "text-teal-700"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-5">
            <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={resetTimer}>
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button size="icon"
              className={`w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105
                ${isWorkSession ? "bg-primary hover:bg-primary/90" : "bg-teal-500 hover:bg-teal-600"}`}
              onClick={toggleTimer}>
              {isActive
                ? <Pause className="w-7 h-7 text-white fill-white" />
                : <Play className="w-7 h-7 ml-1 text-white fill-white" />}
            </Button>
            <Button variant="ghost" className="h-12 px-5 rounded-full font-semibold" onClick={skipSession}>
              Skip →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sessions</p>
              <p className="text-3xl font-black">{sessionsCompleted}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus time</p>
              <p className="text-3xl font-black">{sessionsCompleted * 25} <span className="text-base font-medium">min</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
