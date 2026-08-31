import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, BrainCircuit, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatTutor() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am StudyBuddy AI. Ask me any question based on the notes you've uploaded, and I'll help you prepare for your exams." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState("standard");
  const [mode, setMode] = useState("Explain Mode");
  const [models, setModels] = useState<string[]>([]);
  const [currentModel, setCurrentModel] = useState("phi3:mini"); // Default

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await axios.get("http://localhost:8000/llm/models");
        if (res.data.status === "success" && res.data.models.length > 0) {
          setModels(res.data.models);
        }
        
        const curr = await axios.get("http://localhost:8000/llm/current_model");
        setCurrentModel(curr.data.model);
      } catch {
        console.error("Could not fetch models");
      }
    };
    fetchModels();
  }, []);

  const handleModelChange = async (val: string) => {
    if (!val) return;
    try {
      await axios.post("http://localhost:8000/llm/set_model", { model_name: val });
      setCurrentModel(val);
      setMessages(prev => [...prev, { role: "assistant", content: `Switched AI brain to ${val}. How can I help you?` }]);
    } catch {
      console.error("Could not switch model");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat/", {
        message: userMessage,
        format: format,
        mode: mode
      });

      setMessages(prev => [...prev, { role: "assistant", content: response.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't reach the backend server. Make sure Ollama and FastAPI are running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Tutor</h1>
          <p className="text-muted-foreground mt-2">Chat with your local AI trained on your study material.</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="w-40">
            <p className="text-xs font-semibold mb-1.5 text-muted-foreground">AI Model</p>
            <Select value={currentModel} onValueChange={(val) => handleModelChange(val || currentModel)}>
              <SelectTrigger className="bg-card/50 backdrop-blur-md">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                {models.length > 0 ? models.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                )) : (
                  <SelectItem value={currentModel}>{currentModel}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-48">
             <p className="text-xs font-semibold mb-1.5 text-muted-foreground">Format</p>
             <Select value={format} onValueChange={(v) => setFormat(v || "standard")}>
               <SelectTrigger className="bg-card/50 backdrop-blur-md">
                 <SelectValue placeholder="Format" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="standard">Standard Explanation</SelectItem>
                 <SelectItem value="2_marks">2-Marks (Concise)</SelectItem>
                 <SelectItem value="5_marks">5-Marks (Detailed)</SelectItem>
                 <SelectItem value="10_marks">10-Marks (Essay)</SelectItem>
               </SelectContent>
             </Select>
          </div>
          
          <div className="w-48">
            <p className="text-xs font-semibold mb-1.5 text-muted-foreground">Tutor Mode</p>
            <Select value={mode} onValueChange={(v) => setMode(v || "Explain Mode")}>
              <SelectTrigger className="bg-card/50 backdrop-blur-md border-emerald-500/30">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Explain Mode">Explain Mode</SelectItem>
                <SelectItem value="Exam Mode">Exam Mode</SelectItem>
                <SelectItem value="Quick Answer Mode">Quick Answer Mode</SelectItem>
                <SelectItem value="Step-by-Step Mode">Step-by-Step Mode</SelectItem>
                <SelectItem value="Socratic Mode">Socratic Mode (Tutor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-card/60 backdrop-blur-md border-border/50 shadow-xl shadow-primary/5">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-purple-500/10 text-purple-500"}`}>
                {msg.role === "user" ? <User size={20} /> : <BrainCircuit size={20} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/50 rounded-tl-sm"}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-500">
                <BrainCircuit size={20} />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-muted/50 rounded-tl-sm flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/50 bg-background/50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center"
          >
            <Input 
              placeholder="Ask a question about your syllabus..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pr-12 py-6 text-base bg-muted/50 border-input rounded-xl focus-visible:ring-primary/20"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 h-9 w-9 rounded-lg"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
