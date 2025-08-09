import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, Bookmark, Play, Pause, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const videoRef = useRef<HTMLVideoElement>(null);

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
      videoUrl: '/api/placeholder/video/recovery-meditation.mp4',
      thumbnail: '/api/placeholder/400/600',
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
      videoUrl: '/api/placeholder/video/breathing-exercise.mp4',
      thumbnail: '/api/placeholder/400/600',
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
      videoUrl: '/api/placeholder/video/success-story.mp4',
      thumbnail: '/api/placeholder/400/600',
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

  const currentReelData = reels[currentReel];

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-white font-semibold">Recovery Reels</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Video Container */}
      <div className="relative h-full w-full">
        {/* Video Placeholder - In production, this would be an actual video element */}
        <div 
          className="h-full w-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${currentReelData.thumbnail})` }}
        >
          {/* Video overlay */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Play/Pause overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={handlePlayPause}
          >
            {!isPlaying && (
              <div className="bg-black/50 rounded-full p-4">
                <Play className="h-12 w-12 text-white fill-white" />
              </div>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(currentReelData.id)}
              className={`p-3 rounded-full ${
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
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              className="p-3 rounded-full text-white hover:bg-white/20"
            >
              <MessageCircle className="h-7 w-7" />
            </Button>
            <span className="text-white text-sm font-medium mt-1">{currentReelData.comments}</span>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              className="p-3 rounded-full text-white hover:bg-white/20"
            >
              <Share className="h-7 w-7" />
            </Button>
            <span className="text-white text-sm font-medium mt-1">{currentReelData.shares}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSave(currentReelData.id)}
            className={`p-3 rounded-full ${
              savedReels.has(currentReelData.id) 
                ? 'text-yellow-500 hover:bg-yellow-500/20' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            <Bookmark className={`h-7 w-7 ${savedReels.has(currentReelData.id) ? 'fill-current' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleMuteToggle}
            className="p-3 rounded-full text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>
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
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {reels.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentReel(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentReel ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReelsPage;
