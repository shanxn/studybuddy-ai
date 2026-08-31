import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, Loader2 } from "lucide-react";
import axios from "axios";

export default function MathSolver() {
  const [equation, setEquation] = useState("");
  const [result, setResult] = useState<{status: string; message?: string; explanation?: string; plot_base64?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equation) return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("http://localhost:8000/math/solve", { equation });
      setResult(res.data);
    } catch (error) {
      const err = error as {response?: {data?: {detail?: string}}};
      setResult({ status: "error", message: err.response?.data?.detail || "Could not solve equation." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Graph & Equation Solver</h1>
        <p className="text-muted-foreground mt-2">Powered by SymPy and Matplotlib. Plot graphs, find roots, derivatives, and integrals.</p>
      </div>

      <Card className="bg-card/60 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span>Enter Equation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form onSubmit={handleSolve} className="flex gap-4">
              <Input 
                placeholder="e.g. Integral(x**2, x)" 
                value={equation} 
                onChange={(e) => setEquation(e.target.value)}
                className="font-mono text-lg h-14 bg-muted/50"
              />
              <Button type="submit" disabled={!equation || loading} className="h-14 px-8 text-lg">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Solve"}
              </Button>
            </form>
            
            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
              <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Advanced Calculus Keypad</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {[
                  { label: "∫", value: "Integral( , )", desc: "Integral" },
                  { label: "d/dx", value: "Derivative( , x)", desc: "Derivative" },
                  { label: "lim", value: "Limit( , x, 0)", desc: "Limit" },
                  { label: "Σ", value: "Sum( , (x, 1, 10))", desc: "Summation" },
                  { label: "√", value: "sqrt()", desc: "Square Root" },
                  { label: "π", value: "pi", desc: "Pi" },
                  { label: "∞", value: "oo", desc: "Infinity" },
                  { label: "e", value: "E", desc: "Euler's Number" },
                  { label: "sin", value: "sin()", desc: "Sine" },
                  { label: "cos", value: "cos()", desc: "Cosine" },
                  { label: "tan", value: "tan()", desc: "Tangent" },
                  { label: "log", value: "log()", desc: "Natural Log" },
                  { label: "e^x", value: "exp()", desc: "Exponential" },
                  { label: "Matrix", value: "Matrix([[1, 2], [3, 4]])", desc: "Matrix" },
                  { label: "^", value: "**", desc: "Power" },
                  { label: "C", value: "CLEAR", desc: "Clear All" },
                ].map((btn, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    className={`h-10 font-mono ${btn.value === "CLEAR" ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200" : "bg-white hover:bg-gray-50 text-gray-700"}`}
                    onClick={() => {
                      if (btn.value === "CLEAR") {
                        setEquation("");
                      } else {
                        setEquation(prev => prev + btn.value);
                      }
                    }}
                    title={btn.desc}
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && result.status === "success" && (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <Card className="bg-card/60 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>Step-by-Step Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded-xl border border-border/50 text-foreground/80 leading-loose">
                {result.explanation}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>Graph Visualization</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 bg-white rounded-xl overflow-hidden shadow-inner">
              {result.plot_base64 ? (
                <img 
                  src={`data:image/png;base64,${result.plot_base64}`} 
                  alt="Equation Graph" 
                  className="max-w-full h-auto object-contain rounded-md"
                />
              ) : (
                <p className="text-muted-foreground/60 italic text-sm">Could not generate plot for this equation.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {result && result.status === "error" && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6 text-red-600 font-medium">
            Error: {result.message}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
