import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database Types (generated from Supabase)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          first_name: string
          last_name: string
          email: string
          profile_picture?: string
          bio?: string
          sobriety_date?: string
          days_sober: number
          is_active: boolean
          role: 'user' | 'admin' | 'moderator'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          first_name: string
          last_name: string
          email: string
          profile_picture?: string
          bio?: string
          sobriety_date?: string
          days_sober?: number
          is_active?: boolean
          role?: 'user' | 'admin' | 'moderator'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          first_name?: string
          last_name?: string
          email?: string
          profile_picture?: string
          bio?: string
          sobriety_date?: string
          days_sober?: number
          is_active?: boolean
          role?: 'user' | 'admin' | 'moderator'
          updated_at?: string
        }
      }
      addiction_profiles: {
        Row: {
          id: string
          user_id: string
          addiction_type: string
          severity_level: number
          triggers: string[]
          coping_strategies: string[]
          support_system: string[]
          goals: string[]
          medical_history?: string
          therapy_history?: string
          relapse_history?: string
          emergency_contacts: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          addiction_type: string
          severity_level: number
          triggers: string[]
          coping_strategies: string[]
          support_system: string[]
          goals: string[]
          medical_history?: string
          therapy_history?: string
          relapse_history?: string
          emergency_contacts?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          addiction_type?: string
          severity_level?: number
          triggers?: string[]
          coping_strategies?: string[]
          support_system?: string[]
          goals?: string[]
          medical_history?: string
          therapy_history?: string
          relapse_history?: string
          emergency_contacts?: any[]
          updated_at?: string
        }
      }
      reels: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          video_url: string
          thumbnail_url?: string
          duration: number
          likes_count: number
          comments_count: number
          shares_count: number
          is_public: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          video_url: string
          thumbnail_url?: string
          duration: number
          likes_count?: number
          comments_count?: number
          shares_count?: number
          is_public?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          video_url?: string
          thumbnail_url?: string
          duration?: number
          likes_count?: number
          comments_count?: number
          shares_count?: number
          is_public?: boolean
          tags?: string[]
          updated_at?: string
        }
      }
      reel_comments: {
        Row: {
          id: string
          reel_id: string
          user_id: string
          content: string
          parent_comment_id?: string
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reel_id: string
          user_id: string
          content: string
          parent_comment_id?: string
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reel_id?: string
          user_id?: string
          content?: string
          parent_comment_id?: string
          likes_count?: number
          updated_at?: string
        }
      }
      reel_likes: {
        Row: {
          id: string
          reel_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          reel_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          reel_id?: string
          user_id?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          name?: string
          is_group_chat: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string
          is_group_chat?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_group_chat?: boolean
          created_by?: string
          updated_at?: string
        }
      }
      chat_participants: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          joined_at: string
          left_at?: string
          role: 'member' | 'admin'
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          joined_at?: string
          left_at?: string
          role?: 'member' | 'admin'
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string
          role?: 'member' | 'admin'
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'image' | 'video' | 'audio' | 'file'
          media_url?: string
          reply_to_id?: string
          reactions: any[]
          is_edited: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'image' | 'video' | 'audio' | 'file'
          media_url?: string
          reply_to_id?: string
          reactions?: any[]
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'video' | 'audio' | 'file'
          media_url?: string
          reply_to_id?: string
          reactions?: any[]
          is_edited?: boolean
          is_deleted?: boolean
          updated_at?: string
        }
      }
      message_read_status: {
        Row: {
          id: string
          message_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          read_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'friend_request' | 'message' | 'reel_like' | 'reel_comment' | 'system'
          title: string
          message: string
          data?: any
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'friend_request' | 'message' | 'reel_like' | 'reel_comment' | 'system'
          title: string
          message: string
          data?: any
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'friend_request' | 'message' | 'reel_like' | 'reel_comment' | 'system'
          title?: string
          message?: string
          data?: any
          is_read?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
