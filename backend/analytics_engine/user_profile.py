class UserProfileAnalytics:
    def __init__(self):
        # In a real app, this would be a DB or persistent store
        self.mock_profile = {
            "strong_topics": ["Calculus Basic", "Linear Algebra"],
            "weak_topics": ["Differential Equations", "Quantum Mechanics"],
            "study_streak": 5,
            "accuracy_trend": [60, 65, 72, 80, 78, 85], # percentages
            "topic_mastery": {
                "Calculus Basic": 90,
                "Linear Algebra": 85,
                "Differential Equations": 40,
                "Quantum Mechanics": 30
            },
            "exam_readiness": 65 # out of 100
        }

    def get_profile(self) -> dict:
        return {"status": "success", "profile": self.mock_profile}

    def update_mastery(self, topic: str, score: float):
        """Mock update function."""
        if topic in self.mock_profile["topic_mastery"]:
            self.mock_profile["topic_mastery"][topic] = (self.mock_profile["topic_mastery"][topic] + score) / 2
        else:
            self.mock_profile["topic_mastery"][topic] = score
            
        # Recalculate strong/weak
        self.mock_profile["strong_topics"] = [k for k, v in self.mock_profile["topic_mastery"].items() if v >= 75]
        self.mock_profile["weak_topics"] = [k for k, v in self.mock_profile["topic_mastery"].items() if v < 75]
        
        return {"status": "success", "message": f"Updated mastery for {topic}"}

user_profile = UserProfileAnalytics()
