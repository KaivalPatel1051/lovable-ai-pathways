import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface Reel {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  tags: string[];
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  is_liked?: boolean;
}

const SupabaseReelsPage: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      setLoading(true);
      setError('');

      // First, let's create some sample reels if none exist
      const { data: existingReels, error: checkError } = await supabase
        .from('reels')
        .select('*')
        .limit(1);

      if (checkError) {
        console.error('Error checking reels:', checkError);
      }

      // If no reels exist, create sample data
      if (!existingReels || existingReels.length === 0) {
        await createSampleReels();
      }

      // Load reels with profile information
      const { data, error: fetchError } = await supabase
        .from('reels')
        .select(`
          *,
          profiles (
            username,
            first_name,
            last_name,
            profile_picture
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        throw fetchError;
      }

      setReels(data || []);
    } catch (err: any) {
      console.error('Error loading reels:', err);
      setError('Failed to load reels. Using demo content.');
      // Load demo reels if database fails
      setReels(getDemoReels());
    } finally {
      setLoading(false);
    }
  };

  const createSampleReels = async () => {
    if (!user) return;

    const sampleReels = [
      {
        user_id: user.id,
        title: "Day 30 Sober! 🎉",
        description: "Celebrating my 30-day milestone in recovery. Every day is a victory!",
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail_url: "https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Day+30",
        tags: ["milestone", "sobriety", "recovery"],
        is_public: true
      },
      {
        user_id: user.id,
        title: "Morning Meditation 🧘‍♀️",
        description: "Starting my day with mindfulness and gratitude. This practice has been life-changing!",
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail_url: "https://via.placeholder.com/400x600/06b6d4/ffffff?text=Meditation",
        tags: ["meditation", "mindfulness", "morning"],
        is_public: true
      },
      {
        user_id: user.id,
        title: "Recovery Tips 💪",
        description: "Sharing what helped me in early recovery. You've got this!",
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail_url: "https://via.placeholder.com/400x600/10b981/ffffff?text=Recovery+Tips",
        tags: ["tips", "recovery", "support"],
        is_public: true
      }
    ];

    for (const reel of sampleReels) {
      await supabase.from('reels').insert(reel);
    }
  };

  const getDemoReels = (): Reel[] => [
    {
      id: 'demo-1',
      title: "Day 30 Sober! 🎉",
      description: "Celebrating my 30-day milestone in recovery. Every day is a victory!",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail_url: "https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Day+30",
      likes_count: 24,
      comments_count: 8,
      shares_count: 3,
      tags: ["milestone", "sobriety", "recovery"],
      created_at: new Date().toISOString(),
      user_id: 'demo-user',
      profiles: {
        username: 'recovery_warrior',
        first_name: 'Sarah',
        last_name: 'Johnson',
        profile_picture: 'https://via.placeholder.com/40x40/8b5cf6/ffffff?text=SJ'
      }
    },
    {
      id: 'demo-2',
      title: "Morning Meditation 🧘‍♀️",
      description: "Starting my day with mindfulness and gratitude. This practice has been life-changing!",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail_url: "https://via.placeholder.com/400x600/06b6d4/ffffff?text=Meditation",
      likes_count: 31,
      comments_count: 12,
      shares_count: 5,
      tags: ["meditation", "mindfulness", "morning"],
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user_id: 'demo-user-2',
      profiles: {
        username: 'mindful_mike',
        first_name: 'Mike',
        last_name: 'Chen',
        profile_picture: 'https://via.placeholder.com/40x40/06b6d4/ffffff?text=MC'
      }
    },
    {
      id: 'demo-3',
      title: "Recovery Tips 💪",
      description: "Sharing what helped me in early recovery. You've got this!",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail_url: "https://via.placeholder.com/400x600/10b981/ffffff?text=Recovery+Tips",
      likes_count: 18,
      comments_count: 6,
      shares_count: 2,
      tags: ["tips", "recovery", "support"],
      created_at: new Date(Date.now() - 7200000).toISOString(),
      user_id: 'demo-user-3',
      profiles: {
        username: 'coach_alex',
        first_name: 'Alex',
        last_name: 'Rivera',
        profile_picture: 'https://via.placeholder.com/40x40/10b981/ffffff?text=AR'
      }
    }
  ];

  const handleLike = async (reelId: string) => {
    if (!user) return;

    try {
      const reel = reels.find(r => r.id === reelId);
      if (!reel) return;

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('reel_likes')
        .select('id')
        .eq('reel_id', reelId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('reel_likes')
          .delete()
          .eq('reel_id', reelId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('reel_likes')
          .insert({ reel_id: reelId, user_id: user.id });
      }

      // Update local state
      setReels(prev => prev.map(r => 
        r.id === reelId 
          ? { 
              ...r, 
              likes_count: existingLike ? r.likes_count - 1 : r.likes_count + 1,
              is_liked: !existingLike
            }
          : r
      ));
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleShare = async (reelId: string) => {
    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;

    try {
      await navigator.share({
        title: reel.title,
        text: reel.description,
        url: window.location.href
      });
      
      // Update share count
      setReels(prev => prev.map(r => 
        r.id === reelId ? { ...r, shares_count: r.shares_count + 1 } : r
      ));
    } catch (error) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const nextReel = () => {
    setCurrentIndex(prev => (prev + 1) % reels.length);
  };

  const prevReel = () => {
    setCurrentIndex(prev => (prev - 1 + reels.length) % reels.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading inspiring reels...</p>
        </div>
      </div>
    );
  }

  if (error && reels.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={loadReels}
            className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/50 to-slate-900/50" />
      
      {/* Main reel display */}
      <div className="relative h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReel?.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-sm h-full max-h-[80vh] bg-black rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Video */}
            <div className="relative w-full h-full">
              <video
                src={currentReel?.video_url}
                poster={currentReel?.thumbnail_url}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                autoPlay={isPlaying}
                playsInline
              />
              
              {/* Video controls overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-black/50 text-white p-4 rounded-full"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
              </div>

              {/* Mute button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              {/* User info */}
              <div className="flex items-center mb-3">
                <img
                  src={currentReel?.profiles?.profile_picture || `https://via.placeholder.com/40x40/8b5cf6/ffffff?text=${currentReel?.profiles?.first_name?.[0] || 'U'}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-white font-semibold">@{currentReel?.profiles?.username}</p>
                  <p className="text-gray-300 text-sm">
                    {currentReel?.profiles?.first_name} {currentReel?.profiles?.last_name}
                  </p>
                </div>
              </div>

              {/* Title and description */}
              <h3 className="text-white font-bold text-lg mb-2">{currentReel?.title}</h3>
              <p className="text-gray-200 text-sm mb-4 line-clamp-2">{currentReel?.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {currentReel?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-6">
          <button
            onClick={() => handleLike(currentReel?.id)}
            className="flex flex-col items-center text-white hover:scale-110 transition-transform"
          >
            <Heart 
              size={32} 
              className={`mb-1 ${currentReel?.is_liked ? 'fill-red-500 text-red-500' : ''}`} 
            />
            <span className="text-sm">{currentReel?.likes_count || 0}</span>
          </button>

          <button className="flex flex-col items-center text-white hover:scale-110 transition-transform">
            <MessageCircle size={32} className="mb-1" />
            <span className="text-sm">{currentReel?.comments_count || 0}</span>
          </button>

          <button
            onClick={() => handleShare(currentReel?.id)}
            className="flex flex-col items-center text-white hover:scale-110 transition-transform"
          >
            <Share2 size={32} className="mb-1" />
            <span className="text-sm">{currentReel?.shares_count || 0}</span>
          </button>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevReel}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          disabled={reels.length <= 1}
        >
          ←
        </button>

        <button
          onClick={nextReel}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors mr-20"
          disabled={reels.length <= 1}
        >
          →
        </button>

        {/* Progress indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {reels.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-purple-500' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupabaseReelsPage;
