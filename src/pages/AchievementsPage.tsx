import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CountUp from '@/components/CountUp';
import Counter from '@/components/Counter';
import { UserCounter, ReelCounter, MessageCounter, SobrietyCounter } from '@/components/BackendCounter';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Plus,
  Trophy,
  Calendar,
  Users,
  Camera,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Achievement {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
    daysSober: number;
  };
  content: string;
  image?: string;
  milestone: {
    type: 'days' | 'months' | 'years' | 'goal';
    value: number;
    description: string;
  };
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  tags: string[];
}

const AchievementsPage = () => {
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const achievements: Achievement[] = [
    {
      id: '1',
      user: {
        name: 'Sarah M.',
        avatar: '/api/placeholder/40/40',
        verified: true,
        daysSober: 365
      },
      content: "🎉 ONE YEAR SOBER TODAY! 🎉\n\nI can't believe it's been 365 days since my last drink. This journey has been the hardest and most rewarding thing I've ever done. To anyone struggling - you are stronger than you know. Take it one day at a time. ❤️\n\n#OneYear #Sobriety #Recovery #Grateful",
      image: '/api/placeholder/400/300',
      milestone: {
        type: 'years',
        value: 1,
        description: 'One Year Sober'
      },
      timestamp: new Date(Date.now() - 3600000),
      likes: 247,
      comments: 89,
      shares: 34,
      isLiked: false,
      tags: ['milestone', 'inspiration', 'oneyear']
    },
    {
      id: '2',
      user: {
        name: 'Mike R.',
        avatar: '/api/placeholder/40/40',
        verified: false,
        daysSober: 90
      },
      content: "90 days clean! 💪 Started going to the gym regularly and it's become my new addiction (the good kind). Physical fitness has been crucial in my recovery. Who else uses exercise as part of their recovery toolkit?",
      milestone: {
        type: 'days',
        value: 90,
        description: '90 Days Clean'
      },
      timestamp: new Date(Date.now() - 7200000),
      likes: 156,
      comments: 45,
      shares: 12,
      isLiked: true,
      tags: ['fitness', 'milestone', '90days']
    },
    {
      id: '3',
      user: {
        name: 'Jessica L.',
        avatar: '/api/placeholder/40/40',
        verified: false,
        daysSober: 180
      },
      content: "6 months sober and I finally feel like myself again. The fog has lifted, relationships are healing, and I'm sleeping through the night. If you're on day 1, 10, or 100 - keep going. It gets so much better. 🌟",
      milestone: {
        type: 'months',
        value: 6,
        description: '6 Months Sober'
      },
      timestamp: new Date(Date.now() - 14400000),
      likes: 203,
      comments: 67,
      shares: 28,
      isLiked: false,
      tags: ['sixmonths', 'healing', 'hope']
    },
    {
      id: '4',
      user: {
        name: 'David K.',
        avatar: '/api/placeholder/40/40',
        verified: true,
        daysSober: 45
      },
      content: "45 days and counting! Today I completed my first 5K run since getting sober. Small victories matter just as much as the big ones. What small win are you celebrating today? 🏃‍♂️",
      milestone: {
        type: 'goal',
        value: 1,
        description: 'First 5K Completed'
      },
      timestamp: new Date(Date.now() - 21600000),
      likes: 98,
      comments: 23,
      shares: 8,
      isLiked: false,
      tags: ['fitness', 'goals', 'smallwins']
    }
  ];

  const handleLike = (achievementId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(achievementId)) {
        newSet.delete(achievementId);
      } else {
        newSet.add(achievementId);
      }
      return newSet;
    });
  };

  const handleShare = (achievement: Achievement) => {
    // In production, this would open share options
    console.log('Sharing achievement:', achievement.id);
  };

  const handleComment = (achievement: Achievement) => {
    // In production, this would open comment modal
    console.log('Opening comments for:', achievement.id);
  };

  const handleNewPost = () => {
    if (newPost.trim()) {
      // In production, this would submit the post to backend
      console.log('New post:', newPost);
      setNewPost('');
      setShowNewPost(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'years':
      case 'months':
      case 'days':
        return <Trophy className="h-4 w-4" />;
      case 'goal':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Achievements</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewPost(!showNewPost)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="my-achievements">My Posts</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            {/* New Post Card */}
            {showNewPost && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Your Achievement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What milestone are you celebrating today? Share your story to inspire others..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Add Photo
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trophy className="h-4 w-4 mr-2" />
                        Add Milestone
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewPost(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleNewPost}
                        disabled={!newPost.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievement Feed */}
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="p-4 pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={achievement.user.avatar} />
                          <AvatarFallback>{achievement.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{achievement.user.name}</span>
                            {achievement.user.verified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatTimeAgo(achievement.timestamp)}</span>
                            <span>•</span>
                            <span>{achievement.user.daysSober} days sober</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Milestone Badge */}
                    <div className="mb-3">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        {getMilestoneIcon(achievement.milestone.type)}
                        <span className="ml-2">{achievement.milestone.description}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">
                      {achievement.content}
                    </p>
                  </div>

                  {/* Post Image */}
                  {achievement.image && (
                    <div className="px-4 pb-3">
                      <img
                        src={achievement.image}
                        alt="Achievement"
                        className="w-full rounded-lg object-cover max-h-80"
                      />
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="px-4 py-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{achievement.likes + (likedPosts.has(achievement.id) ? 1 : 0)} likes</span>
                      <div className="flex gap-4">
                        <span>{achievement.comments} comments</span>
                        <span>{achievement.shares} shares</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 py-3 border-t border-border">
                    <div className="flex items-center justify-around">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(achievement.id)}
                        className={`flex-1 ${
                          likedPosts.has(achievement.id) || achievement.isLiked
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${
                          likedPosts.has(achievement.id) || achievement.isLiked ? 'fill-current' : ''
                        }`} />
                        Like
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleComment(achievement)}
                        className="flex-1 text-muted-foreground hover:text-foreground"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(achievement)}
                        className="flex-1 text-muted-foreground hover:text-foreground"
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="my-achievements" className="space-y-4">
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your first achievement to inspire others in the community.
                </p>
                <Button onClick={() => setShowNewPost(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recovery Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    { days: 1, title: 'First Day', achieved: true },
                    { days: 7, title: 'One Week', achieved: true },
                    { days: 30, title: 'One Month', achieved: true },
                    { days: 90, title: '90 Days', achieved: true },
                    { days: 180, title: '6 Months', achieved: false },
                    { days: 365, title: 'One Year', achieved: false },
                  ].map((milestone) => (
                    <div
                      key={milestone.days}
                      className={`p-4 rounded-lg border ${
                        milestone.achieved
                          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                          : 'bg-muted border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{milestone.title}</h4>
                          <p className="text-sm text-muted-foreground">{milestone.days} days</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {milestone.achieved ? (
                            <Trophy className="h-5 w-5 text-green-600" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20 cursor-target">
                    <Users className="h-8 w-8 mx-auto mb-3 text-purple-400" />
                    <UserCounter 
                      fontSize={32}
                      textColor="#10B981"
                      places={[1000, 100, 10, 1]}
                      containerStyle={{ display: 'inline-block' }}
                      counterStyle={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                      showLabel={true}
                      label="Total Users"
                      labelStyle={{ fontSize: '12px', marginTop: '8px' }}
                    />
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 cursor-target">
                    <Camera className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                    <ReelCounter 
                      fontSize={32}
                      textColor="#3B82F6"
                      places={[1000, 100, 10, 1]}
                      containerStyle={{ display: 'inline-block' }}
                      counterStyle={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                      showLabel={true}
                      label="Total Reels"
                      labelStyle={{ fontSize: '12px', marginTop: '8px' }}
                    />
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg border border-green-500/20 cursor-target">
                    <MessageCircle className="h-8 w-8 mx-auto mb-3 text-green-400" />
                    <MessageCounter 
                      fontSize={32}
                      textColor="#8B5CF6"
                      places={[10000, 1000, 100, 10, 1]}
                      containerStyle={{ display: 'inline-block' }}
                      counterStyle={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                      showLabel={true}
                      label="Messages Sent"
                      labelStyle={{ fontSize: '12px', marginTop: '8px' }}
                    />
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20 cursor-target">
                    <Calendar className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
                    <SobrietyCounter 
                      fontSize={32}
                      textColor="#F59E0B"
                      places={[100000, 10000, 1000, 100, 10, 1]}
                      containerStyle={{ display: 'inline-block' }}
                      counterStyle={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                      showLabel={true}
                      label="Days Sober"
                      labelStyle={{ fontSize: '12px', marginTop: '8px' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AchievementsPage;
