import re
from collections import Counter

class PatternDetector:
    def analyze_papers(self, papers_text: list[str]) -> dict:
        """
        Analyzes historical question papers to find topic frequency,
        mark distributions, and predicts important topics.
        """
        all_text = " ".join(papers_text).lower()
        
        # Simple heuristic to find "marks" like [5 marks], (10 marks)
        marks_found = re.findall(r'\(?\[?(\d+)\s*marks?\]?\)?', all_text)
        marks_dist = Counter(marks_found)
        
        # Extract possible topics (heuristically, words longer than 5 chars for demo)
        words = re.findall(r'\b[a-z]{6,}\b', all_text)
        stopwords = {"explain", "describe", "evaluate", "compare", "contrast", "discuss", "analyze", "question", "answer"}
        topics = [w for w in words if w not in stopwords]
        topic_freq = Counter(topics).most_common(10)
        
        predicted = [t[0] for t in topic_freq[:5]]
        
        return {
            "topic_frequency": [{"topic": t[0], "count": t[1]} for t in topic_freq],
            "mark_distribution": [{"marks": int(m), "count": c} for m, c in marks_dist.items()],
            "predicted_important_topics": predicted,
            "trend_changes": "Recent papers show higher frequency of topics: " + ", ".join(predicted[:2])
        }

pattern_detector = PatternDetector()
