from rag.llm_manager import llm_manager
from langchain_core.prompts import PromptTemplate
import re

class PaperAnalyzer:
    def __init__(self):
        self.llm = llm_manager.get_llm()
        
    def analyze_paper_text(self, text: str):
        """Extracts questions and classifies topics/marks from a given raw exam paper text."""
        prompt = PromptTemplate(
            template="""You are an expert exam paper analyzer. Given the text of an exam paper below, 
identify all the questions. For each question, extract:
- The question text itself
- The estimated marks weightage (if given, else estimate it like 2, 5, or 10)
- The core syllabus Topic/Unit it belongs to.

Return your response purely in the following precise format, one line per question:
Question: [text] | Topic: [topic] | Marks: [marks]

Exam Paper Text:
{text}
""",
            input_variables=["text"]
        )
        
        chain = prompt | self.llm
        try:
            res = chain.invoke({"text": text})
            response_text = res.content
            
            questions = []
            topic_freq = {}
            total_marks_per_topic = {}
            
            lines = response_text.split('\n')
            for line in lines:
                if line.startswith("Question:"):
                    parts = line.split(" | ")
                    if len(parts) >= 3:
                        q_text = parts[0].replace("Question:", "").strip()
                        topic = parts[1].replace("Topic:", "").strip()
                        marks_str = parts[2].replace("Marks:", "").strip()
                        try:
                            marks = int(re.findall(r'\d+', marks_str)[0])
                        except:
                            marks = 0
                            
                        # Update frequencies
                        topic_freq[topic] = topic_freq.get(topic, 0) + 1
                        total_marks_per_topic[topic] = total_marks_per_topic.get(topic, 0) + marks
                        
                        questions.append({
                            "question": q_text,
                            "topic": topic,
                            "marks": marks
                        })
                        
            # Calculate percentages
            total_questions = len(questions) or 1
            topics_summary = []
            for t, count in topic_freq.items():
                topics_summary.append({
                    "topic": t,
                    "frequency_percentage": round(float((count / total_questions) * 100), 2),  # type: ignore[call-overload]
                    "total_marks": total_marks_per_topic[t]
                })
                
            # Sort by frequency
            topics_summary = sorted(topics_summary, key=lambda x: x["frequency_percentage"], reverse=True)
            
            return {
                "status": "success",
                "extracted_questions": questions,
                "topic_analysis": topics_summary
            }
        except Exception as e:
            return {"status": "error", "message": f"LLM parsing failed: {str(e)}"}

    def predict_questions(self, topic_summary: list):
        """Predicts potential future questions based on most frequent topics."""
        if not topic_summary:
            return {"status": "error", "message": "No topic summary provided. Analyze a paper first."}
            
        top_topics = [t["topic"] for t in list(topic_summary)[:3]]  # type: ignore[index]
        
        prompt = PromptTemplate(
            template="""You are an expert exam setter. Based on the historical pattern where the following topics were the most important:
{topics}

Please predict 3 highly probable, high-weightage questions that might appear in the next exam covering these topics.
Provide the output cleanly formatted as a list of questions.
""",
            input_variables=["topics"]
        )
        
        chain = prompt | self.llm
        res = chain.invoke({"topics": ", ".join(top_topics)})
        
        return {
            "status": "success",
            "predictions": res.content,
            "top_focused_topics": top_topics
        }

paper_analyzer_engine = PaperAnalyzer()
