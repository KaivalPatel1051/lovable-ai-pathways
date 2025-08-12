import { Progress } from "@/components/ui/progress";
import { Flame, Target, Calendar, Trophy } from "lucide-react";
import { MagicBentoCard, DarkPalette } from "./MagicBento";

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
        <MagicBentoCard
          key={stat.label}
          className="rounded-xl"
          enableTilt
          clickEffect
          enableMagnetism
          style={{ backgroundColor: DarkPalette.surface } as React.CSSProperties}
        >
          <div className="p-6 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-200/80 truncate">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-white">{stat.value}</p>
              </div>
            </div>
            <Progress 
              value={stat.progress} 
              className="h-2 transition-smooth" 
            />
          </div>
        </MagicBentoCard>
      ))}
    </div>
  );
};

export default QuickStats;