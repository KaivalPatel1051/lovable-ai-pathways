import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Clock, 
  Target, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Save,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface AddictionIntakeData {
  addictionType: string;
  customAddiction?: string;
  dailyFrequency: number;
  weeklyFrequency: number;
  importance: number;
  currentImpact: string;
  peakTimes: string[];
  triggers: string[];
  previousAttempts: number;
  motivationLevel: number;
  supportSystem: string;
  goals: string;
  additionalNotes: string;
}

interface AddictionIntakeFormProps {
  onSubmit: (data: AddictionIntakeData) => void;
  onClose: () => void;
  initialData?: Partial<AddictionIntakeData>;
}

const AddictionIntakeForm: React.FC<AddictionIntakeFormProps> = ({ 
  onSubmit, 
  onClose, 
  initialData 
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<AddictionIntakeData>({
    addictionType: initialData?.addictionType || '',
    customAddiction: initialData?.customAddiction || '',
    dailyFrequency: initialData?.dailyFrequency || 0,
    weeklyFrequency: initialData?.weeklyFrequency || 0,
    importance: initialData?.importance || 5,
    currentImpact: initialData?.currentImpact || '',
    peakTimes: initialData?.peakTimes || [],
    triggers: initialData?.triggers || [],
    previousAttempts: initialData?.previousAttempts || 0,
    motivationLevel: initialData?.motivationLevel || 5,
    supportSystem: initialData?.supportSystem || '',
    goals: initialData?.goals || '',
    additionalNotes: initialData?.additionalNotes || '',
  });

  const addictionTypes = [
    'Smoking/Cigarettes',
    'Alcohol',
    'Drugs (Recreational)',
    'Prescription Medication',
    'Gambling',
    'Social Media/Internet',
    'Gaming',
    'Shopping',
    'Food/Eating',
    'Pornography',
    'Other'
  ];

  const timeSlots = [
    '6:00 AM - 9:00 AM',
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM',
    '9:00 PM - 12:00 AM',
    '12:00 AM - 3:00 AM',
    '3:00 AM - 6:00 AM'
  ];

  const commonTriggers = [
    'Stress',
    'Boredom',
    'Social situations',
    'Anxiety',
    'Depression',
    'Loneliness',
    'Anger',
    'Celebration',
    'Work pressure',
    'Relationship issues',
    'Physical pain',
    'Peer pressure'
  ];

  const handleInputChange = (field: keyof AddictionIntakeData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: 'peakTimes' | 'triggers', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.addictionType) {
      toast({
        title: "Missing Information",
        description: "Please select your addiction type.",
        variant: "destructive"
      });
      return;
    }

    if (formData.addictionType === 'Other' && !formData.customAddiction) {
      toast({
        title: "Missing Information",
        description: "Please specify your addiction type.",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
    toast({
      title: "Profile Updated",
      description: "Your addiction intensity profile has been saved successfully.",
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Brain className="h-12 w-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Addiction Assessment</h3>
        <p className="text-muted-foreground">
          Help us understand your situation to provide personalized support
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="addictionType">What type of addiction are you dealing with?</Label>
          <Select 
            value={formData.addictionType} 
            onValueChange={(value) => handleInputChange('addictionType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select addiction type" />
            </SelectTrigger>
            <SelectContent>
              {addictionTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.addictionType === 'Other' && (
          <div>
            <Label htmlFor="customAddiction">Please specify</Label>
            <Input
              id="customAddiction"
              value={formData.customAddiction}
              onChange={(e) => handleInputChange('customAddiction', e.target.value)}
              placeholder="Describe your addiction"
            />
          </div>
        )}

        <div>
          <Label>How important is it for you to overcome this addiction?</Label>
          <div className="mt-3 mb-2">
            <Slider
              value={[formData.importance]}
              onValueChange={(value) => handleInputChange('importance', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Not important (1)</span>
            <span className="font-medium">Current: {formData.importance}</span>
            <span>Extremely important (10)</span>
          </div>
        </div>

        <div>
          <Label htmlFor="currentImpact">What is affecting you most right now?</Label>
          <Textarea
            id="currentImpact"
            value={formData.currentImpact}
            onChange={(e) => handleInputChange('currentImpact', e.target.value)}
            placeholder="Describe how this addiction is currently impacting your life..."
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <TrendingUp className="h-12 w-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Usage Patterns</h3>
        <p className="text-muted-foreground">
          Understanding your patterns helps us provide better support
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dailyFrequency">Times per day</Label>
          <Input
            id="dailyFrequency"
            type="number"
            min="0"
            value={formData.dailyFrequency}
            onChange={(e) => handleInputChange('dailyFrequency', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="weeklyFrequency">Days per week</Label>
          <Input
            id="weeklyFrequency"
            type="number"
            min="0"
            max="7"
            value={formData.weeklyFrequency}
            onChange={(e) => handleInputChange('weeklyFrequency', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label>When do you typically engage in this behavior? (Select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {timeSlots.map((time) => (
            <Badge
              key={time}
              variant={formData.peakTimes.includes(time) ? "default" : "outline"}
              className="cursor-pointer justify-center p-2 text-xs"
              onClick={() => handleArrayToggle('peakTimes', time)}
            >
              {time}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="previousAttempts">How many times have you tried to quit before?</Label>
        <Input
          id="previousAttempts"
          type="number"
          min="0"
          value={formData.previousAttempts}
          onChange={(e) => handleInputChange('previousAttempts', parseInt(e.target.value) || 0)}
          placeholder="0"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Triggers & Motivation</h3>
        <p className="text-muted-foreground">
          Identifying triggers helps us send timely support
        </p>
      </div>

      <div>
        <Label>What typically triggers your addiction? (Select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {commonTriggers.map((trigger) => (
            <Badge
              key={trigger}
              variant={formData.triggers.includes(trigger) ? "default" : "outline"}
              className="cursor-pointer justify-center p-2 text-xs"
              onClick={() => handleArrayToggle('triggers', trigger)}
            >
              {trigger}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Current motivation level</Label>
        <div className="mt-3 mb-2">
          <Slider
            value={[formData.motivationLevel]}
            onValueChange={(value) => handleInputChange('motivationLevel', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Low motivation (1)</span>
          <span className="font-medium">Current: {formData.motivationLevel}</span>
          <span>Highly motivated (10)</span>
        </div>
      </div>

      <div>
        <Label htmlFor="supportSystem">Describe your current support system</Label>
        <Textarea
          id="supportSystem"
          value={formData.supportSystem}
          onChange={(e) => handleInputChange('supportSystem', e.target.value)}
          placeholder="Family, friends, therapist, support groups, etc."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="h-12 w-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Goals & Notes</h3>
        <p className="text-muted-foreground">
          Set your recovery goals and add any additional information
        </p>
      </div>

      <div>
        <Label htmlFor="goals">What are your recovery goals?</Label>
        <Textarea
          id="goals"
          value={formData.goals}
          onChange={(e) => handleInputChange('goals', e.target.value)}
          placeholder="What do you hope to achieve? What does success look like for you?"
          className="min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="additionalNotes">Additional notes or information</Label>
        <Textarea
          id="additionalNotes"
          value={formData.additionalNotes}
          onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
          placeholder="Anything else you'd like us to know..."
          className="min-h-[80px]"
        />
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Summary of Your Profile:</h4>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p><strong>Addiction:</strong> {formData.addictionType === 'Other' ? formData.customAddiction : formData.addictionType}</p>
          <p><strong>Frequency:</strong> {formData.dailyFrequency} times/day, {formData.weeklyFrequency} days/week</p>
          <p><strong>Importance Level:</strong> {formData.importance}/10</p>
          <p><strong>Peak Times:</strong> {formData.peakTimes.length} time slots selected</p>
          <p><strong>Triggers:</strong> {formData.triggers.length} triggers identified</p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Addiction Intensity Assessment
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderCurrentStep()}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AddictionIntakeForm;
