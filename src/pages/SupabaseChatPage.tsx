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
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { chatAPI, profileAPI, realtimeAPI } from '@/services/supabaseApi';
import { formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/lib/supabase';

// Supabase Message Interface
interface SupabaseMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_picture?: string;
  };
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string;
  reactions: any[];
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

interface ChatData {
  id: string;
  name?: string;
  is_group_chat: boolean;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_active: boolean;
}

const SupabaseChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useSupabaseAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chats, setChats] = useState<ChatData[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<SupabaseMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch user's chats
  const fetchChats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await chatAPI.getChats(user.id);
      if (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load chats');
      } else {
        const chatData = data?.map(item => item.chats).filter(Boolean) || [];
        setChats(chatData as ChatData[]);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats');
    }
  };

  // Fetch contacts (friends)
  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      // For now, we'll search for users as contacts
      // In a real app, this would be friends from the friendships table
      const { data, error } = await profileAPI.searchUsers('');
      if (error) {
        console.error('Error fetching contacts:', error);
      } else {
        const filteredContacts = data?.filter(contact => contact.id !== user.id) || [];
        setContacts(filteredContacts as Contact[]);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await chatAPI.getMessages(chatId);
      if (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      } else {
        const formattedMessages = data?.reverse().map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          message_type: msg.message_type,
          media_url: msg.media_url,
          reactions: msg.reactions || [],
          is_edited: msg.is_edited,
          created_at: msg.created_at,
          updated_at: msg.updated_at
        })) || [];
        setMessages(formattedMessages as SupabaseMessage[]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      const { data, error } = await chatAPI.sendMessage(
        selectedChat.id,
        user.id,
        newMessage.trim()
      );

      if (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message');
      } else if (data) {
        const formattedMessage: SupabaseMessage = {
          id: data.id,
          content: data.content,
          sender: data.sender,
          message_type: data.message_type,
          media_url: data.media_url,
          reactions: data.reactions || [],
          is_edited: data.is_edited,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setMessages(prev => [...prev, formattedMessage]);
        setNewMessage('');
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Start chat with contact
  const startChatWithContact = async (contact: Contact) => {
    if (!user) return;

    try {
      const { data, error } = await chatAPI.getOrCreateDirectChat(user.id, contact.id);
      if (error) {
        console.error('Error creating chat:', error);
        setError('Failed to start chat');
      } else if (data) {
        const newChat: ChatData = {
          id: data.id,
          name: `${contact.first_name} ${contact.last_name}`,
          is_group_chat: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
        await fetchMessages(data.id);
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Failed to start chat');
    }
  };

  // Initialize component
  useEffect(() => {
    if (user) {
      const initializeChat = async () => {
        setLoading(true);
        await Promise.all([fetchChats(), fetchContacts()]);
        setLoading(false);
      };
      
      initializeChat();
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!selectedChat || !user) return;

    const subscription = realtimeAPI.subscribeToMessages(
      selectedChat.id,
      (payload) => {
        console.log('New message received:', payload);
        if (payload.new && payload.new.sender_id !== user.id) {
          const newMessage: SupabaseMessage = {
            id: payload.new.id,
            content: payload.new.content,
            sender: {
              id: payload.new.sender_id,
              first_name: 'User',
              last_name: '',
              username: 'user',
              profile_picture: undefined
            },
            message_type: payload.new.message_type,
            media_url: payload.new.media_url,
            reactions: payload.new.reactions || [],
            is_edited: payload.new.is_edited,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at
          };
          
          setMessages(prev => [...prev, newMessage]);
          setTimeout(scrollToBottom, 100);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedChat, user]);

  // Handle chat selection
  const handleChatSelect = async (chat: ChatData) => {
    setSelectedChat(chat);
    await fetchMessages(chat.id);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Card className="p-6">
          <p className="text-center">Please log in to access chat</p>
          <Button onClick={() => navigate('/login')} className="mt-4 w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="cursor-target"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Messages</h1>
            <Button variant="ghost" size="icon" className="cursor-target">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 cursor-target"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border-b border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="chats" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chats" className="cursor-target">Chats</TabsTrigger>
            <TabsTrigger value="contacts" className="cursor-target">Contacts</TabsTrigger>
          </TabsList>

          {/* Chats Tab */}
          <TabsContent value="chats" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-2">
                {chats.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground">Start a chat with someone!</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedChat?.id === chat.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {chat.name ? chat.name.split(' ').map(n => n[0]).join('') : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {chat.name || 'Unknown Chat'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.is_group_chat ? 'Group Chat' : 'Direct Message'}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(chat.updated_at))}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-2">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No contacts found</p>
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-3 rounded-lg cursor-pointer hover:bg-muted/50 mb-2 transition-colors"
                      onClick={() => startChatWithContact(contact)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.profile_picture} />
                          <AvatarFallback>
                            {contact.first_name[0]}{contact.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {contact.first_name} {contact.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            @{contact.username}
                          </p>
                        </div>
                        <Badge variant={contact.is_active ? "default" : "secondary"}>
                          {contact.is_active ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
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
                    <AvatarFallback>
                      {selectedChat.name ? selectedChat.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{selectedChat.name || 'Unknown Chat'}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.is_group_chat ? 'Group Chat' : 'Direct Message'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="cursor-target">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="cursor-target">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="cursor-target">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-3 ${
                        message.sender.id === user?.id ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.profile_picture} />
                        <AvatarFallback>
                          {message.sender.first_name[0]}{message.sender.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`max-w-xs lg:max-w-md ${
                        message.sender.id === user?.id ? 'text-right' : 'text-left'
                      }`}>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.sender.id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(message.created_at))} ago
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="cursor-target">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="cursor-target pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 cursor-target"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="cursor-target"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Welcome to Chat</h2>
              <p className="text-muted-foreground">
                Select a conversation or start a new chat
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseChatPage;
