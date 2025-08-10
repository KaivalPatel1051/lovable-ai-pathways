import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface AIChatboxProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
}

const AIChatbox: React.FC<AIChatboxProps> = ({ isOpen, onClose, userProfile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI recovery companion. I'm here to support you on your journey to overcome addiction. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiTyping]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // This is a mock AI response generator
    // In production, this would connect to OpenAI GPT-4 or a custom trained model
    
    const responses = {
      // Greeting responses
      greeting: [
        "Hello! I'm glad you're here. Taking the step to seek support shows incredible strength. What's on your mind today?",
        "Hi there! I'm here to support you through your recovery journey. How can I help you right now?",
        "Welcome! It's great to see you. Remember, every day you choose recovery is a victory. What would you like to talk about?"
      ],
      
      // Craving/urge responses
      craving: [
        "I understand you're experiencing cravings right now. This is completely normal and shows your brain is healing. Let's work through this together. Can you tell me what triggered this feeling?",
        "Cravings are temporary, but your strength is permanent. Try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
        "You've overcome cravings before, and you can do it again. Remember your motivations - what are the top 3 reasons you want to stay clean?"
      ],
      
      // Emotional support
      emotional: [
        "Your feelings are valid, and it's okay to struggle sometimes. Recovery isn't linear, and having difficult days doesn't mean you're failing. What specific emotions are you experiencing?",
        "I hear that you're going through a tough time. Remember, reaching out for support like you're doing right now is a sign of strength, not weakness.",
        "It sounds like you're dealing with some heavy emotions. Would it help to talk about what's causing these feelings?"
      ],
      
      // Progress and motivation
      progress: [
        "That's fantastic progress! Every small step forward is worth celebrating. What strategies have been working best for you?",
        "I'm proud of the effort you're putting into your recovery. What positive changes have you noticed in yourself lately?",
        "Your commitment to recovery is inspiring. How do you feel about the progress you've made so far?"
      ],
      
      // Default supportive responses
      default: [
        "Thank you for sharing that with me. Your honesty and openness are important parts of your healing journey. How can I best support you right now?",
        "I appreciate you trusting me with your thoughts. Recovery is a brave journey, and you're showing incredible courage. What would be most helpful for you today?",
        "I'm here to listen and support you. Your recovery matters, and so do you. What's the most important thing you'd like to focus on right now?"
      ]
    };

    // Simple keyword matching for demo purposes
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    } else if (message.includes('craving') || message.includes('urge') || message.includes('want to use') || message.includes('tempted')) {
      return responses.craving[Math.floor(Math.random() * responses.craving.length)];
    } else if (message.includes('sad') || message.includes('depressed') || message.includes('anxious') || message.includes('stressed') || message.includes('angry')) {
      return responses.emotional[Math.floor(Math.random() * responses.emotional.length)];
    } else if (message.includes('good') || message.includes('better') || message.includes('progress') || message.includes('clean') || message.includes('sober')) {
      return responses.progress[Math.floor(Math.random() * responses.progress.length)];
    } else {
      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setAiTyping(true);

    try {
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const aiResponse = await generateAIResponse(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setAiTyping(false);
      setMessages(prev => [...prev, aiMessage]);

      // In production, save to backend
      // await apiService.saveChatMessage(userMessage, aiMessage);

    } catch (error) {
      console.error('Error generating AI response:', error);
      setAiTyping(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment. Remember, you're not alone in this journey.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickResponses = [
    "I'm having cravings",
    "I'm feeling stressed",
    "I need motivation",
    "Tell me about my progress",
    "I'm feeling good today"
  ];

  const handleQuickResponse = (response: string) => {
    setInputMessage(response);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '400px',
          height: '600px',
          backgroundColor: 'rgba(26, 26, 26, 0.98)',
          borderRadius: '20px',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🤖
            </div>
            <div>
              <h3 style={{ color: 'white', margin: 0, fontSize: '16px' }}>AI Recovery Companion</h3>
              <p style={{ color: '#888', margin: 0, fontSize: '12px' }}>Always here to support you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '5px',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#888';
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: message.sender === 'user' 
                  ? 'rgba(139, 92, 246, 0.8)' 
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {message.content}
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '4px',
                  textAlign: message.sender === 'user' ? 'right' : 'left'
                }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}

          {/* AI Typing Indicator */}
          {aiTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}
            >
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px 18px 18px 4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#888',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '3px'
                }}>
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6'
                    }}
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6'
                    }}
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6'
                    }}
                  />
                </div>
                AI is thinking...
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Responses */}
        {messages.length <= 2 && (
          <div style={{
            padding: '0 20px 10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ color: '#888', fontSize: '12px', margin: '10px 0 8px' }}>Quick responses:</p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                  }}
                >
                  {response}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts or ask for support..."
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              minHeight: '20px',
              maxHeight: '80px'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              padding: '12px',
              borderRadius: '50%',
              border: 'none',
              background: (!inputMessage.trim() || isLoading) 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              color: 'white',
              cursor: (!inputMessage.trim() || isLoading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChatbox;
