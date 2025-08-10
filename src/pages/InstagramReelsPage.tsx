import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Pause, Volume2, VolumeX, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface InstagramReel {
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
  is_bookmarked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  likes_count: number;
  profiles: {
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}

const InstagramReelsPage: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadReels();
  }, []);

  useEffect(() => {
    // Auto-play current video
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying]);

  const loadReels = async () => {
    try {
      setLoading(true);
      console.log('Loading reels...');
      
      // For now, always use demo data to ensure reels work immediately
      // TODO: Implement real database loading after schema is set up
      console.log('Using demo reels data');
      setReels(getDemoReels());
      
      // Uncomment this section when database is properly set up:
      /*
      const { data, error } = await supabase
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
        .limit(20);

      if (error) {
        console.error('Error loading reels:', error);
        setReels(getDemoReels());
        return;
      }

      if (data && data.length > 0) {
        setReels(data);
      } else {
        setReels(getDemoReels());
      }
      */
    } catch (error) {
      console.error('Error loading reels:', error);
      setReels(getDemoReels());
    } finally {
      setLoading(false);
    }
  };

  const getDemoReels = (): InstagramReel[] => [
    {
      id: 'demo-1',
      title: "30 Days Sober! 🎉",
      description: "Celebrating my 30-day milestone! Every day is a victory in recovery. The hardest part is behind me now! #sobriety #recovery #milestone #strength #30days",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
      likes_count: 1247,
      comments_count: 89,
      shares_count: 23,
      tags: ["sobriety", "recovery", "milestone", "strength", "30days"],
      created_at: new Date().toISOString(),
      user_id: 'demo-user-1',
      profiles: {
        username: 'recovery_warrior',
        first_name: 'Sarah',
        last_name: 'Johnson',
        profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-2',
      title: "Morning Meditation 🧘‍♀️",
      description: "Starting my day with mindfulness and gratitude. This 10-minute practice changed my entire life! Try it tomorrow morning. #meditation #mindfulness #recovery #morningroutine",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
      likes_count: 892,
      comments_count: 45,
      shares_count: 12,
      tags: ["meditation", "mindfulness", "recovery", "morningroutine"],
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user_id: 'demo-user-2',
      profiles: {
        username: 'mindful_mike',
        first_name: 'Mike',
        last_name: 'Chen',
        profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-3',
      title: "Recovery Tips 💪",
      description: "5 things that helped me in early recovery. Remember: progress, not perfection! You've got this! #recoverytips #support #hope #progress",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
      likes_count: 2156,
      comments_count: 178,
      shares_count: 67,
      tags: ["recoverytips", "support", "hope", "progress"],
      created_at: new Date(Date.now() - 7200000).toISOString(),
      user_id: 'demo-user-3',
      profiles: {
        username: 'coach_alex',
        first_name: 'Alex',
        last_name: 'Rivera',
        profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-4',
      title: "Healthy Cooking 🥗",
      description: "Making my favorite recovery meal! Nutrition is so important for healing. This quinoa bowl gives me energy all day! #healthyeating #nutrition #recovery #cooking",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=600&fit=crop",
      likes_count: 743,
      comments_count: 52,
      shares_count: 18,
      tags: ["healthyeating", "nutrition", "recovery", "cooking"],
      created_at: new Date(Date.now() - 10800000).toISOString(),
      user_id: 'demo-user-4',
      profiles: {
        username: 'healthy_emma',
        first_name: 'Emma',
        last_name: 'Wilson',
        profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-5',
      title: "90 Days Strong! 💪",
      description: "90 days of sobriety! The clarity, energy, and self-respect I've gained is incredible. To anyone struggling - it gets so much better! #90days #sobriety #strength #hope",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
      likes_count: 3421,
      comments_count: 234,
      shares_count: 89,
      tags: ["90days", "sobriety", "strength", "hope"],
      created_at: new Date(Date.now() - 14400000).toISOString(),
      user_id: 'demo-user-5',
      profiles: {
        username: 'david_strong',
        first_name: 'David',
        last_name: 'Brown',
        profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-6',
      title: "Yoga Flow 🧘‍♂️",
      description: "20-minute morning yoga flow for recovery. Movement is medicine! This routine helps me stay centered and strong. #yoga #movement #recovery #wellness",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
      likes_count: 1156,
      comments_count: 67,
      shares_count: 34,
      tags: ["yoga", "movement", "recovery", "wellness"],
      created_at: new Date(Date.now() - 18000000).toISOString(),
      user_id: 'demo-user-6',
      profiles: {
        username: 'yoga_james',
        first_name: 'James',
        last_name: 'Rodriguez',
        profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-7',
      title: "Support Group Love ❤️",
      description: "Just left my weekly support group. The connections and understanding here saved my life. Community is everything in recovery! #supportgroup #community #recovery #love",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=600&fit=crop",
      likes_count: 2089,
      comments_count: 145,
      shares_count: 56,
      tags: ["supportgroup", "community", "recovery", "love"],
      created_at: new Date(Date.now() - 21600000).toISOString(),
      user_id: 'demo-user-7',
      profiles: {
        username: 'community_lisa',
        first_name: 'Lisa',
        last_name: 'Martinez',
        profile_picture: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-8',
      title: "Nature Therapy 🌲",
      description: "Hiking has become my new addiction! Fresh air, movement, and perspective. Nature heals what the city breaks. #hiking #nature #recovery #therapy #outdoors",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop",
      likes_count: 1678,
      comments_count: 92,
      shares_count: 41,
      tags: ["hiking", "nature", "recovery", "therapy", "outdoors"],
      created_at: new Date(Date.now() - 25200000).toISOString(),
      user_id: 'demo-user-8',
      profiles: {
        username: 'nature_tom',
        first_name: 'Tom',
        last_name: 'Anderson',
        profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-9',
      title: "Creative Expression 🎨",
      description: "Art therapy session! Painting my emotions instead of numbing them. Creativity is such a powerful tool for healing and self-discovery. #art #creativity #recovery #healing",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop",
      likes_count: 934,
      comments_count: 78,
      shares_count: 29,
      tags: ["art", "creativity", "recovery", "healing"],
      created_at: new Date(Date.now() - 28800000).toISOString(),
      user_id: 'demo-user-9',
      profiles: {
        username: 'artist_maya',
        first_name: 'Maya',
        last_name: 'Patel',
        profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-10',
      title: "Gratitude Practice 🙏",
      description: "Three things I'm grateful for today: my health, my family's support, and this beautiful second chance at life. Gratitude changes everything! #gratitude #recovery #blessed #secondchance",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
      likes_count: 2567,
      comments_count: 189,
      shares_count: 73,
      tags: ["gratitude", "recovery", "blessed", "secondchance"],
      created_at: new Date(Date.now() - 32400000).toISOString(),
      user_id: 'demo-user-10',
      profiles: {
        username: 'grateful_anna',
        first_name: 'Anna',
        last_name: 'Thompson',
        profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-11',
      title: "Reading & Learning 📚",
      description: "Just finished 'The Body Keeps the Score' - mind blown! Knowledge is power in recovery. What books have helped you heal? #reading #learning #recovery #books",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
      likes_count: 1289,
      comments_count: 156,
      shares_count: 47,
      tags: ["reading", "learning", "recovery", "books"],
      created_at: new Date(Date.now() - 36000000).toISOString(),
      user_id: 'demo-user-11',
      profiles: {
        username: 'bookworm_sam',
        first_name: 'Sam',
        last_name: 'Davis',
        profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
      }
    },
    {
      id: 'demo-12',
      title: "Fitness Journey 🏃‍♀️",
      description: "6 months sober, 6 months of consistent exercise! My body and mind have never felt stronger. Exercise is my natural high now! #fitness #running #recovery #strength",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
      likes_count: 1834,
      comments_count: 112,
      shares_count: 38,
      tags: ["fitness", "running", "recovery", "strength"],
      created_at: new Date(Date.now() - 39600000).toISOString(),
      user_id: 'demo-user-12',
      profiles: {
        username: 'runner_kelly',
        first_name: 'Kelly',
        last_name: 'White',
        profile_picture: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face'
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
      // Optimistic update for demo
      setReels(prev => prev.map(r => 
        r.id === reelId 
          ? { 
              ...r, 
              likes_count: r.is_liked ? r.likes_count - 1 : r.likes_count + 1,
              is_liked: !r.is_liked
            }
          : r
      ));
    }
  };

  const loadComments = async (reelId: string) => {
    try {
      const { data, error } = await supabase
        .from('reel_comments')
        .select(`
          *,
          profiles (
            username,
            first_name,
            last_name,
            profile_picture
          )
        `)
        .eq('reel_id', reelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading comments:', error);
      }

      if (data && data.length > 0) {
        setComments(data);
      } else {
        // Demo comments
        setComments([
          {
            id: 'comment-1',
            content: 'So inspiring! Keep going! 💪',
            user_id: 'demo-user-1',
            created_at: new Date().toISOString(),
            likes_count: 12,
            profiles: {
              username: 'supporter1',
              first_name: 'Emma',
              last_name: 'Wilson',
              profile_picture: 'https://via.placeholder.com/32x32/f59e0b/ffffff?text=EW'
            }
          },
          {
            id: 'comment-2',
            content: 'Thank you for sharing your journey! ❤️',
            user_id: 'demo-user-2',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            likes_count: 8,
            profiles: {
              username: 'grateful_soul',
              first_name: 'David',
              last_name: 'Brown',
              profile_picture: 'https://via.placeholder.com/32x32/ef4444/ffffff?text=DB'
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('reel_comments')
        .insert({
          reel_id: reels[currentIndex].id,
          user_id: user.id,
          content: newComment.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
      }

      // Add comment to local state
      const newCommentObj: Comment = {
        id: data?.id || `temp-${Date.now()}`,
        content: newComment.trim(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        likes_count: 0,
        profiles: {
          username: user.user_metadata?.username || 'You',
          first_name: user.user_metadata?.first_name || 'You',
          last_name: user.user_metadata?.last_name || '',
          profile_picture: user.user_metadata?.profile_picture
        }
      };

      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');

      // Update comments count
      setReels(prev => prev.map(r => 
        r.id === reels[currentIndex].id 
          ? { ...r, comments_count: r.comments_count + 1 }
          : r
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const nextReel = () => {
    setCurrentIndex(prev => (prev + 1) % reels.length);
    setShowComments(false);
    setIsPlaying(true);
  };

  const prevReel = () => {
    setCurrentIndex(prev => (prev - 1 + reels.length) % reels.length);
    setShowComments(false);
    setIsPlaying(true);
  };

  // Touch/swipe navigation
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentIndex < reels.length - 1) {
      nextReel();
    }
    if (isDownSwipe && currentIndex > 0) {
      prevReel();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        prevReel();
      } else if (e.key === 'ArrowDown' && currentIndex < reels.length - 1) {
        nextReel();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isPlaying, reels.length]);

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Reels...</p>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Progress indicator */}
      <div className="absolute top-4 left-4 right-4 z-50 flex space-x-1">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Main reel display */}
      <div 
        className="relative h-screen"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReel?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Video */}
            <video
              ref={videoRef}
              src={currentReel?.video_url}
              poster={currentReel?.thumbnail_url}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              autoPlay
              playsInline
              onClick={(e) => {
                const now = Date.now();
                const DOUBLE_TAP_DELAY = 300;
                
                if (now - lastTap < DOUBLE_TAP_DELAY) {
                  // Double tap - like the reel
                  e.preventDefault();
                  handleLike(currentReel?.id);
                  setShowLikeAnimation(true);
                  setTimeout(() => setShowLikeAnimation(false), 1000);
                } else {
                  // Single tap - play/pause
                  setIsPlaying(!isPlaying);
                }
                setLastTap(now);
              }}
            />

            {/* Double-tap like animation */}
            {showLikeAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart size={100} className="text-red-500 fill-red-500" />
              </motion.div>
            )}

            {/* Play/Pause overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="text-white" size={80} fill="white" />
              </div>
            )}

            {/* Top gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

            {/* User info and description */}
            <div className="absolute bottom-0 left-0 right-16 p-4">
              <div className="flex items-center mb-3">
                <img
                  src={currentReel?.profiles?.profile_picture || `https://via.placeholder.com/40x40/8b5cf6/ffffff?text=${currentReel?.profiles?.first_name?.[0] || 'U'}`}
                  alt="Profile"
                  className="w-12 h-12 rounded-full mr-3 border-2 border-white"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg">@{currentReel?.profiles?.username}</p>
                  <p className="text-gray-200 text-sm">
                    {currentReel?.profiles?.first_name} {currentReel?.profiles?.last_name}
                  </p>
                </div>
                <button className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Follow
                </button>
              </div>

              <p className="text-white text-sm mb-2 leading-relaxed">
                {currentReel?.description}
              </p>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1">
                {currentReel?.tags?.map((tag, index) => (
                  <span key={index} className="text-blue-300 text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right side actions */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6">
              {/* Profile picture */}
              <div className="relative">
                <img
                  src={currentReel?.profiles?.profile_picture || `https://via.placeholder.com/56x56/8b5cf6/ffffff?text=${currentReel?.profiles?.first_name?.[0] || 'U'}`}
                  alt="Profile"
                  className="w-14 h-14 rounded-full border-2 border-white"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              </div>

              {/* Like button */}
              <button
                onClick={() => handleLike(currentReel?.id)}
                className="flex flex-col items-center space-y-1"
              >
                <Heart 
                  size={32} 
                  className={`${currentReel?.is_liked ? 'text-red-500 fill-red-500' : 'text-white'} transition-colors`}
                />
                <span className="text-white text-xs font-semibold">
                  {formatCount(currentReel?.likes_count || 0)}
                </span>
              </button>

              {/* Comment button */}
              <button
                onClick={() => {
                  setShowComments(true);
                  loadComments(currentReel?.id);
                }}
                className="flex flex-col items-center space-y-1"
              >
                <MessageCircle size={32} className="text-white" />
                <span className="text-white text-xs font-semibold">
                  {formatCount(currentReel?.comments_count || 0)}
                </span>
              </button>

              {/* Share button */}
              <button className="flex flex-col items-center space-y-1">
                <Send size={32} className="text-white" />
                <span className="text-white text-xs font-semibold">
                  {formatCount(currentReel?.shares_count || 0)}
                </span>
              </button>

              {/* Bookmark button */}
              <button className="flex flex-col items-center space-y-1">
                <Bookmark size={32} className="text-white" />
              </button>

              {/* More options */}
              <button className="flex flex-col items-center space-y-1">
                <MoreHorizontal size={32} className="text-white" />
              </button>
            </div>

            {/* Mute/Unmute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <button
            onClick={prevReel}
            className="text-white/50 hover:text-white transition-colors"
            disabled={reels.length <= 1}
          >
            <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
              ←
            </div>
          </button>
        </div>

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 mr-20">
          <button
            onClick={nextReel}
            className="text-white/50 hover:text-white transition-colors"
            disabled={reels.length <= 1}
          >
            <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
              →
            </div>
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Comments</h2>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={comment.profiles?.profile_picture || `https://via.placeholder.com/32x32/8b5cf6/ffffff?text=${comment.profiles?.first_name?.[0] || 'U'}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">@{comment.profiles?.username}</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <button className="text-gray-500 text-xs">
                          {comment.likes_count} likes
                        </button>
                        <button className="text-gray-500 text-xs">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              <div className="p-4 border-t">
                <div className="flex space-x-3">
                  <img
                    src={user?.user_metadata?.profile_picture || `https://via.placeholder.com/32x32/f59e0b/ffffff?text=${user?.user_metadata?.first_name?.[0] || 'Y'}`}
                    alt="Your profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    />
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold disabled:bg-gray-300"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstagramReelsPage;
