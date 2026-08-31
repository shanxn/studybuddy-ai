import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, File, X, Loader2, CheckCircle, Youtube } from "lucide-react";
import axios from "axios";

export default function UploadNotes() {
  const [activeTab, setActiveTab] = useState("file");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{status: string, message: string} | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((activeTab === "file" && !file) || (activeTab === "youtube" && !youtubeUrl) || !subject || !topic) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("unit", unit);
    formData.append("topic", topic);
    formData.append("difficulty", difficulty);

    try {
      let endpoint = "http://localhost:8000/upload/";
      
      if (activeTab === "file" && file) {
        formData.append("file", file);
      } else if (activeTab === "youtube" && youtubeUrl) {
        formData.append("url", youtubeUrl);
        endpoint = "http://localhost:8000/upload/youtube";
      }

      const res = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120_000  // 2 min — first run downloads embedding model (~90MB)
      });
      setResult({ status: "success", message: res.data.message });
      setFile(null);
      setYoutubeUrl("");
      setTopic("");
    } catch (error) {
      const err = error as {response?: {data?: {detail?: string}}, code?: string};
      if (err.code === "ECONNABORTED") {
        setResult({ status: "error", message: "Request timed out. The backend may be downloading the embedding model for the first time — please wait 1-2 minutes and try again." });
      } else {
        setResult({ status: "error", message: err.response?.data?.detail || "Upload failed. Check the backend terminal for details." });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Ingestion</h1>
        <p className="text-muted-foreground mt-2">Upload PDFs, Word docs, or images to train your personal AI tutor.</p>
      </div>

      <Card className="bg-card/60 backdrop-blur-md border border-border/50 shadow-xl shadow-primary/5">
        <form onSubmit={handleUpload}>
          <CardHeader>
            <CardTitle>Upload Study Material</CardTitle>
            <CardDescription>Files and transcripts will be chunked, embedded, and stored locally in FAISS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <Tabs defaultValue="file" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="file" className="flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Local File</TabsTrigger>
                <TabsTrigger value="youtube" className="flex items-center gap-2"><Youtube className="w-4 h-4" /> YouTube Video</TabsTrigger>
              </TabsList>
              
              <TabsContent value="file">
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
                >
              {file ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                    <File size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                    <X className="h-4 w-4 mr-2" /> Remove File
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className="font-medium text-lg">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, PNG, JPG (Max 50MB)</p>
                  </div>
                  <Input 
                    type="file" 
                    className="hidden" 
                    id="file-upload" 
                    onChange={(e) => e.target.files && setFile(e.target.files[0])} 
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm transition-colors">
                      Browse Files
                    </div>
                  </Label>
                </div>
              )}
                </div>
              </TabsContent>

              <TabsContent value="youtube">
                <div className="border border-border/50 bg-muted/30 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2 text-red-500 font-semibold">
                    <div className="p-2 bg-red-100 rounded-lg"><Youtube className="w-6 h-6" /></div>
                    YouTube Transcript Ingestion
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube Video URL</Label>
                    <Input 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={youtubeUrl} 
                      onChange={(e) => setYoutubeUrl(e.target.value)} 
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-red-600 font-medium">Auto-downloads transcript and generates summary mappings instantly.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Metadata Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="e.g. Computer Networks" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Unit / Chapter</Label>
                <Input placeholder="e.g. Unit 3" value={unit} onChange={(e) => setUnit(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input placeholder="e.g. Routing Algorithms" value={topic} onChange={(e) => setTopic(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v || "medium")}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {result && (
              <div className={`p-4 rounded-lg flex flex-col gap-2 ${result.status === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                <div className="flex items-start space-x-3">
                  {result.status === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" /> : <X className="h-5 w-5 mt-0.5 shrink-0" />}
                  <p className="font-medium text-sm">{result.message}</p>
                </div>
                {result.status === 'success' && (
                  <p className="text-xs text-green-600/70 pl-8">
                    🔄 AI flashcards &amp; summaries are generating in the background. Check the <strong>Flashcards</strong> page in ~30 seconds.
                  </p>
                )}
              </div>
            )}


            <Button 
              type="submit" 
              className={`w-full text-lg h-12 ${activeTab === 'youtube' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`} 
              disabled={(activeTab === 'file' && !file) || (activeTab === 'youtube' && !youtubeUrl) || !subject || !topic || uploading}
            >
              {uploading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing & Embedding...</>
              ) : (
                <><UploadCloud className="mr-2 h-5 w-5" /> Start Knowledge Ingestion</>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
