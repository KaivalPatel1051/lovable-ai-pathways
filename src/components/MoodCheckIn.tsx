import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MoodCheckIn = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { toast } = useToast();

  const moods = [
    { emoji: "😊", label: "Great", color: "bg-success" },
    { emoji: "🙂", label: "Good", color: "bg-primary" },
    { emoji: "😐", label: "Okay", color: "bg-warning" },
    { emoji: "😟", label: "Struggling", color: "bg-accent" },
    { emoji: "😢", label: "Tough", color: "bg-destructive" }
  ];

  return (
    <Card className="shadow-gentle">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between gap-2">
          {moods.map((mood) => (
            <Button
              key={mood.label}
              variant="ghost"
              className={`flex-col gap-2 h-auto py-3 transition-smooth ${
                selectedMood === mood.label 
                  ? `${mood.color} text-white shadow-gentle` 
                  : "hover:bg-muted"
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