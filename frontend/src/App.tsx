import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { Sidebar } from "./layout/Sidebar";

// Pages
import Dashboard from "./pages/Dashboard";
import ChatTutor from "./pages/ChatTutor";
import UploadNotes from "./pages/UploadNotes";
import MathSolver from "./pages/MathSolver";
import PaperAnalyzer from "./pages/PaperAnalyzer";
import KnowledgeMap from "./pages/KnowledgeMap";
import MockExam from "./pages/MockExam";

// New Upgrade Pages
import ImageSolver from "./pages/ImageSolver";
import StudyPlanner from "./pages/StudyPlanner";
import PracticeMode from "./pages/PracticeMode";
import LearningAnalytics from "./pages/LearningAnalytics";
import ExamPredictor from "./pages/ExamPredictor";
import Flashcards from "./pages/Flashcards";
import PomodoroTimer from "./pages/PomodoroTimer";
import MyLibrary from "./pages/MyLibrary";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Authenticated / App Layout routes */}
        <Route element={<Sidebar />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tutor" element={<ChatTutor />} />
          <Route path="/upload" element={<UploadNotes />} />
          <Route path="/map" element={<KnowledgeMap />} />
          
          <Route path="/solver" element={<MathSolver />} />
          <Route path="/image-solver" element={<ImageSolver />} />
          
          <Route path="/planner" element={<StudyPlanner />} />
          <Route path="/analytics" element={<LearningAnalytics />} />
          
          <Route path="/practice" element={<PracticeMode />} />
          <Route path="/exam" element={<MockExam />} />
          <Route path="/exam-predict" element={<ExamPredictor />} />
          <Route path="/analyzer" element={<PaperAnalyzer />} />
          
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/timer" element={<PomodoroTimer />} />
          <Route path="/library" element={<MyLibrary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
