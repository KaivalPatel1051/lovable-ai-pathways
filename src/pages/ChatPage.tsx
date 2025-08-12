import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Phone, Video, MoreVertical, ArrowLeft, Search, Plus, 
  Smile, Paperclip, Mic, Camera, Heart, Reply, MoreHorizontal,
  Check, CheckCheck, Circle, Users, Bot, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MagicBentoCard, DarkPalette } from '@/components/MagicBento';

// Enhanced message interface with social media features
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support' | 'bot';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'voice' | 'video';
  mediaUrl?: string;
  reactions?: { emoji: string; users: string[]; }[];
  replyTo?: string;
  isTyping?: boolean;
}

// Chat contact interface
interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
  status?: string;
  isGroup?: boolean;
  participants?: string[];
}

// Story interface for status updates
interface Story {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  mediaUrl: string;
  timestamp: Date;
  viewed: boolean;
}

const ChatPage = () => {
  const navigate = useNavigate();
  
  // State management for modern chat features
  const [activeTab, setActiveTab] = useState<'chats' | 'stories' | 'contacts'>('chats');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Sample chat contacts with modern features
  const [chatContacts] = useState<ChatContact[]>([
    {
      id: 'bot',
      name: 'Recovery Assistant',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'How can I help you today?',
      timestamp: new Date(Date.now() - 60000),
      unreadCount: 0,
      isOnline: true,
      status: 'Always here to help'
    },
    {
      id: 'support',
      name: 'Crisis Support Team',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Remember, you\'re stronger than your urges.',
      timestamp: new Date(Date.now() - 300000),
      unreadCount: 2,
      isOnline: true,
      status: '24/7 Support Available'
    },
    {
      id: 'group1',
      name: 'Recovery Warriors',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Sarah: Thanks for the motivation everyone!',
      timestamp: new Date(Date.now() - 600000),
      unreadCount: 5,
      isOnline: false,
      isGroup: true,
      participants: ['Sarah M.', 'Mike R.', 'Jessica L.', '+12 others']
    },
    {
      id: 'mentor',
      name: 'Alex - Mentor',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Proud of your progress this week!',
      timestamp: new Date(Date.now() - 1200000),
      unreadCount: 0,
      isOnline: false,
      status: '2 years sober'
    }
  ]);

  // Sample stories for status updates
  const [stories] = useState<Story[]>([
    {
      id: '1',
      userId: 'sarah',
      userName: 'Sarah M.',
      avatar: '/api/placeholder/40/40',
      mediaUrl: '/api/placeholder/300/400',
      timestamp: new Date(Date.now() - 3600000),
      viewed: false
    },
    {
      id: '2',
      userId: 'mike',
      userName: 'Mike R.',
      avatar: '/api/placeholder/40/40',
      mediaUrl: '/api/placeholder/300/400',
      timestamp: new Date(Date.now() - 7200000),
      viewed: true
    }
  ]);

  // Enhanced messages with reactions and media support
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm here to support you on your recovery journey. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(Date.now() - 300000),
      status: 'read',
      type: 'text'
    },
    {
      id: '2',
      text: "I'm having a tough day and feeling tempted. Can you help me?",
      sender: 'user',
      timestamp: new Date(Date.now() - 240000),
      status: 'read',
      type: 'text'
    },
    {
      id: '3',
      text: "I understand how challenging that can be. Let's work through this together. What specific situation is triggering these feelings?",
      sender: 'bot',
      timestamp: new Date(Date.now() - 180000),
      status: 'read',
      type: 'text',
      reactions: [{ emoji: '❤️', users: ['user'] }]
    }
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Enhanced message sending with bot responses
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date(),
        status: 'sent',
        type: 'text',
        replyTo: replyingTo?.id
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setReplyingTo(null);
      
      // Show typing indicator
      setIsTyping(true);
      
      // Simulate bot/support response with AI-like responses
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          "I understand how you're feeling. Let's work through this together. What specific situation triggered this?",
          "Thank you for sharing. Remember, every moment of sobriety is a victory. How can I support you right now?",
          "That's a brave step to reach out. Let's try a quick grounding exercise: name 5 things you can see around you.",
          "I'm here for you. Your strength in reaching out shows your commitment to recovery. What's your biggest concern right now?",
          "Recovery is a journey with ups and downs. You're doing great by staying connected. How are you taking care of yourself today?"
        ];
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: selectedChat === 'bot' ? 'bot' : 'support',
          timestamp: new Date(),
          status: 'delivered',
          type: 'text'
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1500 + Math.random() * 1000);
    }
  };

  // Handle message reactions
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          // Toggle reaction
          const userIndex = existingReaction.users.indexOf('user');
          if (userIndex > -1) {
            existingReaction.users.splice(userIndex, 1);
            if (existingReaction.users.length === 0) {
              msg.reactions = msg.reactions?.filter(r => r.emoji !== emoji);
            }
          } else {
            existingReaction.users.push('user');
          }
        } else {
          // Add new reaction
          if (!msg.reactions) msg.reactions = [];
          msg.reactions.push({ emoji, users: ['user'] });
        }
      }
      return msg;
    }));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-bold">Messages</h2>
            <Button variant="ghost" size="sm" className="p-2">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10 cursor-target"
            />
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-4 mb-2">
            <TabsTrigger value="chats" className="cursor-target">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="stories" className="cursor-target">
              <Circle className="h-4 w-4 mr-2" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="contacts" className="cursor-target">
              <Users className="h-4 w-4 mr-2" />
              Contacts
            </TabsTrigger>
          </TabsList>

          {/* Chat List */}
          <TabsContent value="chats" className="flex-1 px-2">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {chatContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors cursor-target ${
                      selectedChat === contact.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedChat(contact.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback>
                            {contact.isGroup ? <Users className="h-6 w-6" /> : contact.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {contact.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{contact.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(contact.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                        {contact.status && (
                          <p className="text-xs text-muted-foreground truncate">{contact.status}</p>
                        )}
                      </div>
                      {contact.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground min-w-[20px] h-5 text-xs">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories" className="flex-1 px-2">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {stories.map((story) => (
                  <motion.div
                    key={story.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer cursor-target"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-0.5 rounded-full ${story.viewed ? 'bg-muted' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={story.avatar} />
                        <AvatarFallback>{story.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h4 className="font-medium">{story.userName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(story.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="flex-1 px-2">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {chatContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer cursor-target"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{contact.name}</h4>
                      <p className="text-sm text-muted-foreground">{contact.status}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <MagicBentoCard className="rounded-xl flex-1 flex flex-col" enableTilt clickEffect enableMagnetism style={{ backgroundColor: DarkPalette.surface } as React.CSSProperties}>
            <div className="rounded-xl border border-border/40 flex-1 flex flex-col" style={{ backgroundColor: DarkPalette.surface }}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chatContacts.find(c => c.id === selectedChat)?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedChat === 'bot' ? <Bot className="h-5 w-5" /> : 
                     chatContacts.find(c => c.id === selectedChat)?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {chatContacts.find(c => c.id === selectedChat)?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isTyping ? 'Typing...' : 
                     chatContacts.find(c => c.id === selectedChat)?.isOnline ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="p-2 cursor-target">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 cursor-target">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 cursor-target">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area with Enhanced Features */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {/* Reply Banner */}
                <AnimatePresence>
                  {replyingTo && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-muted/50 p-3 rounded-lg border-l-4 border-primary"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Replying to</p>
                          <p className="text-sm truncate">{replyingTo.text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(null)}
                          className="p-1"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages with Enhanced UI */}
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {message.sender !== 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {message.sender === 'bot' ? <Bot className="h-4 w-4" /> : 'CS'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="space-y-1">
                        <Card className={`p-3 cursor-target ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}>
                          {message.replyTo && (
                            <div className="bg-black/10 p-2 rounded mb-2 text-xs opacity-70">
                              <p>Replying to: {messages.find(m => m.id === message.replyTo)?.text}</p>
                            </div>
                          )}
                          <p className="text-sm">{message.text}</p>
                          
                          {/* Message Actions */}
                          <div className={`flex items-center justify-between mt-2 ${
                            message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{formatTime(message.timestamp)}</span>
                              {message.sender === 'user' && message.status && (
                                <div className="flex">
                                  {message.status === 'sent' && <Check className="h-3 w-3" />}
                                  {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                                  {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-400" />}
                                </div>
                              )}
                            </div>
                            
                            {message.sender !== 'user' && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 cursor-target"
                                  onClick={() => handleReaction(message.id, '❤️')}
                                >
                                  <Heart className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 cursor-target"
                                  onClick={() => setReplyingTo(message)}
                                >
                                  <Reply className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                        
                        {/* Message Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 px-2">
                            {message.reactions.map((reaction, index) => (
                              <motion.button
                                key={index}
                                className="bg-muted/50 px-2 py-1 rounded-full text-xs flex items-center gap-1 cursor-target"
                                onClick={() => handleReaction(message.id, reaction.emoji)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.users.length}</span>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-end gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <Card className="p-3 bg-muted">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </Card>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Enhanced Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="p-2 cursor-target">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 cursor-target">
                  <Camera className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 cursor-target"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button variant="ghost" size="sm" className="p-2 cursor-target">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 cursor-target">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  size="sm"
                  className="px-3 cursor-target"
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
          </MagicBentoCard>
        ) : (
          /* No Chat Selected State */
          <MagicBentoCard className="rounded-xl flex-1 flex items-center justify-center" enableTilt clickEffect enableMagnetism style={{ backgroundColor: DarkPalette.surface } as React.CSSProperties}>
            <div className="text-center space-y-4 p-8 rounded-xl border border-border/40" style={{ backgroundColor: DarkPalette.surface }}>
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Select a conversation</h3>
                <p className="text-muted-foreground">Choose from your existing conversations or start a new one</p>
              </div>
              <Button className="cursor-target">
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </MagicBentoCard>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
