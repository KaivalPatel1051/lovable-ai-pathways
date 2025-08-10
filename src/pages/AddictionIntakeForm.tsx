import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

interface AddictionFormData {
  addictionType: string;
  intensity: number;
  frequency: string;
  peakUrgeTimes: string[];
  triggers: string[];
  duration: number;
  durationUnit: string;
  previousAttempts: boolean;
  previousAttemptsCount: number;
  longestSobriety: number;
  sobrietyUnit: string;
  motivations: string[];
  supportSystem: string;
  notes: string;
}

const AddictionIntakeForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState<AddictionFormData>({
    addictionType: '',
    intensity: 5,
    frequency: '',
    peakUrgeTimes: [],
    triggers: [],
    duration: 1,
    durationUnit: 'years',
    previousAttempts: false,
    previousAttemptsCount: 0,
    longestSobriety: 0,
    sobrietyUnit: 'days',
    motivations: [],
    supportSystem: '',
    notes: ''
  });

  const addictionTypes = [
    'Smoking/Tobacco',
    'Alcohol',
    'Gaming',
    'Social Media',
    'Drugs',
    'Shopping',
    'Food/Eating',
    'Gambling',
    'Pornography',
    'Work',
    'Other'
  ];

  const frequencyOptions = [
    'Multiple times daily',
    'Daily',
    'Several times a week',
    'Weekly',
    'Several times a month',
    'Monthly',
    'Occasionally'
  ];

  const timeSlots = [
    'Early Morning (5-8 AM)',
    'Morning (8-11 AM)',
    'Late Morning (11 AM-1 PM)',
    'Afternoon (1-4 PM)',
    'Late Afternoon (4-6 PM)',
    'Evening (6-9 PM)',
    'Night (9 PM-12 AM)',
    'Late Night (12-5 AM)'
  ];

  const commonTriggers = [
    'Stress',
    'Boredom',
    'Anxiety',
    'Depression',
    'Social situations',
    'Work pressure',
    'Loneliness',
    'Celebration',
    'Peer pressure',
    'Habit/Routine',
    'Physical pain',
    'Emotional pain'
  ];

  const motivationOptions = [
    'Health improvement',
    'Family/Relationships',
    'Financial savings',
    'Career advancement',
    'Self-respect',
    'Physical appearance',
    'Mental clarity',
    'Spiritual growth',
    'Setting example for others',
    'Personal achievement'
  ];

  const handleArrayToggle = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Submitting addiction intake form:', formData);
      
      const response = await apiService.createAddictionProfile(formData);
      console.log('✅ Addiction profile created:', response.data);
      
      // Navigate to dashboard after successful submission
      navigate('/dashboard', { 
        state: { 
          message: '✅ Your addiction profile has been created! Let\'s start your recovery journey.',
          showWelcome: true 
        }
      });
      
    } catch (err: any) {
      console.error('❌ Failed to create addiction profile:', err);
      setError(err.response?.data?.message || 'Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.addictionType !== '';
      case 2:
        return formData.frequency !== '';
      case 3:
        return formData.peakUrgeTimes.length > 0;
      case 4:
        return formData.triggers.length > 0;
      case 5:
        return formData.motivations.length > 0;
      case 6:
        return true; // Optional step
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 style={{ color: '#8b5cf6', marginBottom: '20px', fontSize: '24px' }}>
              What type of addiction are you working to overcome?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {addictionTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, addictionType: type })}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    border: formData.addictionType === type ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: formData.addictionType === type ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '16px'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            {formData.addictionType === 'Other' && (
              <input
                type="text"
                placeholder="Please specify..."
                style={{
                  width: '100%',
                  padding: '15px',
                  marginTop: '20px',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ color: '#8b5cf6', marginBottom: '20px', fontSize: '24px' }}>
              How often do you engage in this behavior?
            </h2>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ color: '#ccc', fontSize: '18px', marginBottom: '15px', display: 'block' }}>
                Intensity Level (1-10): {formData.intensity}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '5px',
                  background: `linear-gradient(to right, #10b981 0%, #f59e0b ${formData.intensity * 10}%, #ef4444 100%)`,
                  outline: 'none',
                  appearance: 'none'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '12px', marginTop: '5px' }}>
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
            
            <div>
              <label style={{ color: '#ccc', fontSize: '18px', marginBottom: '15px', display: 'block' }}>
                Frequency:
              </label>
              <div style={{ display: 'grid', gap: '10px' }}>
                {frequencyOptions.map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setFormData({ ...formData, frequency: freq })}
                    style={{
                      padding: '15px',
                      borderRadius: '10px',
                      border: formData.frequency === freq ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: formData.frequency === freq ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left'
                    }}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <label style={{ color: '#ccc', fontSize: '18px', marginBottom: '15px', display: 'block' }}>
                How long have you been dealing with this addiction?
              </label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    width: '100px'
                  }}
                />
                <select
                  value={formData.durationUnit}
                  onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ color: '#8b5cf6', marginBottom: '20px', fontSize: '24px' }}>
              When do you typically experience the strongest urges?
            </h2>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>Select all times that apply:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleArrayToggle(
                    formData.peakUrgeTimes, 
                    time, 
                    (arr) => setFormData({ ...formData, peakUrgeTimes: arr })
                  )}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    border: formData.peakUrgeTimes.includes(time) ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: formData.peakUrgeTimes.includes(time) ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left'
                  }}
                >
                  {formData.peakUrgeTimes.includes(time) ? '✓ ' : ''}{time}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ color: '#8b5cf6', marginBottom: '20px', fontSize: '24px' }}>
              What are your main triggers?
            </h2>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>Select all triggers that apply to you:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {commonTriggers.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => handleArrayToggle(
                    formData.triggers, 
                    trigger, 
                    (arr) => setFormData({ ...formData, triggers: arr })
                  )}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    border: formData.triggers.includes(trigger) ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: formData.triggers.includes(trigger) ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  {formData.triggers.includes(trigger) ? '✓ ' : ''}{trigger}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 style={{ color: '#8b5cf6', marginBottom: '20px', fontSize: '24px' }}>
              What motivates you to overcome this addiction?
            </h2>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>Select your main motivations:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              {motivationOptions.map((motivation) => (
                <button
                  key={motivation}
                  onClick={() => handleArrayToggle(
                    formData.motivations, 
                    motivation, 
                    (arr) => setFormData({ ...formData, motivations: arr })
                  )}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    border: formData.motivations.includes(motivation) ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: formData.motivations.includes(motivation) ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  {formData.motivations.includes(motivation) ? '✓ ' : ''}{motivation}
                </button>
              ))}
            </div>

            <div>
              <h3 style={{ color: '#8b5cf6', marginBottom: '15px', fontSize: '20px' }}>
                Previous Recovery Attempts
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.previousAttempts}
                    onChange={(e) => setFormData({ ...formData, previousAttempts: e.target.checked })}
                    style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                  />
                  I have tried to quit before
                </label>
              </div>

              {formData.previousAttempts && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                      Number of attempts:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.previousAttemptsCount}
                      onChange={(e) => setFormData({ ...formData, previousAttemptsCount: parseInt(e.target.value) })}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        fontSize: '16px',
                        outline: 'none',
                        width: '80px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                      Longest period clean:
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        value={formData.longestSobriety}
                        onChange={(e) => setFormData({ ...formData, longestSobriety: parseInt(e.target.value) })}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                          fontSize: '16px',
                          outline: 'none',
                          width: '80px'
                        }}
                      />
                      <select
                        value={formData.sobrietyUnit}
                        onChange={(e) => setFormData({ ...formData, sobrietyUnit: e.target.value })}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 style={{ color: '#8b5cf6', marginBottom: '20px', fontSize: '24px' }}>
              Additional Information (Optional)
            </h2>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{ color: '#ccc', fontSize: '18px', marginBottom: '15px', display: 'block' }}>
                Support System:
              </label>
              <select
                value={formData.supportSystem}
                onChange={(e) => setFormData({ ...formData, supportSystem: e.target.value })}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              >
                <option value="">Select your support system</option>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="therapist">Therapist/Counselor</option>
                <option value="support-group">Support Group</option>
                <option value="online-community">Online Community</option>
                <option value="none">No support system</option>
                <option value="multiple">Multiple sources</option>
              </select>
            </div>

            <div>
              <label style={{ color: '#ccc', fontSize: '18px', marginBottom: '15px', display: 'block' }}>
                Additional Notes:
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Share anything else that might help us understand your situation better..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '32px', 
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🌟 Addiction Recovery Assessment
          </h1>
          <p style={{ color: '#ccc', fontSize: '18px' }}>
            Help us understand your journey so we can provide personalized support
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '10px' 
          }}>
            <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
              Step {currentStep} of {totalSteps}
            </span>
            <span style={{ color: '#ccc' }}>
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentStep / totalSteps) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Form Content */}
        <div style={{ marginBottom: '40px' }}>
          {renderStep()}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            style={{
              padding: '15px 30px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: currentStep === 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
              color: currentStep === 1 ? '#666' : 'white',
              fontSize: '16px',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ← Previous
          </button>

          {currentStep === totalSteps ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '15px 40px',
                borderRadius: '10px',
                border: 'none',
                background: loading ? '#666' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '🔄 Saving...' : '✨ Complete Assessment'}
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              style={{
                padding: '15px 30px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: !isStepValid() ? 'rgba(255, 255, 255, 0.1)' : '#8b5cf6',
                color: !isStepValid() ? '#666' : 'white',
                fontSize: '16px',
                cursor: !isStepValid() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Next →
            </button>
          )}
        </div>

        {/* Skip Option */}
        {currentStep < totalSteps && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              Skip assessment for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddictionIntakeForm;
