import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { toast } = useToast();

  const navItems = [
    { icon: Home, label: "Dashboard", active: activeTab === "Dashboard" },
    { icon: MessageCircle, label: "Messages", active: activeTab === "Messages" },
    { icon: PlayCircle, label: "Reels", active: activeTab === "Reels" },
    { icon: Target, label: "Tracker", active: activeTab === "Tracker" },
    { icon: UserCheck, label: "Guidance", active: activeTab === "Guidance" },
    { icon: Award, label: "Achievements", active: activeTab === "Achievements" },
    { icon: Users, label: "Community", active: activeTab === "Community" }
  ];

  const handleNavClick = (label: string) => {
    setActiveTab(label);
    toast({
      title: `${label} Section`,
      description: `Navigated to ${label}. Feature coming soon!`,
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated z-40">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick(item.label)}
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