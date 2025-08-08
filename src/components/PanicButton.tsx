import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Phone, MessageCircle, Wind } from "lucide-react";

const PanicButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePanicClick = () => {
    setIsExpanded(true);
  };

  const quickActions = [
    {
      icon: Phone,
      label: "Call Helpline",
      action: () => window.open("tel:988"),
      variant: "destructive" as const
    },
    {
      icon: MessageCircle,
      label: "Chat Support",
      action: () => console.log("Open chat support"),
      variant: "secondary" as const
    },
    {
      icon: Wind,
      label: "Breathing Exercise",
      action: () => console.log("Start breathing exercise"),
      variant: "success" as const
    }
  ];

  if (isExpanded) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 shadow-floating animate-fade-in">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">You're not alone. We're here to help.</h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                onClick={action.action}
                variant={action.variant}
                size="sm"
                className="w-full justify-start gap-2 transition-smooth"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={handlePanicClick}
      className="fixed bottom-4 right-4 z-50 h-16 w-16 rounded-full shadow-floating animate-healing-glow bg-gradient-to-r from-destructive to-warning hover:scale-110 transition-smooth"
      size="icon"
    >
      <Heart className="h-6 w-6 text-white" />
    </Button>
  );
};

export default PanicButton;