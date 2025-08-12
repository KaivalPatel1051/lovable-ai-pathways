import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Phone, 
  Video, 
  Info, 
  Send, 
  Image, 
  Heart, 
  Smile, 
  MoreHorizontal,
  ArrowLeft,
  Plus,
  Camera
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import NischayLoader from '../components/NischayLoader';
import { toast } from 'sonner';

interface Friend {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_online: boolean;
  last_seen?: string;
  latest_message?: {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  chat_id: string;
  created_at: string;
  message_type: 'text' | 'image' | 'emoji';
  is_read: boolean;
  media_url?: string;
  sender?: {
    username: string;
    first_name: string;
    profile_picture?: string;
  };
}

interface Chat {
  id: string;
  name?: string;
  is_group_chat: boolean;
  participants: Friend[];
  messages: Message[];
  created_at: string;
  updated_at: string;
}

const InstagramChatPage: React.FC = () => {
  const { user } = useSupabaseAuth();
  // using sonner toast
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadFriends();
      setupRealtimeSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadFriends = async () => {
    try {
      setLoading(true);
      console.log('Loading friends for user:', user?.id);
      
      // For now, always use demo data to ensure the chat works immediately
      // TODO: Implement real database loading after schema is set up
      console.log('Using demo friends data');
      setFriends(getDemoFriends());
      
      // Uncomment this section when database is properly set up:
      /*
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          *,
          addressee:profiles!friendships_addressee_id_fkey (
            id,
            username,
            first_name,
            last_name,
            profile_picture,
            is_online,
            last_seen
          ),
          requester:profiles!friendships_requester_id_fkey (
            id,
            username,
            first_name,
            last_name,
            profile_picture,
            is_online,
            last_seen
          )
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`);

      if (error) {
        console.error('Error loading friends:', error);
        setFriends(getDemoFriends());
        return;
      }

      if (friendships && friendships.length > 0) {
        const friendsData = friendships.map(friendship => {
          const friend = friendship.requester_id === user?.id 
            ? friendship.addressee 
            : friendship.requester;
          return {
            ...friend,
            latest_message: null
          };
        });
        setFriends(friendsData);
      } else {
        setFriends(getDemoFriends());
      }
      */
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriends(getDemoFriends());
    } finally {
      setLoading(false);
    }
  };

  const getDemoFriends = (): Friend[] => [
    {
      id: 'friend-1',
      username: 'sarah_recovery',
      first_name: 'Sarah',
      last_name: 'Johnson',
      profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      is_online: true,
      latest_message: {
        content: 'How was your meeting today?',
        created_at: new Date(Date.now() - 300000).toISOString(),
        is_read: false,
        sender_id: 'friend-1'
      }
    },
    {
      id: 'friend-2',
      username: 'mike_mindful',
      first_name: 'Mike',
      last_name: 'Chen',
      profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      is_online: false,
      last_seen: new Date(Date.now() - 3600000).toISOString(),
      latest_message: {
        content: 'Thanks for the support! 🙏',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        is_read: true,
        sender_id: 'friend-2'
      }
    },
    {
      id: 'friend-3',
      username: 'alex_coach',
      first_name: 'Alex',
      last_name: 'Rivera',
      profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      is_online: true,
      latest_message: {
        content: 'Great progress this week! Keep it up! 💪',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        is_read: true,
        sender_id: 'friend-3'
      }
    },
    {
      id: 'friend-4',
      username: 'emma_support',
      first_name: 'Emma',
      last_name: 'Wilson',
      profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      is_online: false,
      last_seen: new Date(Date.now() - 86400000).toISOString(),
      latest_message: {
        content: 'See you at group tomorrow!',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        is_read: true,
        sender_id: 'friend-4'
      }
    },
    {
      id: 'friend-5',
      username: 'david_strong',
      first_name: 'David',
      last_name: 'Brown',
      profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      is_online: true,
      latest_message: {
        content: 'Just hit 90 days! Feeling amazing! 🎉',
        created_at: new Date(Date.now() - 1200000).toISOString(),
        is_read: false,
        sender_id: 'friend-5'
      }
    },
    {
      id: 'friend-6',
      username: 'lisa_hope',
      first_name: 'Lisa',
      last_name: 'Martinez',
      profile_picture: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face',
      is_online: false,
      last_seen: new Date(Date.now() - 7200000).toISOString(),
      latest_message: {
        content: 'The meditation session was incredible today 🧘‍♀️',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: true,
        sender_id: 'friend-6'
      }
    }
  ];

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (selectedChat && newMessage.chat_id === selectedChat.id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const openChat = async (friend: Friend) => {
    try {
      // Find or create chat with this friend
      let { data: existingChat, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_participants (
            user_id,
            profiles (
              id,
              username,
              first_name,
              last_name,
              profile_picture
            )
          )
        `)
        .eq('is_group_chat', false)
        .limit(1)
        .single();

      if (error || !existingChat) {
        // Create new chat
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            is_group_chat: false,
            created_by: user?.id
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating chat:', createError);
          // Use demo chat for now
          existingChat = {
            id: `demo-chat-${friend.id}`,
            is_group_chat: false,
            created_by: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            chat_participants: [
              { user_id: user?.id, profiles: { 
                id: user?.id, 
                username: user?.user_metadata?.username || 'You',
                first_name: user?.user_metadata?.first_name || 'You',
                last_name: user?.user_metadata?.last_name || '',
                profile_picture: user?.user_metadata?.profile_picture
              }},
              { user_id: friend.id, profiles: friend }
            ]
          };
        } else {
          // Add participants
          await supabase
            .from('chat_participants')
            .insert([
              { chat_id: newChat.id, user_id: user?.id },
              { chat_id: newChat.id, user_id: friend.id }
            ]);
          
          existingChat = newChat;
        }
      }

      const chatData: Chat = {
        id: existingChat.id,
        name: existingChat.name,
        is_group_chat: existingChat.is_group_chat,
        participants: [friend],
        messages: [],
        created_at: existingChat.created_at,
        updated_at: existingChat.updated_at
      };

      setSelectedChat(chatData);
      loadMessages(existingChat.id, friend);

      // Mark messages as read for this chat (not sent by current user)
      try {
        if (user?.id) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('chat_id', existingChat.id)
            .neq('sender_id', user.id)
            .eq('is_read', false);
        }
      } catch (e) {
        console.error('Error marking messages as read:', e);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      // Create demo chat
      const demoChat: Chat = {
        id: `demo-chat-${friend.id}`,
        is_group_chat: false,
        participants: [friend],
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSelectedChat(demoChat);
      loadMessages(demoChat.id, friend);
    }
  };

  const loadMessages = async (chatId: string, friend: Friend) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles (
            username,
            first_name,
            profile_picture
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
      }

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // Load demo messages
        setMessages(getDemoMessages(friend));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages(getDemoMessages(friend));
    }
  };

  const getDemoMessages = (friend: Friend): Message[] => [
    {
      id: 'msg-1',
      content: 'Hey! How are you doing today?',
      sender_id: friend.id,
      chat_id: `demo-chat-${friend.id}`,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      message_type: 'text',
      is_read: true,
      sender: {
        username: friend.username,
        first_name: friend.first_name,
        profile_picture: friend.profile_picture
      }
    },
    {
      id: 'msg-2',
      content: 'I\'m doing great! Just finished my morning meditation 🧘‍♀️',
      sender_id: user?.id || 'you',
      chat_id: `demo-chat-${friend.id}`,
      created_at: new Date(Date.now() - 3300000).toISOString(),
      message_type: 'text',
      is_read: true,
      sender: {
        username: user?.user_metadata?.username || 'You',
        first_name: user?.user_metadata?.first_name || 'You',
        profile_picture: user?.user_metadata?.profile_picture
      }
    },
    {
      id: 'msg-3',
      content: 'That\'s awesome! Meditation has been such a game changer for me too',
      sender_id: friend.id,
      chat_id: `demo-chat-${friend.id}`,
      created_at: new Date(Date.now() - 3000000).toISOString(),
      message_type: 'text',
      is_read: true,
      sender: {
        username: friend.username,
        first_name: friend.first_name,
        profile_picture: friend.profile_picture
      }
    }
  ];

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const messageData = {
      content: newMessage.trim(),
      sender_id: user.id,
      chat_id: selectedChat.id,
      message_type: 'text' as const,
      is_read: false
    };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
      }

      // Add message to local state
      const newMsg: Message = {
        id: data?.id || `temp-${Date.now()}`,
        ...messageData,
        created_at: new Date().toISOString(),
        sender: {
          username: user.user_metadata?.username || 'You',
          first_name: user.user_metadata?.first_name || 'You',
          profile_picture: user.user_metadata?.profile_picture
        }
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Add message optimistically for demo
      const newMsg: Message = {
        id: `temp-${Date.now()}`,
        ...messageData,
        created_at: new Date().toISOString(),
        sender: {
          username: user.user_metadata?.username || 'You',
          first_name: user.user_metadata?.first_name || 'You',
          profile_picture: user.user_metadata?.profile_picture
        }
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    }
  };

  // Quick emoji reaction (e.g., heart) when no text is typed
  const sendQuickEmoji = async (emoji: string) => {
    if (!selectedChat || !user) return;

    const messageData = {
      content: emoji,
      sender_id: user.id,
      chat_id: selectedChat.id,
      message_type: 'emoji' as const,
      is_read: false
    };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error sending emoji message:', error);
      }

      const newMsg: Message = {
        id: data?.id || `temp-${Date.now()}`,
        ...messageData,
        created_at: new Date().toISOString(),
        sender: {
          username: user.user_metadata?.username || 'You',
          first_name: user.user_metadata?.first_name || 'You',
          profile_picture: user.user_metadata?.profile_picture
        }
      };
      setMessages(prev => [...prev, newMsg]);
    } catch (e) {
      console.error('Error sending quick emoji:', e);
    }
  };

  const handleHeartClick = () => {
    if (!newMessage.trim()) {
      sendQuickEmoji('❤️');
    }
  };

  // Image upload support via Supabase Storage
  const handleImageButton = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat || !user) return;

    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data: publicData } = supabase.storage.from('chat-media').getPublicUrl(path);
      const mediaUrl = publicData?.publicUrl;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          sender_id: user.id,
          content: '',
          message_type: 'image',
          media_url: mediaUrl,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending image message:', error);
        toast.error(`Send failed: ${error.message}`);
      }

      const newMsg: Message = {
        id: data?.id || `temp-${Date.now()}`,
        content: '',
        sender_id: user.id,
        chat_id: selectedChat.id,
        created_at: new Date().toISOString(),
        message_type: 'image',
        is_read: false,
        media_url: mediaUrl,
        sender: {
          username: user.user_metadata?.username || 'You',
          first_name: user.user_metadata?.first_name || 'You',
          profile_picture: user.user_metadata?.profile_picture
        }
      };
      setMessages(prev => [...prev, newMsg]);
    } catch (e:any) {
      console.error('Image send error:', e);
      toast.error(`Error: ${e?.message || 'Could not send image'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatLastSeen = (dateString: string) => {
    const now = new Date();
    const lastSeen = new Date(dateString);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <NischayLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Friends List Sidebar */}
      <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-border bg-card neon-border`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground neon-text">Messages</h1>
            <button className="p-2 hover:bg-muted rounded-full neon-glow transition-all">
              <Plus size={20} className="text-primary" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary neon-border text-foreground"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto">
          {filteredFriends.map((friend) => (
            <motion.div
              key={friend.id}
              whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
              onClick={() => openChat(friend)}
              className="flex items-center p-4 cursor-pointer hover:bg-muted transition-colors border-b border-border/50"
            >
              <div className="relative">
                <img
                  src={friend.profile_picture || `https://via.placeholder.com/50x50/8b5cf6/ffffff?text=${friend.first_name[0]}`}
                  alt={friend.first_name}
                  className="w-12 h-12 rounded-full"
                />
                {friend.is_online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground truncate">
                    {friend.first_name} {friend.last_name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {friend.latest_message ? formatTime(friend.latest_message.created_at) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    @{friend.username}
                  </p>
                  <div className={`w-2 h-2 rounded-full ${
                    friend.is_online ? 'bg-success shadow-[0_0_10px_hsl(var(--success))]' : 'bg-muted-foreground'
                  }`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-1 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="relative">
                <img
                  src={selectedChat.participants[0]?.profile_picture || `https://via.placeholder.com/40x40/8b5cf6/ffffff?text=${selectedChat.participants[0]?.first_name[0]}`}
                  alt={selectedChat.participants[0]?.first_name}
                  className="w-10 h-10 rounded-full"
                />
                {selectedChat.participants[0]?.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div>
                <p className="font-semibold">
                  {selectedChat.participants[0]?.first_name} {selectedChat.participants[0]?.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedChat.participants[0]?.is_online 
                    ? 'Active now' 
                    : selectedChat.participants[0]?.last_seen 
                      ? `Active ${formatLastSeen(selectedChat.participants[0].last_seen)}`
                      : 'Offline'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Info size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                  >
                    {!isOwn && (
                      <div className="w-6 h-6">
                        {showAvatar && (
                          <img
                            src={message.sender?.profile_picture || `https://via.placeholder.com/24x24/8b5cf6/ffffff?text=${message.sender?.first_name?.[0] || 'U'}`}
                            alt={message.sender?.first_name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                      </div>
                    )}
                    
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwn 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.message_type === 'image' && message.media_url ? (
                        <img src={message.media_url} alt="sent image" className="max-w-full rounded-lg" />
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Camera size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full" onClick={handleImageButton}>
                <Image size={20} className="text-gray-600" />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="flex-1 flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="p-1 hover:bg-gray-200 rounded-full">
                  <Smile size={16} className="text-gray-600" />
                </button>
              </div>
              
              {newMessage.trim() ? (
                <button
                  onClick={sendMessage}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Send size={16} />
                </button>
              ) : (
                <button className="p-2 hover:bg-gray-100 rounded-full" onClick={handleHeartClick}>
                  <Heart size={20} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Messages</h2>
            <p className="text-gray-600">Send private messages to friends in your recovery journey.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramChatPage;
