import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MagicBentoCard, DarkPalette } from "./MagicBento";

const MoodCheckIn = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { toast } = useToast();

  const moods = [
    { emoji: "😊", label: "Great", color: "bg-success/20 border-success text-success" },
    { emoji: "🙂", label: "Good", color: "bg-primary/20 border-primary text-primary" },
    { emoji: "😐", label: "Okay", color: "bg-warning/20 border-warning text-warning" },
    { emoji: "😟", label: "Struggling", color: "bg-accent/20 border-accent text-accent" },
    { emoji: "😢", label: "Tough", color: "bg-destructive/20 border-destructive text-destructive" }
  ];

  return (
    <MagicBentoCard
      className="rounded-xl"
      enableTilt
      clickEffect
      enableMagnetism
      style={{ backgroundColor: DarkPalette.surface } as React.CSSProperties}
    >
      <div className="pb-4 pt-6 px-6">
        <h3 className="text-xl font-medium text-white">How are you feeling today?</h3>
      </div>
      <div className="space-y-6 px-6 pb-6">
        <div className="flex justify-between gap-3">
          {moods.map((mood) => (
            <Button
              key={mood.label}
              variant="ghost"
              className={`flex-col gap-2 h-auto py-4 px-3 rounded-lg border transition-all duration-200 ${
                selectedMood === mood.label 
                  ? `${mood.color} border-2` 
                  : "border-border hover:bg-muted/50"
              }`}
              onClick={() => setSelectedMood(mood.label)}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
            </Button>
          ))}
        </div>
        {selectedMood && (
          <div className="text-center space-y-2 animate-fade-in">
            <p className="text-sm text-purple-200/80">
              Thank you for sharing. Remember, every feeling is valid.
            </p>
            <Button 
              size="sm" 
              className="transition-smooth"
              onClick={() => {
                toast({
                  title: "Mood Logged! 💚",
                  description: `Feeling ${selectedMood.toLowerCase()} today. Thank you for sharing.`,
                });
                setSelectedMood(null);
              }}
            >
              Log Mood
            </Button>
          </div>
        )}
      </div>
    </MagicBentoCard>
  );
};

export default MoodCheckIn;