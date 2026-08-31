import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Database, FileText, Youtube, Search, Trash2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface DocRecord {
  id: number;
  name: string;
  source_type: string;
  subject: string;
  unit: string;
  topic: string;
  difficulty: string;
  marks_weight: number;
  chunks: number;
  uploaded_at: string;
}

export default function MyLibrary() {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchDocs = async (q = "") => {
    setLoading(true);
    setError('');
    try {
      const url = q
        ? `http://localhost:8000/documents/?q=${encodeURIComponent(q)}`
        : "http://localhost:8000/documents/";
      const res = await axios.get(url, { timeout: 8000 });
      setDocs(res.data.documents || []);
    } catch {
      setError('Cannot connect to backend. Start the server and refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchDocs(query); };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await axios.delete(`http://localhost:8000/documents/${id}`, { timeout: 8000 });
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch { /* ignore */ } finally {
      setDeleting(null);
    }
  };

  const diffBadge: Record<string, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="w-7 h-7 text-primary" /> My Library
          </h1>
          <p className="text-muted-foreground mt-1">All uploaded notes saved permanently in a local SQLite database.</p>
        </div>
        {!loading && !error && (
          <div className="text-right">
            <p className="text-4xl font-black text-primary">{docs.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Documents</p>
          </div>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, subject, topic…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
        {query && <Button type="button" variant="ghost" onClick={() => { setQuery(""); fetchDocs(); }}>Clear</Button>}
      </form>

      {/* States */}
      {loading && (
        <div className="flex justify-center p-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-3 p-16 border-2 border-dashed rounded-xl text-muted-foreground">
          <AlertCircle className="w-10 h-10" />
          <p className="text-center">{error}</p>
          <Button variant="outline" onClick={() => fetchDocs()}>Retry</Button>
        </div>
      )}

      {!loading && !error && docs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 p-16 border-2 border-dashed rounded-xl text-muted-foreground">
          <Database className="w-10 h-10 opacity-40" />
          <p className="font-medium text-foreground">Library is empty</p>
          <p className="text-sm">Upload your first note or YouTube video to get started.</p>
        </div>
      )}

      {!loading && !error && docs.length > 0 && (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Card key={doc.id} className="hover:border-primary/30 transition-colors group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${doc.source_type === "youtube" ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>
                  {doc.source_type === "youtube" ? <Youtube className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">{doc.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {doc.subject && <span>📚 {doc.subject}</span>}
                    {doc.topic && <span>📖 {doc.topic}</span>}
                    <span>🕐 {doc.uploaded_at}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${diffBadge[doc.difficulty] ?? "bg-muted text-muted-foreground"}`}>{doc.difficulty}</span>
                    <span className="bg-muted px-2 py-0.5 rounded-full">{doc.chunks} chunks</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id}>
                  {deleting === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
