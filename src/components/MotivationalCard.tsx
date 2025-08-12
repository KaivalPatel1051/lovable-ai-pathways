import { Button } from "@/components/ui/button";
import { Quote, RefreshCw } from "lucide-react";
import { useState } from "react";
import { MagicBentoCard } from "./MagicBento";

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
    <MagicBentoCard
      className="card card--border-glow"
      glowColor="132, 0, 255"
      enableTilt
      clickEffect
      enableMagnetism
      style={{ backgroundColor: "#0a0118" } as React.CSSProperties}
    >
      <div className="p-6 text-white">
        <div className="flex items-start gap-3">
          <Quote className="h-6 w-6 mt-1 opacity-80 text-purple-300" />
          <div className="flex-1 space-y-3">
            <blockquote className="text-base leading-relaxed font-medium">
              "{quotes[currentQuote].text}"
            </blockquote>
            <p className="text-xs text-purple-200/80">— {quotes[currentQuote].author}</p>
            <Button
              onClick={getNewQuote}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 gap-2 transition-smooth"
            >
              <RefreshCw className="h-4 w-4" />
              New Quote
            </Button>
          </div>
        </div>
      </div>
    </MagicBentoCard>
  );
};

export default MotivationalCard;