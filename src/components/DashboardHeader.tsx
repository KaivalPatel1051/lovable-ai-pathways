import React, { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Edit3, 
  Shield, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Plus,
  Clock,
  Flame,
  Target,
  TrendingUp
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'motivation' | 'reminder' | 'achievement' | 'warning';
}

const DashboardHeader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Peak Time Alert',
      message: 'Your usual peak time is approaching. Stay strong! 💪',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      type: 'reminder'
    },
    {
      id: '2',
      title: 'Milestone Achieved!',
      message: 'Congratulations on 42 days sober! 🎉',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      type: 'achievement'
    },
    {
      id: '3',
      title: 'Daily Check-in',
      message: 'How are you feeling today? Take a moment to reflect.',
      timestamp: new Date(Date.now() - 7200000),
      read: true,
      type: 'motivation'
    }
  ]);

  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    pushNotifications: true,
    emailNotifications: true,
    soundEnabled: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  const { user, profile, signOut } = useSupabaseAuth();
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    email: 'user@example.com',
    daysSober: 0,
    streak: 0,
    avatar: '/placeholder-avatar.png'
  });

  // Populate from Supabase auth/profile
  useEffect(() => {
    const first = profile?.first_name || (user?.user_metadata as any)?.first_name || '';
    const last = profile?.last_name || (user?.user_metadata as any)?.last_name || '';
    const username = profile?.username || (user?.user_metadata as any)?.username || '';
    const displayName = [first, last].filter(Boolean).join(' ') || username || user?.email || 'User';

    setUserProfile(prev => ({
      ...prev,
      name: displayName,
      email: profile?.email || user?.email || prev.email,
      daysSober: profile?.days_sober ?? prev.daysSober,
      streak: profile?.days_sober ?? prev.streak,
      avatar: profile?.profile_picture || prev.avatar,
    }));
  }, [user, profile]);

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 17) return "Good afternoon";
    return "Good evening";
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been updated.`,
    });
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: 'Sign out failed', description: error.message });
    } else {
      toast({ title: 'Signed out', description: 'You have been signed out successfully.' });
      navigate('/login');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'reminder': return '⏰';
      case 'motivation': return '💪';
      case 'warning': return '⚠️';
      default: return '📢';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <header className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-xl mb-6 border border-slate-700/50">
      <div className="flex items-center gap-3">
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
              <Avatar className="h-12 w-12 border-2 border-white/20 cursor-pointer hover:border-white/40 transition-all">
                <AvatarImage src={userProfile.avatar} alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {userProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2" align="start">
            <DropdownMenuLabel className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userProfile.avatar} alt="User" />
                  <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{userProfile.name}</p>
                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>Current Streak</span>
                </div>
                <Badge variant="secondary">{userProfile.streak} days</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>Days Sober</span>
                </div>
                <Badge variant="secondary">{userProfile.daysSober} days</Badge>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Edit3 className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Privacy Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div>
          <h1 className="text-lg font-semibold text-white">
            {getGreeting()}, {userProfile.name}! 🌟
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Flame className="h-3 w-3 mr-1" />
              Day {userProfile.daysSober} Strong
            </Badge>
            <span className="text-white/80 text-sm">Keep going!</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Create Reel Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-white/20 transition-smooth"
          onClick={() => navigate('/create-reel')}
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Notifications */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 transition-smooth relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{formatTimeAgo(notification.timestamp)}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Settings */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 transition-smooth"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Appearance */}
              <div>
                <h3 className="font-medium mb-3">Appearance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <Label htmlFor="darkMode">Dark Mode</Label>
                    </div>
                    <Switch
                      id="darkMode"
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notifications */}
              <div>
                <h3 className="font-medium mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="notifications">Enable Notifications</Label>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      <Label htmlFor="soundEnabled">Sound</Label>
                    </div>
                    <Switch
                      id="soundEnabled"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Label htmlFor="quietHours">Quiet Hours</Label>
                    </div>
                    <Switch
                      id="quietHours"
                      checked={settings.quietHours}
                      onCheckedChange={(checked) => handleSettingChange('quietHours', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account */}
              <div>
                <h3 className="font-medium mb-3">Account</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy & Security
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Help & Support
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default DashboardHeader;