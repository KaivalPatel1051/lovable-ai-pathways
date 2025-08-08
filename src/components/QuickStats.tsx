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
      gradient: "gradient-energy"
    },
    {
      icon: Target,
      label: "Daily Goals",
      value: "3/4 completed",
      progress: 75,
      gradient: "gradient-calm"
    },
    {
      icon: Calendar,
      label: "Check-ins",
      value: "38/42 days",
      progress: 90,
      gradient: "gradient-healing"
    },
    {
      icon: Trophy,
      label: "Achievements",
      value: "12 earned",
      progress: 60,
      gradient: "gradient-hero"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-gentle animate-float-gentle">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${stat.gradient}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {stat.label}
                </p>
                <p className="text-sm font-semibold">{stat.value}</p>
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