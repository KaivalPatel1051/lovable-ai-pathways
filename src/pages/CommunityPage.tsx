import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Heart,
  Share,
  Phone,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MagicBentoCard, DarkPalette } from '@/components/MagicBento';

interface Program {
  id: string;
  title: string;
  organization: string;
  description: string;
  type: 'meeting' | 'workshop' | 'therapy' | 'social' | 'fitness';
  date: Date;
  time: string;
  duration: string;
  location: {
    name: string;
    address: string;
    distance: string;
  };
  capacity: number;
  registered: number;
  cost: 'free' | 'paid';
  price?: number;
  tags: string[];
  organizer: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  isOnline: boolean;
  rsvpStatus?: 'going' | 'maybe' | 'not-going';
}

const CommunityPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, 'going' | 'maybe' | 'not-going'>>({});

  const programs: Program[] = [
    {
      id: '1',
      title: 'AA Meeting - Downtown Group',
      organization: 'Alcoholics Anonymous',
      description: 'Open meeting for anyone seeking support with alcohol addiction. Newcomers welcome. We follow the 12-step program and provide a safe, judgment-free environment.',
      type: 'meeting',
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: '7:00 PM',
      duration: '1.5 hours',
      location: {
        name: 'Community Center',
        address: '123 Main St, Downtown',
        distance: '0.8 miles'
      },
      capacity: 30,
      registered: 18,
      cost: 'free',
      tags: ['12-step', 'alcohol', 'support-group'],
      organizer: {
        name: 'Downtown AA Group',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      isOnline: false
    },
    {
      id: '2',
      title: 'Mindful Recovery Workshop',
      organization: 'Serenity Wellness Center',
      description: 'Learn mindfulness techniques specifically designed for addiction recovery. Includes guided meditation, breathing exercises, and coping strategies.',
      type: 'workshop',
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      time: '2:00 PM',
      duration: '3 hours',
      location: {
        name: 'Serenity Wellness Center',
        address: '456 Oak Ave, Midtown',
        distance: '2.1 miles'
      },
      capacity: 15,
      registered: 12,
      cost: 'paid',
      price: 25,
      tags: ['mindfulness', 'meditation', 'workshop'],
      organizer: {
        name: 'Dr. Sarah Chen',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      isOnline: false
    },
    {
      id: '3',
      title: 'Virtual NA Meeting',
      organization: 'Narcotics Anonymous',
      description: 'Online meeting for those recovering from drug addiction. Accessible from anywhere with internet connection. Camera optional.',
      type: 'meeting',
      date: new Date(Date.now() + 3600000), // 1 hour from now
      time: '8:00 PM',
      duration: '1 hour',
      location: {
        name: 'Online Meeting',
        address: 'Zoom Link Provided',
        distance: 'Virtual'
      },
      capacity: 50,
      registered: 23,
      cost: 'free',
      tags: ['narcotics', 'virtual', '12-step'],
      organizer: {
        name: 'NA Online Group',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      isOnline: true
    },
    {
      id: '4',
      title: 'Recovery Fitness Bootcamp',
      organization: 'Fit & Sober',
      description: 'High-energy workout session designed for people in recovery. Build physical strength while strengthening your sobriety. All fitness levels welcome.',
      type: 'fitness',
      date: new Date(Date.now() + 259200000), // 3 days from now
      time: '9:00 AM',
      duration: '45 minutes',
      location: {
        name: 'Riverside Park',
        address: '789 River Rd, Eastside',
        distance: '1.5 miles'
      },
      capacity: 20,
      registered: 8,
      cost: 'free',
      tags: ['fitness', 'outdoor', 'group-exercise'],
      organizer: {
        name: 'Coach Mike R.',
        avatar: '/api/placeholder/40/40',
        verified: false
      },
      isOnline: false
    },
    {
      id: '5',
      title: 'Family Support Group',
      organization: 'Families in Recovery',
      description: 'Support group for family members and loved ones of people in recovery. Share experiences, learn coping strategies, and find community.',
      type: 'therapy',
      date: new Date(Date.now() + 432000000), // 5 days from now
      time: '6:30 PM',
      duration: '2 hours',
      location: {
        name: 'Hope Community Church',
        address: '321 Pine St, Westside',
        distance: '3.2 miles'
      },
      capacity: 25,
      registered: 16,
      cost: 'free',
      tags: ['family', 'support', 'therapy'],
      organizer: {
        name: 'Families in Recovery',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      isOnline: false
    },
    {
      id: '6',
      title: 'Sober Social: Coffee & Games',
      organization: 'Sober Social Network',
      description: 'Casual social gathering for people in recovery. Play board games, enjoy coffee, and make new sober friends in a relaxed environment.',
      type: 'social',
      date: new Date(Date.now() + 518400000), // 6 days from now
      time: '3:00 PM',
      duration: '2.5 hours',
      location: {
        name: 'The Grind Coffee Shop',
        address: '654 Elm St, Central',
        distance: '1.2 miles'
      },
      capacity: 12,
      registered: 7,
      cost: 'free',
      tags: ['social', 'coffee', 'games'],
      organizer: {
        name: 'Sober Social Network',
        avatar: '/api/placeholder/40/40',
        verified: false
      },
      isOnline: false
    }
  ];

  const programTypes = [
    'all',
    'meeting',
    'workshop',
    'therapy',
    'social',
    'fitness'
  ];

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || program.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleRSVP = (programId: string, status: 'going' | 'maybe' | 'not-going') => {
    setRsvpStatus(prev => ({
      ...prev,
      [programId]: status
    }));
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'workshop': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'therapy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'social': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'fitness': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRSVPButton = (program: Program) => {
    const status = rsvpStatus[program.id];
    
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={status === 'going' ? 'default' : 'outline'}
          onClick={() => handleRSVP(program.id, 'going')}
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Going
        </Button>
        <Button
          size="sm"
          variant={status === 'maybe' ? 'default' : 'outline'}
          onClick={() => handleRSVP(program.id, 'maybe')}
          className="flex-1"
        >
          Maybe
        </Button>
        <Button
          size="sm"
          variant={status === 'not-going' ? 'destructive' : 'outline'}
          onClick={() => handleRSVP(program.id, 'not-going')}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    );
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
          <h1 className="text-xl font-bold">Community</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="my-rsvps">My RSVPs</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-4">
            {/* Search and Filters */}
            <MagicBentoCard className="rounded-xl" enableTilt clickEffect enableMagnetism style={{ backgroundColor: DarkPalette.surface } as React.CSSProperties}>
              <Card className="rounded-xl border-border/40" style={{ backgroundColor: DarkPalette.surface }}>
                <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search programs, locations, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {programTypes.map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      className="text-xs capitalize"
                    >
                      {type === 'all' ? 'All' : type}
                    </Button>
                  ))}
                </div>
                </CardContent>
              </Card>
            </MagicBentoCard>

            {/* Programs List */}
            <div className="space-y-4">
              {filteredPrograms.map((program) => (
                <MagicBentoCard key={program.id} className="rounded-xl" enableTilt clickEffect enableMagnetism style={{ backgroundColor: DarkPalette.surface } as React.CSSProperties}>
                  <Card className="overflow-hidden rounded-xl border-border/40" style={{ backgroundColor: DarkPalette.surface }}>
                    <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{program.title}</h3>
                            {program.isOnline && (
                              <Globe className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {program.organization}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getTypeColor(program.type)}>
                              {program.type}
                            </Badge>
                            <Badge variant={program.cost === 'free' ? 'secondary' : 'outline'}>
                              {program.cost === 'free' ? 'Free' : `$${program.price}`}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={program.organizer.avatar} />
                            <AvatarFallback>{program.organizer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {program.organizer.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {program.description}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(program.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{program.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{program.location.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{program.registered}/{program.capacity}</span>
                        </div>
                      </div>

                      {/* Location Details */}
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{program.location.name}</p>
                            <p className="text-xs text-muted-foreground">{program.location.address}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {program.location.distance}
                          </Badge>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {program.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <div className="flex-1">
                          {getRSVPButton(program)}
                        </div>
                        <Button variant="outline" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                </MagicBentoCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-rsvps" className="space-y-4">
            {Object.keys(rsvpStatus).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No RSVPs Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    RSVP to programs to see them here and get reminders.
                  </p>
                  <Button onClick={() => {
                    const programsTab = document.querySelector('[value="programs"]') as HTMLButtonElement;
                    programsTab?.click();
                  }}>
                    Browse Programs
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {programs
                  .filter(program => rsvpStatus[program.id])
                  .map((program) => (
                    <Card key={program.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{program.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(program.date)} at {program.time}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              rsvpStatus[program.id] === 'going' ? 'default' :
                              rsvpStatus[program.id] === 'maybe' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {rsvpStatus[program.id]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{program.location.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityPage;
