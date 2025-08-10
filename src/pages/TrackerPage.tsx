import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Trophy, Target, Flame, Heart, Brain, ArrowLeft, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrackerPage = () => {
  const navigate = useNavigate();
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Mock data - in production, this would come from your backend
  const sobrietyData = {
    startDate: new Date('2024-01-15'),
    currentStreak: 206,
    longestStreak: 206,
    totalDaysSober: 206,
    milestones: [
      { days: 1, achieved: true, title: 'First Day' },
      { days: 7, achieved: true, title: 'One Week' },
      { days: 30, achieved: true, title: 'One Month' },
      { days: 90, achieved: true, title: '90 Days' },
      { days: 180, achieved: true, title: '6 Months' },
      { days: 365, achieved: false, title: 'One Year' },
    ]
  };

  const wellnessMetrics = {
    mood: 8,
    energy: 7,
    sleep: 6,
    stress: 3,
    cravings: 2
  };

  const exercises = [
    {
      id: '1',
      title: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8',
      duration: '5 min',
      category: 'breathing',
      difficulty: 'beginner'
    },
    {
      id: '2',
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and release muscle groups',
      duration: '15 min',
      category: 'relaxation',
      difficulty: 'intermediate'
    },
    {
      id: '3',
      title: 'Mindful Walking',
      description: 'Focus on each step and breath',
      duration: '10 min',
      category: 'mindfulness',
      difficulty: 'beginner'
    },
    {
      id: '4',
      title: 'Body Scan Meditation',
      description: 'Systematic relaxation technique',
      duration: '20 min',
      category: 'meditation',
      difficulty: 'advanced'
    }
  ];

  const getDaysFromStart = () => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - sobrietyData.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getNextMilestone = () => {
    return sobrietyData.milestones.find(m => !m.achieved);
  };

  const startBreathingExercise = () => {
    setIsBreathingActive(true);
    // Simple breathing cycle simulation
    const cycle = () => {
      setBreathingPhase('inhale');
      setTimeout(() => setBreathingPhase('hold'), 4000);
      setTimeout(() => setBreathingPhase('exhale'), 11000);
      setTimeout(() => {
        if (isBreathingActive) cycle();
      }, 19000);
    };
    cycle();
  };

  const stopBreathingExercise = () => {
    setIsBreathingActive(false);
    setBreathingPhase('inhale');
  };

  const nextMilestone = getNextMilestone();
  const progressToNext = nextMilestone ? (sobrietyData.currentStreak / nextMilestone.days) * 100 : 100;

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
          <h1 className="text-xl bg-black font-bold">Recovery Tracker</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="streak" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="streak">Streak</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
          </TabsList>

          <TabsContent value="streak" className="space-y-4">
            {/* Main Streak Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Flame className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-primary">
                  {sobrietyData.currentStreak} Days
                </CardTitle>
                <p className="text-muted-foreground">Current Streak</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{sobrietyData.longestStreak}</p>
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{sobrietyData.totalDaysSober}</p>
                    <p className="text-sm text-muted-foreground">Total Days</p>
                  </div>
                </div>
                
                {nextMilestone && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Next: {nextMilestone.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {nextMilestone.days - sobrietyData.currentStreak} days to go
                      </span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {sobrietyData.milestones.map((milestone) => (
                    <div
                      key={milestone.days}
                      className={`p-3 rounded-lg border ${
                        milestone.achieved
                          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                          : 'bg-muted border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">{milestone.days} days</p>
                        </div>
                        {milestone.achieved && (
                          <Trophy className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wellness" className="space-y-4">
            {/* Wellness Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Daily Wellness Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(wellnessMetrics).map(([metric, value]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="capitalize font-medium">{metric}</span>
                      <Badge variant={value >= 7 ? 'default' : value >= 4 ? 'secondary' : 'destructive'}>
                        {value}/10
                      </Badge>
                    </div>
                    <Progress value={value * 10} className="h-2" />
                  </div>
                ))}
                <Button className="w-full mt-4">Update Today's Check-in</Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-sm text-muted-foreground">Check-in Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-muted-foreground">Weekly Goal</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4">
            {/* Breathing Exercise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Quick Breathing Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {!isBreathingActive ? (
                  <div className="space-y-4">
                    <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Brain className="h-16 w-16 text-primary" />
                    </div>
                    <p className="text-muted-foreground">
                      Take a moment to center yourself with guided breathing
                    </p>
                    <Button onClick={startBreathingExercise} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Breathing Exercise
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-1000 ${
                      breathingPhase === 'inhale' ? 'bg-blue-200 scale-110' :
                      breathingPhase === 'hold' ? 'bg-yellow-200 scale-110' :
                      'bg-green-200 scale-90'
                    }`}>
                      <span className="text-2xl font-bold capitalize">{breathingPhase}</span>
                    </div>
                    <p className="text-lg font-medium">
                      {breathingPhase === 'inhale' ? 'Breathe In...' :
                       breathingPhase === 'hold' ? 'Hold...' :
                       'Breathe Out...'}
                    </p>
                    <Button onClick={stopBreathingExercise} variant="outline" className="w-full">
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Exercise
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exercise Library */}
            <Card>
              <CardHeader>
                <CardTitle>Relaxation Exercises</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{exercise.title}</h3>
                      <Badge variant="outline">{exercise.duration}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{exercise.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {exercise.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {exercise.difficulty}
                        </Badge>
                      </div>
                      <Button size="sm">Start</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrackerPage;
