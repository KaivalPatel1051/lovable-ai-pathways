import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm here to support you on your recovery journey. How are you feeling today?",
      sender: 'support',
      timestamp: new Date(Date.now() - 300000),
      status: 'read'
    },
    {
      id: '2',
      text: "I'm having a tough day and feeling tempted. Can you help me?",
      sender: 'user',
      timestamp: new Date(Date.now() - 240000),
      status: 'read'
    },
    {
      id: '3',
      text: "I understand how challenging that can be. Let's work through this together. What specific situation is triggering these feelings?",
      sender: 'support',
      timestamp: new Date(Date.now() - 180000),
      status: 'read'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date(),
        status: 'sent'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate support response
      setTimeout(() => {
        const supportResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thank you for sharing that with me. Remember, you're stronger than your urges. Let's try a breathing exercise together.",
          sender: 'support',
          timestamp: new Date(),
          status: 'delivered'
        };
        setMessages(prev => [...prev, supportResponse]);
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src="/api/placeholder/40/40" />
            <AvatarFallback className="bg-primary text-primary-foreground">CS</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">Crisis Support</h3>
            <p className="text-sm text-muted-foreground">Online • Always here for you</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {message.sender === 'support' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">CS</AvatarFallback>
                  </Avatar>
                )}
                <Card className={`p-3 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                    {message.sender === 'user' && message.status && (
                      <div className="flex">
                        <div className={`w-1 h-1 rounded-full ${
                          message.status === 'read' ? 'bg-blue-400' : 'bg-gray-400'
                        }`} />
                        <div className={`w-1 h-1 rounded-full ml-0.5 ${
                          message.status === 'read' ? 'bg-blue-400' : 'bg-gray-400'
                        }`} />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            onClick={handleSendMessage}
            size="sm"
            className="px-3"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Crisis support available 24/7 • Your conversations are confidential
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
