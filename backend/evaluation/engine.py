from rag.llm_manager import llm_manager
from rag.vector_store import vector_store_manager
from langchain_core.prompts import PromptTemplate
import json
import re
import ast

def clean_json_string(json_str: str) -> str:
    """Sanitizes LLM JSON output to fix common errors like trailing commas."""
    # Remove trailing commas before closing braces/brackets
    json_str = re.sub(r',\s*([\]}])', r'\1', json_str)
    return json_str

def extract_json(text: str) -> str:
    """Extracts JSON block from LLM output, handling conversational preamble."""
    match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
    if match:
        json_str = match.group(0)
        return clean_json_string(json_str)
    return clean_json_string(text.replace('```json', '').replace('```', '').strip())

class EvaluationEngine:
    def __init__(self):
        self.llm = llm_manager.get_llm()

    def generate_quiz(self, topic: str, count: int = 5, difficulty: str = "medium", q_type: str = "mcq"):
        """Generates practice questions (MCQ, 2-mark, 5-mark, 10-mark) from vector store."""
        docs = vector_store_manager.similarity_search(topic, k=3)
        context = "\n".join([doc.page_content for doc in docs]) if docs else "No specific context available. Use general knowledge."
        
        format_instr = ""
        if q_type == "mcq":
            format_instr = """[
  {"question": "What is X?", "options": ["A", "B", "C", "D"], "correct_answer": "B", "explanation": "Because..."}
]"""
        else:
            format_instr = f"""[
  {{"question": "Explain X in detail.", "marks": {q_type.replace('-mark', '')}, "expected_keywords": ["keyword1", "keyword2"]}}
]"""

        prompt = PromptTemplate(
            template="""You are an expert tutor. Based ONLY on the following context, generate {count} {q_type} questions on the topic '{topic}' at a {difficulty} difficulty.
Format your response as a pure JSON array of objects. Do not include markdown blocks.
Example format:
{format_instr}

Context:
{context}

Response:
""",
            input_variables=["topic", "difficulty", "context", "count", "q_type", "format_instr"]
        )
        
        chain = prompt | self.llm
        try:
            res = chain.invoke({
                "topic": topic, 
                "difficulty": difficulty, 
                "context": context,
                "count": count,
                "q_type": q_type,
                "format_instr": format_instr
            })
            json_str = extract_json(res.content)
            return {"status": "success", "quiz": json.loads(json_str)}
        except Exception as e:
            return {"status": "error", "message": f"Quiz generation failed: {str(e)}\nRaw Response: {res.content if 'res' in locals() else ''}"}

    def evaluate_answer(self, question: str, user_answer: str, marks: int):
        """Evaluates a typed answer against the ground truth context, focusing on keyword coverage, clarity, and concept completeness."""
        docs = vector_store_manager.similarity_search(question, k=4)
        reference_text = "\n".join([doc.page_content for doc in docs]) if docs else "No reference material found."
        
        prompt = PromptTemplate(
            template="""You are an expert evaluator marking an exam.
Given the question, the student's answer, and the reference material, evaluate the student's answer.
Total possible marks: {marks}.

Provide a pure JSON object with the following keys:
1. "score": Numeric score out of {marks}
2. "feedback": Brief feedback on what is correct.
3. "missing_concepts": Detailed list of missing concepts.
4. "keyword_coverage_percent": Estimated percentage of necessary keywords hit.
5. "clarity_rating": "Poor", "Average", "Good", or "Excellent".

Reference Material: {reference}

Question: {question}
Student Answer: {user_answer}

JSON Response:""",
            input_variables=["marks", "reference", "question", "user_answer"]
        )
        
        chain = prompt | self.llm
        try:
            res = chain.invoke({
                "marks": marks, 
                "reference": reference_text, 
                "question": question, 
                "user_answer": user_answer
            })
            json_str = extract_json(res.content)
            return {"status": "success", "evaluation": json.loads(json_str)}
        except Exception as e:
            return {"status": "error", "message": f"Evaluation failed: {str(e)}\nRaw Response: {res.content if 'res' in locals() else ''}"}

    def generate_knowledge_graph(self, topic: str):
        """Extracts entities and relationships to build a Cytoscape.js compatible graph."""
        docs = vector_store_manager.similarity_search(topic, k=4)
        context = "\n".join([doc.page_content for doc in docs]) if docs else ""
        
        prompt = PromptTemplate(
            template="""Extract a Knowledge Graph from the text below focusing on the topic '{topic}'.
Identify key concepts as nodes, and their relationships as edges.
Return a pure JSON object compatible with Cytoscape.js elements array format.
Must have 'nodes' (array of {{"data": {{"id": "name", "label": "name", "type": "concept"}}}}) and 'edges' (array of {{"data": {{"source": "id1", "target": "id2", "label": "relation"}}}}). Make sure to distinguish mathematical formulas by setting "type": "formula" for formula nodes.

Text: {context}

JSON Layout:
""",
            input_variables=["topic", "context"]
        )
        
        chain = prompt | self.llm
        try:
            res = chain.invoke({"topic": topic, "context": context})
            json_str = extract_json(res.content)
            return {"status": "success", "graph_data": json.loads(json_str)}
        except Exception as e:
            return {"status": "error", "message": f"Graph generation failed: {str(e)}\nRaw Response: {res.content if 'res' in locals() else ''}"}

eval_engine = EvaluationEngine()
