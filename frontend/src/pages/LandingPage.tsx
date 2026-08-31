import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit, BookOpen, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background abstract gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full point-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full point-events-none" />
      
      {/* Navbar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-border/40 backdrop-blur-md relative z-10">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold tracking-tight">StudyBuddy <span className="text-primary">AI</span></span>
        </div>
        <nav className="flex items-center space-x-6">
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link to="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
          <Link to="/dashboard">
            <Button className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">Launch Platform</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-4 py-1.5 border border-border/50 backdrop-blur-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">100% Local. 100% Private.</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Your Personal AI Tutor for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Exam Preparation
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload notes, solve math equations, analyze past papers, and generate adaptive quizzes—all powered by open-source AI models running locally on your machine.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-primary/20 hover:bg-primary/5 transition-colors">
              View GitHub
            </Button>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24">
          <div className="bg-card/40 border border-border/50 p-6 rounded-2xl backdrop-blur-sm hover:border-primary/50 transition-colors text-left flex flex-col">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">RAG Knowledge Base</h3>
            <p className="text-muted-foreground flex-1">Upload PDFs, DOCX, and images. Our AI reads your exact syllabus and notes to answer questions factually.</p>
          </div>
          <div className="bg-card/40 border border-border/50 p-6 rounded-2xl backdrop-blur-sm hover:border-primary/50 transition-colors text-left flex flex-col">
            <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-500">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Paper Analyzer</h3>
            <p className="text-muted-foreground flex-1">Upload previous year exam papers. Automatically extract important topics, predict future questions, and calculate marks weightage.</p>
          </div>
          <div className="bg-card/40 border border-border/50 p-6 rounded-2xl backdrop-blur-sm hover:border-primary/50 transition-colors text-left flex flex-col">
            <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 text-green-500">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Locally Hosted</h3>
            <p className="text-muted-foreground flex-1">Uses Ollama to run Phi-3 and Llama 3 directly on your laptop. No API fees, no internet needed, complete privacy.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
