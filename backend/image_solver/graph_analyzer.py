import cv2
import numpy as np

class GraphAnalyzer:
    def analyze_graph_image(self, image_bytes: bytes) -> dict:
        """Analyzes graph images (linear, polynomial, charts) using OpenCV."""
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            
            # Simple heuristic detection
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=100, maxLineGap=10)
            is_linear = lines is not None and len(lines) < 10
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            curves_count = len([c for c in contours if len(c) > 50])
            
            graph_type = "Unknown"
            if is_linear:
                graph_type = "Linear Graph Detected"
            elif curves_count > 0:
                graph_type = "Polynomial / Curved Graph Detected"
            else:
                graph_type = "No identifiable graph elements"
                
            return {
                "detected_type": graph_type,
                "analysis_details": "Graph contains significant curves." if curves_count > 0 else "Graph is predominantly linear.",
                "explanation": "Image analyzed successfully. Advanced equation approximation from images requires deep learning layers not yet configured in local environment."
            }
        except Exception as e:
            raise ValueError(f"Graph analysis failed: {e}")

graph_analyzer = GraphAnalyzer()
