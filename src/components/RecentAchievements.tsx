import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Medal, Star, Heart, Zap } from "lucide-react";
import { MagicBentoCard, DarkPalette } from "./MagicBento";

const RecentAchievements = () => {
  const achievements = [
    {
      icon: Medal,
      title: "Week Warrior",
      description: "7 days clean",
      earned: "2 days ago",
      color: "text-success"
    },
    {
      icon: Star,
      title: "Mood Master",
      description: "Logged mood 5 days straight",
      earned: "1 week ago",
      color: "text-primary"
    },
    {
      icon: Heart,
      title: "Support Squad",
      description: "Helped 3 community members",
      earned: "3 days ago",
      color: "text-accent"
    },
    {
      icon: Zap,
      title: "Morning Motivation",
      description: "Completed morning routine",
      earned: "Today",
      color: "text-warning"
    }
  ];

  return (
    <MagicBentoCard
      className="rounded-xl"
      enableTilt
      clickEffect
      enableMagnetism
      style={{ backgroundColor: DarkPalette.surface } as React.CSSProperties}
    >
      <div className="px-6 pt-6">
        <h3 className="text-lg flex items-center gap-2 text-white">
          <Medal className="h-5 w-5 text-purple-300" />
          Recent Achievements
        </h3>
      </div>
      <div className="space-y-3 p-6 pt-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.title}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 transition-smooth hover:bg-white/10"
          >
            <div className={`p-2 rounded-lg bg-card ${achievement.color}`}>
              <achievement.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-white">{achievement.title}</h4>
              <p className="text-xs text-purple-200/80">
                {achievement.description}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {achievement.earned}
            </Badge>
          </div>
        ))}
      </div>
    </MagicBentoCard>
  );
};

export default RecentAchievements;