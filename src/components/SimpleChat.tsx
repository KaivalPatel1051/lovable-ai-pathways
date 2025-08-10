import React, { useState, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_name: string;
}

const SimpleChat: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
    setupRealtime();
  }, []);

  const loadMessages = async () => {
    try {
      // Load demo messages for now
      const demoMessages: Message[] = [
        {
          id: '1',
          content: 'Welcome to the recovery support chat! 🌟',
          sender_id: 'system',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender_name: 'Support Bot'
        },
        {
          id: '2',
          content: 'How is everyone doing today?',
          sender_id: 'demo-user',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          sender_name: 'Sarah'
        },
        {
          id: '3',
          content: 'Feeling great! Day 30 sober today 💪',
          sender_id: 'demo-user-2',
          created_at: new Date(Date.now() - 900000).toISOString(),
          sender_name: 'Mike'
        }
      ];
      
      setMessages(demoMessages);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    // Setup realtime subscription for future use
    const subscription = supabase
      .channel('chat-messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('New message:', payload);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender_id: user.id,
      created_at: new Date().toISOString(),
      sender_name: user.user_metadata?.first_name || 'You'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Try to save to database (will work when schema is set up)
    try {
      await supabase.from('messages').insert({
        content: message.content,
        sender_id: user.id,
        chat_id: 'general' // Default chat
      });
    } catch (error) {
      console.log('Database not ready, message saved locally');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-black/30 p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-purple-400" size={24} />
            <h1 className="text-white text-xl font-bold">Recovery Support Chat</h1>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender_id === user?.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-100'
                }`}
              >
                <p className="text-sm font-medium mb-1">{message.sender_name}</p>
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a supportive message..."
              className="flex-1 bg-white/10 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChat;
