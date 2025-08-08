import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardHeader = () => {
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="flex items-center justify-between p-4 bg-gradient-healing rounded-2xl shadow-gentle mb-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-white/20">
          <AvatarImage src="/placeholder-avatar.png" alt="User" />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            JD
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold text-white">
            {getGreeting()}, Jordan! 🌟
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              Day 42 Strong
            </Badge>
            <span className="text-white/80 text-sm">Keep going!</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => {
            import("@/hooks/use-toast").then(({ toast }) => {
              toast({
                title: "Notifications",
                description: "No new notifications at this time.",
              });
            });
          }}
          className="text-white hover:bg-white/20 transition-smooth"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => {
            import("@/hooks/use-toast").then(({ toast }) => {
              toast({
                title: "Settings",
                description: "Settings panel coming soon!",
              });
            });
          }}
          className="text-white hover:bg-white/20 transition-smooth"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;