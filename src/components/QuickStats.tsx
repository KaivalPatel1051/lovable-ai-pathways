import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Calendar, Trophy } from "lucide-react";

const QuickStats = () => {
  const stats = [
    {
      icon: Flame,
      label: "Current Streak",
      value: "42 days",
      progress: 84,
      color: "text-accent"
    },
    {
      icon: Target,
      label: "Daily Goals",
      value: "3/4 completed",
      progress: 75,
      color: "text-primary"
    },
    {
      icon: Calendar,
      label: "Check-ins",
      value: "38/42 days",
      progress: 90,
      color: "text-success"
    },
    {
      icon: Trophy,
      label: "Achievements",
      value: "12 earned",
      progress: 60,
      color: "text-secondary"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="serene-border hover:serene-glow transition-all duration-300">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-foreground">{stat.value}</p>
              </div>
            </div>
            <Progress 
              value={stat.progress} 
              className="h-2 transition-smooth" 
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;