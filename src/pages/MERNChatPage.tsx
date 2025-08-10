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
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import socketService from '../services/socket';

// MERN Backend Message Interface
interface MERNMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
  };
  chat: string;
  messageType: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  reactions: { emoji: string; user: string; }[];
  replyTo?: string;
  readBy: { user: string; readAt: Date; }[];
  createdAt: Date;
  updatedAt: Date;
}

// MERN Backend Chat Interface
interface MERNChat {
  _id: string;
  name?: string;
  isGroupChat: boolean;
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
    isOnline?: boolean;
    lastSeen?: Date;
  }[];
  lastMessage?: MERNMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MERNChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management for MERN chat features
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [selectedChat, setSelectedChat] = useState<MERNChat | null>(null);
  const [chats, setChats] = useState<MERNChat[]>([]);
  const [messages, setMessages] = useState<MERNMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize chat data and socket connections
  useEffect(() => {
    if (user) {
      initializeChat();
      setupSocketListeners();
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Fetch user's chats from MERN backend
      const response = await chatAPI.getChats();
      const userChats = response.data.data.chats;
      
      setChats(userChats);
      
      // If no chats exist, create a default support chat
      if (userChats.length === 0) {
        await createSupportChat();
      }
      
    } catch (error: any) {
      console.error('Failed to initialize chat:', error);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createSupportChat = async () => {
    try {
      // Create a chat with support bot (you can create a support user in your backend)
      const response = await chatAPI.createDirectChat('support-bot-id');
      const newChat = response.data.data.chat;
      setChats([newChat]);
    } catch (error) {
      console.error('Failed to create support chat:', error);
    }
  };

  const setupSocketListeners = () => {
    // Listen for new messages
    socketService.onNewMessage((data: { chatId: string; message: any }) => {
      const message = data.message as MERNMessage;
      if (selectedChat && data.chatId === selectedChat._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      
      // Update chat list with new message
      setChats(prev => prev.map(chat => 
        chat._id === data.chatId 
          ? { ...chat, lastMessage: message, unreadCount: chat.unreadCount + 1 }
          : chat
      ));
    });

    // Listen for typing indicators
    socketService.onTypingUpdate((data: { chatId: string; userId: string; isTyping: boolean; userName: string }) => {
      if (selectedChat && data.chatId === selectedChat._id && data.userId !== user?._id) {
        setTypingUsers(prev => 
          data.isTyping 
            ? [...prev.filter(id => id !== data.userId), data.userId]
            : prev.filter(id => id !== data.userId)
        );
      }
    });

    // Listen for message reactions
    socketService.onMessageReaction((data: { messageId: string; emoji: string; userId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? {
              ...msg,
              reactions: [
                ...msg.reactions.filter(r => r.user !== data.userId || r.emoji !== data.emoji),
                { emoji: data.emoji, user: data.userId }
              ]
            }
          : msg
      ));
    });

    // Listen for read receipts
    socketService.onMessageRead((data: { messageIds: string[]; userId: string }) => {
      setMessages(prev => prev.map(msg => 
        data.messageIds.includes(msg._id)
          ? {
              ...msg,
              readBy: [
                ...msg.readBy.filter(r => r.user !== data.userId),
                { user: data.userId, readAt: new Date() }
              ]
            }
          : msg
      ));
    });
  };

  const selectChat = async (chat: MERNChat) => {
    try {
      setSelectedChat(chat);
      setMessages([]);
      setLoading(true);

      // Join the chat room
      socketService.joinChat(chat._id);

      // Fetch chat messages from backend
      const response = await chatAPI.getChatMessages(chat._id);
      const chatMessages = response.data.data.messages;
      
      setMessages(chatMessages);
      
      // Mark messages as read
      const unreadMessageIds = chatMessages
        .filter((msg: MERNMessage) => !msg.readBy.some(r => r.user === user?._id))
        .map((msg: MERNMessage) => msg._id);
      
      if (unreadMessageIds.length > 0) {
        await chatAPI.markAsRead(unreadMessageIds);
      }

      // Update unread count
      setChats(prev => prev.map(c => 
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      ));

      scrollToBottom();
      
    } catch (error: any) {
      console.error('Failed to select chat:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Send message via API
      const response = await chatAPI.sendMessage(selectedChat._id, {
        content: messageContent,
        messageType: 'text'
      });

      const sentMessage = response.data.data.message;
      
      // Add message to local state
      setMessages(prev => [...prev, sentMessage]);
      
      // Update chat list
      setChats(prev => prev.map(chat => 
        chat._id === selectedChat._id 
          ? { ...chat, lastMessage: sentMessage }
          : chat
      ));

      scrollToBottom();

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        socketService.updateTypingStatus(selectedChat._id, false);
      }

    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!selectedChat) return;

    // Start typing indicator
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      socketService.updateTypingStatus(selectedChat._id, true);
    }

    // Stop typing indicator after 3 seconds of no typing
    if (isTyping) {
      setTimeout(() => {
        setIsTyping(false);
        socketService.updateTypingStatus(selectedChat._id, false);
      }, 3000);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await chatAPI.addReaction(messageId, emoji);
      // Socket will handle the real-time update
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 100);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMessageStatus = (message: MERNMessage) => {
    if (!selectedChat) return null;
    
    const isMyMessage = message.sender._id === user?._id;
    if (!isMyMessage) return null;

    const readByOthers = message.readBy.filter(r => r.user !== user?._id);
    
    if (readByOthers.length > 0) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (loading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="cursor-target"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="cursor-target">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="cursor-target">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex flex-col flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chats" className="cursor-target">Chats</TabsTrigger>
              <TabsTrigger value="contacts" className="cursor-target">Contacts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border-b border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError('')}
              className="mt-2 cursor-target"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <TabsContent value="chats" className="mt-0">
            <div className="space-y-1 p-2">
              {chats.map((chat) => {
                const otherParticipant = chat.participants.find(p => p._id !== user?._id);
                return (
                  <motion.div
                    key={chat._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`p-3 cursor-pointer transition-colors cursor-target ${
                        selectedChat?._id === chat._id 
                          ? 'bg-primary/10 border-primary/20' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => selectChat(chat)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={chat.isGroupChat ? chat.name : otherParticipant?.profilePicture} 
                              alt="Avatar" 
                            />
                            <AvatarFallback>
                              {chat.isGroupChat 
                                ? chat.name?.charAt(0).toUpperCase() || 'G'
                                : otherParticipant?.firstName?.charAt(0).toUpperCase() || 'U'
                              }
                            </AvatarFallback>
                          </Avatar>
                          {otherParticipant?.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {chat.isGroupChat 
                                ? chat.name
                                : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`
                              }
                            </p>
                            {chat.lastMessage && (
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage?.content || 'No messages yet'}
                            </p>
                            {chat.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="mt-0">
            <div className="p-4 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p>Contact management coming soon</p>
            </div>
          </TabsContent>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={selectedChat.isGroupChat ? '/api/placeholder/40/40' : selectedChat.participants.find(p => p._id !== user?._id)?.profilePicture} 
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedChat.isGroupChat ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        selectedChat.participants.find(p => p._id !== user?._id)?.firstName?.[0] || 'U'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="font-semibold">
                      {selectedChat.isGroupChat 
                        ? selectedChat.name || 'Group Chat'
                        : `${selectedChat.participants.find(p => p._id !== user?._id)?.firstName} ${selectedChat.participants.find(p => p._id !== user?._id)?.lastName}`
                      }
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.isGroupChat 
                        ? `${selectedChat.participants.length} participants`
                        : selectedChat.participants.find(p => p._id !== user?._id)?.isOnline ? 'Online' : 'Offline'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="cursor-target">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="cursor-target">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="cursor-target">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const isMyMessage = message.sender._id === user?._id;
                  
                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[70%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMyMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender.profilePicture} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {message.sender.firstName[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`space-y-1 ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                          <Card className={`p-3 ${
                            isMyMessage 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            
                            {/* Message Reactions */}
                            {message.reactions.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {message.reactions.map((reaction, index) => (
                                  <span key={index} className="text-xs bg-background/20 px-2 py-1 rounded-full">
                                    {reaction.emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                          </Card>
                          
                          <div className={`flex items-center gap-1 text-xs text-muted-foreground ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span>{formatTime(message.createdAt)}</span>
                            {getMessageStatus(message)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing Indicator */}
                <AnimatePresence>
                  {typingUsers.length > 0 && (
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

            {/* Message Input */}
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
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 cursor-target"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button variant="ghost" size="sm" className="p-2 cursor-target">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 cursor-target">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={sendMessage}
                  size="sm"
                  className="px-3 cursor-target"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Real-time messaging powered by MERN stack • End-to-end encrypted
              </p>
            </div>
          </>
        ) : (
          /* No Chat Selected State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Select a conversation</h3>
                <p className="text-muted-foreground">Choose from your existing conversations or start a new one</p>
              </div>
              <Button className="cursor-target" onClick={initializeChat}>
                <Plus className="h-4 w-4 mr-2" />
                Refresh Chats
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MERNChatPage;