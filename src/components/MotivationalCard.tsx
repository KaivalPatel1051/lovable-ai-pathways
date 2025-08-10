import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, RefreshCw } from "lucide-react";
import { useState } from "react";

const MotivationalCard = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  
  const quotes = [
    {
      text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.",
      author: "Recovery Wisdom"
    },
    {
      text: "You are stronger than your addiction. You are worth more than your worst day.",
      author: "Daily Affirmation"
    },
    {
      text: "Healing happens in waves. Be patient with your progress.",
      author: "Mindful Recovery"
    },
    {
      text: "Every small step forward is a victory worth celebrating.",
      author: "Journey of Healing"
    }
  ];

  const getNewQuote = () => {
    const newIndex = (currentQuote + 1) % quotes.length;
    setCurrentQuote(newIndex);
  };

  return (
    <Card className="bg-black shadow-gentle">
      <CardContent className="p-6 text-black">
        <div className="flex items-start gap-3">
          <Quote className="h-6 w-6 mt-1 opacity-80" />
          <div className="flex-1 space-y-3">
            <blockquote className="text-sm leading-relaxed font-medium">
              "{quotes[currentQuote].text}"
            </blockquote>
            <p className="text-xs opacity-80">— {quotes[currentQuote].author}</p>
            <Button
              onClick={getNewQuote}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 gap-2 transition-smooth"
            >
              <RefreshCw className="h-4 w-4" />
              New Quote
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MotivationalCard;