-- Addiction Recovery App - Supabase Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'file');
CREATE TYPE notification_type AS ENUM ('friend_request', 'message', 'reel_like', 'reel_comment', 'system');
CREATE TYPE participant_role AS ENUM ('member', 'admin');

-- 1. User Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    bio TEXT,
    sobriety_date DATE,
    days_sober INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Addiction Profiles Table (detailed addiction data)
CREATE TABLE addiction_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    addiction_type VARCHAR(100) NOT NULL,
    severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 10),
    triggers TEXT[] DEFAULT '{}',
    coping_strategies TEXT[] DEFAULT '{}',
    support_system TEXT[] DEFAULT '{}',
    goals TEXT[] DEFAULT '{}',
    medical_history TEXT,
    therapy_history TEXT,
    relapse_history TEXT,
    emergency_contacts JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Reels Table
CREATE TABLE reels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER NOT NULL, -- in seconds
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reel Comments Table
CREATE TABLE reel_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reel_id UUID REFERENCES reels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES reel_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reel Likes Table
CREATE TABLE reel_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reel_id UUID REFERENCES reels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reel_id, user_id)
);

-- 6. Friendships Table
CREATE TABLE friendships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status friendship_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- 7. Chats Table
CREATE TABLE chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255),
    is_group_chat BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Chat Participants Table
CREATE TABLE chat_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    role participant_role DEFAULT 'member',
    UNIQUE(chat_id, user_id)
);

-- 9. Messages Table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    media_url TEXT,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    reactions JSONB DEFAULT '[]',
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Message Read Status Table
CREATE TABLE message_read_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- 11. Notifications Table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_addiction_profiles_user_id ON addiction_profiles(user_id);
CREATE INDEX idx_reels_user_id ON reels(user_id);
CREATE INDEX idx_reels_created_at ON reels(created_at DESC);
CREATE INDEX idx_reel_comments_reel_id ON reel_comments(reel_id);
CREATE INDEX idx_reel_comments_user_id ON reel_comments(user_id);
CREATE INDEX idx_reel_likes_reel_id ON reel_likes(reel_id);
CREATE INDEX idx_reel_likes_user_id ON reel_likes(user_id);
CREATE INDEX idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX idx_message_read_status_user_id ON message_read_status(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addiction_profiles_updated_at BEFORE UPDATE ON addiction_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reels_updated_at BEFORE UPDATE ON reels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reel_comments_updated_at BEFORE UPDATE ON reel_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'First'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Last'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update reel counts
CREATE OR REPLACE FUNCTION update_reel_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE reels SET likes_count = likes_count + 1 WHERE id = NEW.reel_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE reels SET likes_count = likes_count - 1 WHERE id = OLD.reel_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reel_likes_count
    AFTER INSERT OR DELETE ON reel_likes
    FOR EACH ROW EXECUTE FUNCTION update_reel_likes_count();

CREATE OR REPLACE FUNCTION update_reel_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE reels SET comments_count = comments_count + 1 WHERE id = NEW.reel_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE reels SET comments_count = comments_count - 1 WHERE id = OLD.reel_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reel_comments_count
    AFTER INSERT OR DELETE ON reel_comments
    FOR EACH ROW EXECUTE FUNCTION update_reel_comments_count();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addiction_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Addiction profiles policies (private data)
CREATE POLICY "Users can view own addiction profile" ON addiction_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addiction profile" ON addiction_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addiction profile" ON addiction_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Reels policies
CREATE POLICY "Public reels are viewable by everyone" ON reels FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own reels" ON reels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reels" ON reels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reels" ON reels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reels" ON reels FOR DELETE USING (auth.uid() = user_id);

-- Reel comments policies
CREATE POLICY "Comments are viewable by everyone" ON reel_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON reel_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON reel_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON reel_comments FOR DELETE USING (auth.uid() = user_id);

-- Reel likes policies
CREATE POLICY "Likes are viewable by everyone" ON reel_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON reel_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON reel_likes FOR DELETE USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view friendships involving them" ON friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can create friend requests" ON friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update friendships involving them" ON friendships FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Chat policies
CREATE POLICY "Users can view chats they participate in" ON chats FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_participants 
        WHERE chat_participants.chat_id = chats.id 
        AND chat_participants.user_id = auth.uid()
        AND chat_participants.left_at IS NULL
    )
);
CREATE POLICY "Users can create chats" ON chats FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Chat participants policies
CREATE POLICY "Users can view participants of chats they're in" ON chat_participants FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_participants cp 
        WHERE cp.chat_id = chat_participants.chat_id 
        AND cp.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
);

-- Messages policies
CREATE POLICY "Users can view messages in chats they participate in" ON messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_participants 
        WHERE chat_participants.chat_id = messages.chat_id 
        AND chat_participants.user_id = auth.uid()
        AND chat_participants.left_at IS NULL
    )
);
CREATE POLICY "Users can insert messages in chats they participate in" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM chat_participants 
        WHERE chat_participants.chat_id = messages.chat_id 
        AND chat_participants.user_id = auth.uid()
        AND chat_participants.left_at IS NULL
    )
);

-- Message read status policies
CREATE POLICY "Users can view read status for messages they can see" ON message_read_status FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN chat_participants cp ON cp.chat_id = m.chat_id
        WHERE m.id = message_read_status.message_id
        AND cp.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
);
CREATE POLICY "Users can insert own read status" ON message_read_status FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create some sample data (optional)
-- You can uncomment this after setting up authentication

/*
-- Sample reels data
INSERT INTO reels (user_id, title, description, video_url, duration, tags) VALUES
('00000000-0000-0000-0000-000000000001', 'Day 30 Sober!', 'Celebrating my 30-day milestone', 'https://example.com/video1.mp4', 45, ARRAY['milestone', 'sobriety']),
('00000000-0000-0000-0000-000000000001', 'Morning Meditation', 'Starting my day with mindfulness', 'https://example.com/video2.mp4', 120, ARRAY['meditation', 'morning']),
('00000000-0000-0000-0000-000000000002', 'Recovery Tips', 'What helped me in early recovery', 'https://example.com/video3.mp4', 180, ARRAY['tips', 'recovery']);
*/
