from datetime import datetime, timedelta

class StudyPlanner:
    def generate_plan(self, weak_topics: list[str], exam_date: str) -> dict:
        """Generates a study plan up to the exam date."""
        try:
            target_date = datetime.strptime(exam_date, "%Y-%m-%d")
            today = datetime.now()
            days_left = (target_date - today).days
            
            if days_left <= 0:
                raise ValueError("Exam date must be in the future.")
                
            plan = []
            topic_idx = 0
            
            # Simple round-robin scheduling
            for i in range(1, days_left + 1):
                current_day = today + timedelta(days=i)
                focus_topic = weak_topics[topic_idx % len(weak_topics)] if weak_topics else "General Revision"
                
                daily_tasks = [
                    f"Review notes on {focus_topic}",
                    f"Complete 5 practice questions for {focus_topic}",
                    "Self-assessment quiz"
                ]
                
                if i == days_left:
                    daily_tasks = ["Full Mock Exam", "Final Revision of all formulas"]
                    
                plan.append({
                    "day": i,
                    "date": current_day.strftime("%Y-%m-%d"),
                    "focus": focus_topic,
                    "tasks": daily_tasks
                })
                topic_idx += 1
                
            return {"status": "success", "days_until_exam": days_left, "plan": plan}
        except Exception as e:
            return {"status": "error", "message": str(e)}

planner_logic = StudyPlanner()
