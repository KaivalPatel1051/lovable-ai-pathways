import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    <Card className="serene-border hover:serene-glow transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-medium text-foreground">How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <p className="text-sm text-muted-foreground">
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
      </CardContent>
    </Card>
  );
};

export default MoodCheckIn;