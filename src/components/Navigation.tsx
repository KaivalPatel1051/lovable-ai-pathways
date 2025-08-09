import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  MessageCircle, 
  PlayCircle, 
  Target, 
  Users, 
  Award,
  UserCheck 
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
    { icon: PlayCircle, label: "Reels", path: "/reels" },
    { icon: Target, label: "Tracker", path: "/tracker" },
    { icon: UserCheck, label: "Guidance", path: "/guidance" },
    { icon: Award, label: "Achievements", path: "/achievements" },
    { icon: Users, label: "Community", path: "/community" }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated z-40">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              onClick={() => handleNavClick(item.path)}
              className={`flex-col gap-1 h-auto py-2 px-3 transition-smooth ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "animate-gentle-pulse" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;