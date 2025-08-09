import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MessageCircle, Share, Bookmark, Play, Pause, Volume2, VolumeX, ArrowLeft, MoreHorizontal, Send, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Reel {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  videoUrl: string;
  thumbnail: string;
  likes: number;
  comments: number;
  shares: number;
  duration: string;
  tags: string[];
}

const ReelsPage = () => {
  const navigate = useNavigate();
  const [currentReel, setCurrentReel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const reels: Reel[] = [
    {
      id: '1',
      title: 'Morning Meditation for Recovery',
      description: 'Start your day with this 5-minute guided meditation to strengthen your resolve and find inner peace. Remember, every day sober is a victory! 🌅 #Recovery #Meditation #Sobriety',
      author: {
        name: 'Dr. Sarah Chen',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      likes: 1247,
      comments: 89,
      shares: 156,
      duration: '5:23',
      tags: ['meditation', 'recovery', 'morning']
    },
    {
      id: '2',
      title: 'Breathing Exercise for Cravings',
      description: 'When cravings hit, try this simple 4-7-8 breathing technique. It activates your parasympathetic nervous system and helps you regain control. You\'ve got this! 💪',
      author: {
        name: 'Recovery Coach Mike',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop',
      likes: 2156,
      comments: 234,
      shares: 445,
      duration: '3:45',
      tags: ['breathing', 'cravings', 'technique']
    },
    {
      id: '3',
      title: 'Success Story: 2 Years Clean',
      description: 'Today marks my 2-year sobriety anniversary! Here\'s what I\'ve learned and how my life has transformed. If I can do it, so can you. Never give up! ✨ #SobrietyStory',
      author: {
        name: 'Jessica M.',
        avatar: '/api/placeholder/40/40',
        verified: false
      },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=600&fit=crop',
      likes: 3421,
      comments: 567,
      shares: 892,
      duration: '2:15',
      tags: ['success', 'inspiration', 'milestone']
    }
  ];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = (reelId: string) => {
    setLikedReels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  const handleSave = (reelId: string) => {
    setSavedReels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  // Enhanced video controls and interactions
  const handleVideoProgress = useCallback(() => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
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

    if (isUpSwipe && currentReel < reels.length - 1) {
      setCurrentReel(prev => prev + 1);
      setProgress(0);
    }
    if (isDownSwipe && currentReel > 0) {
      setCurrentReel(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleVideoClick = () => {
    handlePlayPause();
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // In a real app, this would send to backend
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleVideoProgress);
      video.addEventListener('loadstart', () => setIsLoading(true));
      video.addEventListener('canplay', () => setIsLoading(false));
      
      return () => {
        video.removeEventListener('timeupdate', handleVideoProgress);
        video.removeEventListener('loadstart', () => setIsLoading(true));
        video.removeEventListener('canplay', () => setIsLoading(false));
      };
    }
  }, [handleVideoProgress]);

  useEffect(() => {
    // Auto-play current video
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play();
      }
    }
  }, [currentReel, isPlaying]);

  const currentReelData = reels[currentReel];

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20 cursor-target"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-white text-lg font-semibold">Recovery Reels</h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 cursor-target"
        >
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-16 left-0 right-0 z-20 px-4">
        <div className="w-full bg-white/20 rounded-full h-1">
          <motion.div
            className="bg-white h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Video Container with Touch Gestures */}
      <div 
        ref={containerRef}
        className="relative h-full w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          src={currentReelData.videoUrl}
          poster={currentReelData.thumbnail}
          className="w-full h-full object-cover cursor-target"
          loop
          muted={isMuted}
          autoPlay={isPlaying}
          playsInline
        />

        {/* Loading Spinner */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play/Pause Overlay */}
        <AnimatePresence>
          {!isPlaying && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePlayPause}
                className="p-4 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-target"
              >
                <Play className="h-12 w-12" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-32 flex flex-col space-y-6 z-10">
          <motion.div 
            className="flex flex-col items-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(currentReelData.id)}
              className={`p-3 rounded-full cursor-target ${
                likedReels.has(currentReelData.id) 
                  ? 'text-red-500 hover:bg-red-500/20' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Heart className={`h-7 w-7 ${likedReels.has(currentReelData.id) ? 'fill-current' : ''}`} />
            </Button>
            <span className="text-white text-sm font-medium mt-1">
              {currentReelData.likes + (likedReels.has(currentReelData.id) ? 1 : 0)}
            </span>
          </motion.div>

          <motion.div 
            className="flex flex-col items-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(true)}
              className="p-3 rounded-full text-white hover:bg-white/20 cursor-target"
            >
              <MessageCircle className="h-7 w-7" />
            </Button>
            <span className="text-white text-sm font-medium mt-1">{currentReelData.comments}</span>
          </motion.div>

          <motion.div 
            className="flex flex-col items-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="p-3 rounded-full text-white hover:bg-white/20 cursor-target"
            >
              <Share className="h-7 w-7" />
            </Button>
            <span className="text-white text-sm font-medium mt-1">{currentReelData.shares}</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSave(currentReelData.id)}
              className={`p-3 rounded-full cursor-target ${
                savedReels.has(currentReelData.id) 
                  ? 'text-yellow-500 hover:bg-yellow-500/20' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Bookmark className={`h-7 w-7 ${savedReels.has(currentReelData.id) ? 'fill-current' : ''}`} />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMuteToggle}
              className="p-3 rounded-full text-white hover:bg-white/20 cursor-target"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          </motion.div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-12 w-12 border-2 border-white">
              <AvatarImage src={currentReelData.author.avatar} />
              <AvatarFallback>{currentReelData.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{currentReelData.author.name}</span>
                {currentReelData.author.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-white/80 text-sm">{currentReelData.duration}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white hover:text-black"
            >
              Follow
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">{currentReelData.title}</h3>
            <p className="text-white/90 text-sm leading-relaxed">{currentReelData.description}</p>
            <div className="flex flex-wrap gap-2">
              {currentReelData.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-blue-400 text-sm font-medium cursor-pointer hover:underline"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {reels.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentReel(index)}
              className={`w-2 h-2 rounded-full transition-all cursor-target ${
                index === currentReel ? 'bg-white' : 'bg-white/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-30 flex items-end"
            onClick={() => setShowComments(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              className="w-full bg-card rounded-t-xl max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold">Comments</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(false)}
                  className="cursor-target"
                >
                  ✕
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Sample Comments */}
                  <div className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">john_doe</span>
                        <span className="text-xs text-muted-foreground">2h</span>
                      </div>
                      <p className="text-sm">This really helped me today. Thank you for sharing! 🙏</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-xs cursor-target">
                          <Heart className="h-3 w-3 mr-1" />
                          12
                        </Button>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-xs cursor-target">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">sarah_m</span>
                        <span className="text-xs text-muted-foreground">1h</span>
                      </div>
                      <p className="text-sm">Amazing technique! I've been using this for weeks now ✨</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-xs cursor-target">
                          <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                          8
                        </Button>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-xs cursor-target">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 cursor-target"
                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                  />
                  <Button variant="ghost" size="sm" className="cursor-target">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="cursor-target"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelsPage;
