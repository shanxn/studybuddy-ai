import re

class FormulaExtractor:
    def __init__(self):
        # We store formulas in memory for simplicity; in a real app, use a DB.
        self.formulas = []

    def extract_and_store(self, text: str, source: str) -> list[str]:
        """Detects and stores possible formulas from raw text."""
        detected = []
        lines = text.split("\n")
        
        # Super simplified heuristic for math/formulas: lines having '=', '+', '-', '/', '^', usually brief.
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if "=" in line and sum(c.isdigit() or c in "+-*/^()" for c in line) > len(line) * 0.3:
                # Let's consider lines that are >30% math characters and contain '=' as formulas.
                # Avoid long text paragraphs
                if len(line) < 150:
                    detected.append(line)
                    self.formulas.append({"formula": line, "source": source})
                    
        return detected

    def search_formulas(self, query: str = "") -> list[dict]:
        if not query:
            return self.formulas
        return [f for f in self.formulas if query.lower() in f["formula"].lower()]

formula_extractor = FormulaExtractor()
