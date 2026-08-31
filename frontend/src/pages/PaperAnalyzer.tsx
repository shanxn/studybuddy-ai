import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, File, Loader2, Sparkles, TrendingUp } from "lucide-react";
import axios from "axios";

export default function PaperAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{status: string; message?: string; paper_analysis?: {topic: string; frequency_percentage: number; total_marks: number}[]; mock_predictions?: string} | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/analyze-paper/process", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
      setFile(null);
    } catch (error) {
      const err = error as {response?: {data?: {detail?: string}}};
      setResult({ status: "error", message: err.response?.data?.detail || "Analysis failed." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paper Analyzer</h1>
        <p className="text-muted-foreground mt-2">Upload past exam papers. The AI will extract key topics, weightage, and predict future questions.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Upload Column */}
        <Card className="md:col-span-1 bg-card/60 backdrop-blur-md border-border/50 h-fit">
          <form onSubmit={handleUpload}>
            <CardHeader>
              <CardTitle>Analyze New Paper</CardTitle>
              <CardDescription>Upload a PDF exam paper.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 text-center border-2 border-dashed border-border rounded-xl p-6">
                {file ? (
                  <>
                    <div className="h-12 w-12 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                      <File size={24} />
                    </div>
                    <p className="font-medium text-sm truncate w-full">{file.name}</p>
                    <Button variant="outline" size="sm" onClick={() => setFile(null)} className="mt-2">
                       Change File
                    </Button>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-muted-foreground" />
                    <Label htmlFor="paper-upload" className="cursor-pointer">
                      <div className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md font-medium text-sm transition-colors mt-2">
                        Browse Files
                      </div>
                    </Label>
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="paper-upload" 
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => e.target.files && setFile(e.target.files[0])} 
                    />
                  </>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={!file || uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze Paper
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Results Column */}
        <div className="md:col-span-2 space-y-6">
          {!result && !uploading && (
            <div className="h-[400px] border border-border/50 border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-muted/20">
              Upload a paper to see the analysis and predictions here.
            </div>
          )}
          
          {uploading && (
             <div className="h-[400px] border border-border/50 rounded-xl flex flex-col items-center justify-center text-primary bg-card/50">
               <Loader2 className="h-12 w-12 animate-spin mb-4" />
               <p className="font-medium animate-pulse">Running OCR & LLM Analysis...</p>
             </div>
          )}

          {result && result.status === "success" && (
            <>
              {/* Topic Heatmap / List */}
              <Card className="bg-card/60 backdrop-blur-md border border-purple-500/20 shadow-lg shadow-purple-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-500">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Topic Weightage Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.paper_analysis?.map((topic, idx: number) => (
                    <div key={idx} className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{topic.topic}</span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {topic.frequency_percentage}% ({topic.total_marks} Marks)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ width: `${topic.frequency_percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Predictions */}
              <Card className="bg-card/60 backdrop-blur-md border border-orange-500/20 shadow-lg shadow-orange-500/5 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-500">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Predicted Exam Questions
                  </CardTitle>
                  <CardDescription>Based on historical frequency patterns.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                     {result.mock_predictions}
                   </div>
                </CardContent>
              </Card>
            </>
          )}

          {result && result.status === "error" && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="pt-6 text-red-600 font-medium">
                Analysis Error: {result.message}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
