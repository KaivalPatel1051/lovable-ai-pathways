import { supabase } from '@/lib/supabase';
import type { Tables, Database } from '@/lib/supabase';

// Types
type Profile = Tables<'profiles'>;
type AddictionProfile = Tables<'addiction_profiles'>;
type Reel = Tables<'reels'>;
type ReelComment = Tables<'reel_comments'>;
type Message = Tables<'messages'>;
type Chat = Tables<'chats'>;
type Friendship = Tables<'friendships'>;
type Notification = Tables<'notifications'>;

// User/Profile API
export const profileAPI = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  // Search users
  searchUsers: async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, first_name, last_name, profile_picture')
      .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(20);
    
    return { data, error };
  },

  // Get user stats
  getUserStats: async (userId: string) => {
    const [reelsResult, friendsResult] = await Promise.all([
      supabase.from('reels').select('id').eq('user_id', userId),
      supabase.from('friendships').select('id').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`).eq('status', 'accepted')
    ]);

    return {
      reelsCount: reelsResult.data?.length || 0,
      friendsCount: friendsResult.data?.length || 0,
      error: reelsResult.error || friendsResult.error
    };
  }
};

// Addiction Profile API
export const addictionAPI = {
  // Get addiction profile
  getAddictionProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('addiction_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  },

  // Create/Update addiction profile
  upsertAddictionProfile: async (userId: string, profileData: Omit<AddictionProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('addiction_profiles')
      .upsert({
        user_id: userId,
        ...profileData
      })
      .select()
      .single();
    
    return { data, error };
  }
};

// Reels API
export const reelsAPI = {
  // Get reels with pagination
  getReels: async (page = 0, limit = 10) => {
    const { data, error } = await supabase
      .from('reels')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          first_name,
          last_name,
          profile_picture
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    
    return { data, error };
  },

  // Get user's reels
  getUserReels: async (userId: string) => {
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Create reel
  createReel: async (reelData: Omit<Reel, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'shares_count'>) => {
    const { data, error } = await supabase
      .from('reels')
      .insert(reelData)
      .select()
      .single();
    
    return { data, error };
  },

  // Like/Unlike reel
  toggleLike: async (reelId: string, userId: string) => {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('reel_likes')
      .select('id')
      .eq('reel_id', reelId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('reel_likes')
        .delete()
        .eq('reel_id', reelId)
        .eq('user_id', userId);
      
      return { liked: false, error };
    } else {
      // Like
      const { error } = await supabase
        .from('reel_likes')
        .insert({ reel_id: reelId, user_id: userId });
      
      return { liked: true, error };
    }
  },

  // Get reel comments
  getReelComments: async (reelId: string) => {
    const { data, error } = await supabase
      .from('reel_comments')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          first_name,
          last_name,
          profile_picture
        )
      `)
      .eq('reel_id', reelId)
      .order('created_at', { ascending: true });
    
    return { data, error };
  },

  // Add comment
  addComment: async (reelId: string, userId: string, content: string, parentCommentId?: string) => {
    const { data, error } = await supabase
      .from('reel_comments')
      .insert({
        reel_id: reelId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId
      })
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          first_name,
          last_name,
          profile_picture
        )
      `)
      .single();
    
    return { data, error };
  }
};

// Friends API
export const friendsAPI = {
  // Get friends list
  getFriends: async (userId: string) => {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        requester:requester_id (
          id,
          username,
          first_name,
          last_name,
          profile_picture
        ),
        addressee:addressee_id (
          id,
          username,
          first_name,
          last_name,
          profile_picture
        )
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');
    
    return { data, error };
  },

  // Get friend requests
  getFriendRequests: async (userId: string) => {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        requester:requester_id (
          id,
          username,
          first_name,
          last_name,
          profile_picture
        )
      `)
      .eq('addressee_id', userId)
      .eq('status', 'pending');
    
    return { data, error };
  },

  // Send friend request
  sendFriendRequest: async (requesterId: string, addresseeId: string) => {
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: 'pending'
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Accept/Decline friend request
  respondToFriendRequest: async (friendshipId: string, status: 'accepted' | 'declined') => {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId)
      .select()
      .single();
    
    return { data, error };
  }
};

