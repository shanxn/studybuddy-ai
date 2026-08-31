import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import axios from "axios";
import cytoscape from "cytoscape";

export default function KnowledgeMap() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const cyRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<cytoscape.Core | null>(null);

  const generateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/learning/knowledge-graph", { topic });
      
      if (res.data.status === "success" && cyRef.current) {
        const data = res.data.graph_data;
        
        // Clean up previous instance
        if (cy) {
          cy.destroy();
        }

        const newCy = cytoscape({
          container: cyRef.current,
          elements: {
            nodes: data.nodes || [],
            edges: data.edges || []
          },
          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#8b5cf6',
                'label': 'data(label)',
                'color': '#fff',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '12px',
                'width': 'label',
                'height': 'label',
                'padding': '16px',
                'shape': 'round-rectangle'
              }
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#cbd5e1',
                'target-arrow-color': '#cbd5e1',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '10px',
                'text-background-opacity': 1,
                'text-background-color': '#ffffff',
                'text-background-padding': '4px',
                'color': '#64748b'
              }
            }
          ],
          layout: {
            name: 'cose',
            padding: 50,
            animate: true
          }
        });
        setCy(newCy);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate knowledge map. Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[88vh] flex flex-col space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Map</h1>
        <p className="text-muted-foreground mt-2">Visualize relationships between concepts extracted from your study materials.</p>
      </div>

      <Card className="flex-none bg-card/60 backdrop-blur-md border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={generateMap} className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Enter a topic idea to map (e.g. Backpropagation)" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)}
                className="pl-9 h-12"
              />
            </div>
            <Button type="submit" disabled={!topic || loading} className="h-12 w-32">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate Graph"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-[500px] overflow-hidden bg-card/60 backdrop-blur-md border-border/50 relative">
        <div 
          ref={cyRef} 
          className="absolute inset-0 bg-dot-pattern"
          style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-3 font-medium text-lg">Extracting graph structure...</span>
          </div>
        )}
        {!loading && !cy && (
          <div className="absolute inset-0 flex items-center justify-center z-0 text-muted-foreground">
            Search for a topic to view its knowledge graph.
          </div>
        )}
      </Card>
    </div>
  );
}
