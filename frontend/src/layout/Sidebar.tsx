import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  BrainCircuit, 
  LineChart, 
  GraduationCap, 
  Calculator,
  Upload,
  LayoutDashboard,
  Image as ImageIcon,
  LayoutList,
  Target,
  TrendingUp,
  Activity,
  Clock,
  Database,
  FileSearch,
  FlaskConical
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Notes", href: "/upload", icon: Upload },
    { name: "My Library", href: "/library", icon: Database },
    { name: "AI Tutor", href: "/tutor", icon: BrainCircuit },
    { name: "Flashcards", href: "/flashcards", icon: BookOpen },
    { name: "Knowledge Map", href: "/map", icon: LineChart },
    { name: "Math Solver", href: "/solver", icon: Calculator },
    { name: "Image Math Solver", href: "/image-solver", icon: ImageIcon },
    { name: "Practice Mode", href: "/practice", icon: Target },
    { name: "Mock Exam", href: "/exam", icon: FlaskConical },
    { name: "Study Planner", href: "/planner", icon: LayoutList },
    { name: "Paper Analyzer", href: "/analyzer", icon: FileSearch },
    { name: "Learning Analytics", href: "/analytics", icon: Activity },
    { name: "Exam Predictor", href: "/exam-predict", icon: TrendingUp },
    { name: "Focus Timer", href: "/timer", icon: Clock },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-md flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 hover:from-orange-500 hover:to-red-500 transition-all duration-500 cursor-default">
            StudyBuddy AI
          </span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "group-hover:text-foreground"}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 text-center tracking-widest uppercase">
            SUPER UPGRADE ACTIVE
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-muted/20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        <div className="relative z-10 w-full h-full p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
