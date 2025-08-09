import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MessageCircle, 
  Star, 
  Clock, 
  MapPin, 
  Search,
  Calendar,
  Shield,
  Heart,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Psychiatrist {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  avatar: string;
  isOnline: boolean;
  nextAvailable: string;
  languages: string[];
  sessionPrice: number;
  verified: boolean;
  bio: string;
}

const GuidancePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');

  const psychiatrists: Psychiatrist[] = [
    {
      id: '1',
      name: 'Dr. Sarah Mitchell',
      title: 'Licensed Clinical Psychologist',
      specialization: ['Addiction Recovery', 'Cognitive Behavioral Therapy', 'Trauma Therapy'],
      rating: 4.9,
      reviews: 127,
      experience: '12 years',
      location: 'San Francisco, CA',
      avatar: '/api/placeholder/60/60',
      isOnline: true,
      nextAvailable: 'Available now',
      languages: ['English', 'Spanish'],
      sessionPrice: 150,
      verified: true,
      bio: 'Specialized in addiction recovery with over 12 years of experience helping individuals overcome substance abuse and build healthy coping mechanisms.'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      title: 'Addiction Medicine Specialist',
      specialization: ['Substance Abuse', 'Dual Diagnosis', 'Medication Management'],
      rating: 4.8,
      reviews: 89,
      experience: '8 years',
      location: 'Los Angeles, CA',
      avatar: '/api/placeholder/60/60',
      isOnline: false,
      nextAvailable: 'Tomorrow 2:00 PM',
      languages: ['English', 'Mandarin'],
      sessionPrice: 200,
      verified: true,
      bio: 'Board-certified addiction medicine specialist focusing on comprehensive treatment approaches for substance use disorders.'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      title: 'Licensed Marriage & Family Therapist',
      specialization: ['Family Therapy', 'Relationship Counseling', 'Support Systems'],
      rating: 4.7,
      reviews: 156,
      experience: '10 years',
      location: 'Austin, TX',
      avatar: '/api/placeholder/60/60',
      isOnline: true,
      nextAvailable: 'Available now',
      languages: ['English', 'Spanish'],
      sessionPrice: 120,
      verified: true,
      bio: 'Helping families heal and rebuild relationships affected by addiction. Specializes in creating strong support systems for recovery.'
    },
    {
      id: '4',
      name: 'Dr. James Thompson',
      title: 'Psychiatrist & Addiction Specialist',
      specialization: ['Psychiatric Evaluation', 'Medication Management', 'Dual Diagnosis'],
      rating: 4.9,
      reviews: 203,
      experience: '15 years',
      location: 'New York, NY',
      avatar: '/api/placeholder/60/60',
      isOnline: false,
      nextAvailable: 'Today 6:00 PM',
      languages: ['English'],
      sessionPrice: 250,
      verified: true,
      bio: 'Experienced psychiatrist specializing in the medical aspects of addiction treatment and co-occurring mental health disorders.'
    }
  ];

  const specializations = [
    'all',
    'Addiction Recovery',
    'Cognitive Behavioral Therapy',
    'Trauma Therapy',
    'Family Therapy',
    'Medication Management'
  ];

  const filteredPsychiatrists = psychiatrists.filter(psychiatrist => {
    const matchesSearch = psychiatrist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         psychiatrist.specialization.some(spec => 
                           spec.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesSpecialization = selectedSpecialization === 'all' ||
                                 psychiatrist.specialization.includes(selectedSpecialization);
    
    return matchesSearch && matchesSpecialization;
  });

  const handleBookSession = (psychiatrist: Psychiatrist) => {
    // In production, this would open a booking modal or navigate to booking page
    console.log('Booking session with:', psychiatrist.name);
  };

  const handleStartChat = (psychiatrist: Psychiatrist) => {
    // In production, this would start a chat session
    console.log('Starting chat with:', psychiatrist.name);
  };

  const handleStartCall = (psychiatrist: Psychiatrist) => {
    // In production, this would initiate a call
    console.log('Starting call with:', psychiatrist.name);
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
          <h1 className="text-xl font-bold">Professional Guidance</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="find" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="find">Find Therapist</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Support</TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec) => (
                    <Button
                      key={spec}
                      variant={selectedSpecialization === spec ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSpecialization(spec)}
                      className="text-xs"
                    >
                      {spec === 'all' ? 'All' : spec}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Therapists List */}
            <div className="space-y-4">
              {filteredPsychiatrists.map((psychiatrist) => (
                <Card key={psychiatrist.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={psychiatrist.avatar} />
                          <AvatarFallback>{psychiatrist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {psychiatrist.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{psychiatrist.name}</h3>
                          {psychiatrist.verified && (
                            <Shield className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{psychiatrist.title}</p>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{psychiatrist.rating}</span>
                            <span className="text-sm text-muted-foreground">({psychiatrist.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{psychiatrist.experience}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {psychiatrist.specialization.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {psychiatrist.specialization.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{psychiatrist.specialization.length - 2} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{psychiatrist.nextAvailable}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-semibold">${psychiatrist.sessionPrice}</span>
                            <span className="text-sm text-muted-foreground">/session</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {psychiatrist.bio}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleBookSession(psychiatrist)}
                            className="flex-1"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Session
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartChat(psychiatrist)}
                            disabled={!psychiatrist.isOnline}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartCall(psychiatrist)}
                            disabled={!psychiatrist.isOnline}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            {/* Crisis Support */}
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <Heart className="h-5 w-5" />
                  Crisis Support - Available 24/7
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-600 dark:text-red-400">
                  If you're experiencing a mental health crisis or having thoughts of self-harm, 
                  please reach out for immediate help.
                </p>
                
                <div className="space-y-3">
                  <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
                    <Phone className="h-5 w-5 mr-2" />
                    Call Crisis Hotline: 988
                  </Button>
                  
                  <Button variant="outline" className="w-full border-red-300" size="lg">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Text Crisis Support
                  </Button>
                  
                  <Button variant="outline" className="w-full border-red-300" size="lg">
                    <Video className="h-5 w-5 mr-2" />
                    Emergency Video Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Support Options */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Support Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Peer Support Chat</div>
                    <div className="text-sm text-muted-foreground">
                      Connect with others in recovery
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Guided Meditation</div>
                    <div className="text-sm text-muted-foreground">
                      5-minute calming session
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Coping Strategies</div>
                    <div className="text-sm text-muted-foreground">
                      Quick techniques for difficult moments
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Find Local Resources</div>
                    <div className="text-sm text-muted-foreground">
                      Treatment centers and support groups nearby
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Important Numbers */}
            <Card>
              <CardHeader>
                <CardTitle>Important Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">National Suicide Prevention Lifeline</div>
                    <div className="text-sm text-muted-foreground">24/7 Crisis Support</div>
                  </div>
                  <Button size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    988
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">SAMHSA National Helpline</div>
                    <div className="text-sm text-muted-foreground">Treatment referral service</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    1-800-662-4357
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Crisis Text Line</div>
                    <div className="text-sm text-muted-foreground">Text HOME to 741741</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Text
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GuidancePage;
