import { Button } from "@/components/ui/button";
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
  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: MessageCircle, label: "Messages" },
    { icon: PlayCircle, label: "Reels" },
    { icon: Target, label: "Tracker" },
    { icon: UserCheck, label: "Guidance" },
    { icon: Award, label: "Achievements" },
    { icon: Users, label: "Community" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated z-40">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            className={`flex-col gap-1 h-auto py-2 px-3 transition-smooth ${
              item.active 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.active ? "animate-gentle-pulse" : ""}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;