import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, FileText, CheckCircle2, TrendingUp, BookOpen } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back to StudyBuddy AI. Here is your study progress.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes Processed</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Tutor Interactions</CardTitle>
            <BrainCircuit className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">Topics: ML, React, Calc</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Syllabus Coverage</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <Progress value={68} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exam Readiness Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2/10</div>
            <p className="text-xs text-muted-foreground">Based on mock tests</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Topic Mastery</CardTitle>
            <CardDescription>Your performance across recent quizzes and paper analyses.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            {/* Future Recharts Visualization here */}
            Radar Chart Placeholder
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>Based on your weak areas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center p-3 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
              <BookOpen className="h-5 w-5 text-primary mr-4" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Review: Calculus Derivatives</p>
                <p className="text-xs text-muted-foreground">You scored 40% on the last mock exam.</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
              <FileText className="h-5 w-5 text-purple-500 mr-4" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Upload: Unit 4 Notes</p>
                <p className="text-xs text-muted-foreground">Missing from your knowledge base.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