// Chat API
export const chatAPI = {
  // Get user's chats
  getChats: async (userId: string) => {
    const { data, error } = await supabase
      .from('chat_participants')
      .select(`
        chats (
          id,
          name,
          is_group_chat,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .is('left_at', null);
    
    return { data, error };
  },

  // Get or create direct chat
  getOrCreateDirectChat: async (user1Id: string, user2Id: string) => {
    // First, try to find existing direct chat
    const { data: existingChats } = await supabase
      .from('chat_participants')
      .select(`
        chat_id,
        chats!inner (
          id,
          is_group_chat
        )
      `)
      .eq('user_id', user1Id)
      .eq('chats.is_group_chat', false);

    if (existingChats) {
      for (const chat of existingChats) {
        const { data: otherParticipant } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', chat.chat_id)
          .eq('user_id', user2Id)
          .single();

        if (otherParticipant) {
          return { data: { id: chat.chat_id }, error: null };
        }
      }
    }

    // Create new chat
    const { data: newChat, error: chatError } = await supabase
      .from('chats')
      .insert({
        is_group_chat: false,
        created_by: user1Id
      })
      .select()
      .single();

    if (chatError) return { data: null, error: chatError };

    // Add participants
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert([
        { chat_id: newChat.id, user_id: user1Id },
        { chat_id: newChat.id, user_id: user2Id }
      ]);

    if (participantsError) return { data: null, error: participantsError };

    return { data: newChat, error: null };
  },

  // Get chat messages
  getMessages: async (chatId: string, page = 0, limit = 50) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          username,
          first_name,
          last_name,
          profile_picture
        )
      `)
      .eq('chat_id', chatId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    
    return { data, error };
  },

  // Send message
  sendMessage: async (chatId: string, senderId: string, content: string, messageType: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text', mediaUrl?: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        message_type: messageType,
        media_url: mediaUrl
      })
      .select(`
        *,
        sender:sender_id (
          id,
          username,
          first_name,
          last_name,
          profile_picture
        )
      `)
      .single();
    
    return { data, error };
  },

  // Mark messages as read
  markAsRead: async (messageIds: string[], userId: string) => {
    const readStatuses = messageIds.map(messageId => ({
      message_id: messageId,
      user_id: userId
    }));

    const { error } = await supabase
      .from('message_read_status')
      .upsert(readStatuses);
    
    return { error };
  }
};

// Notifications API
export const notificationsAPI = {
  // Get user notifications
  getNotifications: async (userId: string, limit = 20) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    return { data, error };
  },

  // Create notification
  createNotification: async (notification: Omit<Notification, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    return { data, error };
  }
};

// Real-time subscriptions
export const realtimeAPI = {
  // Subscribe to chat messages
  subscribeToMessages: (chatId: string, callback: (message: any) => void) => {
    return supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to notifications
  subscribeToNotifications: (userId: string, callback: (notification: any) => void) => {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to reel likes/comments
  subscribeToReelUpdates: (reelId: string, callback: (update: any) => void) => {
    const likesChannel = supabase
      .channel(`reel_likes:${reelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reel_likes',
          filter: `reel_id=eq.${reelId}`
        },
        callback
      );

    const commentsChannel = supabase
      .channel(`reel_comments:${reelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reel_comments',
          filter: `reel_id=eq.${reelId}`
        },
        callback
      );

    return {
      likes: likesChannel.subscribe(),
      comments: commentsChannel.subscribe()
    };
  }
};

// Admin API (requires service role key)
export const adminAPI = {
  // Get all users (admin only)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Get platform stats
  getPlatformStats: async () => {
    const [usersResult, reelsResult, messagesResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('reels').select('id', { count: 'exact' }),
      supabase.from('messages').select('id', { count: 'exact' })
    ]);

    return {
      users: usersResult.count || 0,
      reels: reelsResult.count || 0,
      messages: messagesResult.count || 0,
      error: usersResult.error || reelsResult.error || messagesResult.error
    };
  }
};
