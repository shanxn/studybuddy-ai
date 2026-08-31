import { useState } from 'react';
import { Calculator, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const ImageSolver = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const solveEquation = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:8000/image-solver/solve', formData);
      setResult(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to solve equation.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Image Math Solver</h1>
        <p className="text-gray-500">Upload a photo of an equation or graph to get step-by-step solutions.</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
        <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
          <ImageIcon className="w-8 h-8" />
        </div>
        <input type="file" onChange={handleUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
        {file && <p className="text-sm font-medium text-gray-700">Selected: {file.name}</p>}
      </div>

      <button onClick={solveEquation} disabled={!file || loading} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
        {loading ? <span className="animate-spin">🌀</span> : <Calculator className="w-5 h-5" />}
        {loading ? "Analyzing Equation..." : "Solve Equation"}
      </button>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 font-semibold text-gray-700">
            Solution & Steps
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50/50 p-4 rounded-lg font-mono text-sm text-blue-900 break-words whitespace-pre-wrap">
              {result.explanation}
            </div>
            {result.plot_base64 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Graph Visualization</h3>
                <img src={`data:image/png;base64,${result.plot_base64}`} alt="Graph Plot" className="rounded-lg border border-gray-200 shadow-sm w-full max-w-md object-contain" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSolver;
