import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Loader.css';

interface LoaderProps {
  onLoadingComplete: () => void;
}

const fonts = [
  '"Montserrat", sans-serif',
  '"Inter", sans-serif',
  '"Poppins", sans-serif',
  '"Roboto", sans-serif',
  '"Open Sans", sans-serif',
  '"Lato", sans-serif'
];

const motivationalQuotes = [
  "Every moment is a fresh beginning.",
  "Recovery is not a destination, it's a journey.",
  "You are stronger than your struggles.",
  "One day at a time, one step at a time.",
  "Your future self is counting on you.",
  "Progress, not perfection.",
  "Healing happens here."
];

const Loader: React.FC<LoaderProps> = ({ onLoadingComplete }) => {
  const [percentage, setPercentage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [showHeading, setShowHeading] = useState(false);
  const [fontIndex, setFontIndex] = useState(0);
  const [finalFont, setFinalFont] = useState(fonts[0]);
  const [fontSwitching, setFontSwitching] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'loading' | 'quote' | 'complete'>('loading');

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Enhanced loading sequence
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontSwitching(true);

      const interval = setInterval(() => {
        setPercentage(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setLoadingStage('quote');
            setFontSwitching(false);
            setFinalFont(fonts[fontIndex]);

            // Show motivational quote
            setTimeout(() => {
              setShowQuote(true);
              
              // Cycle through quotes
              const quoteInterval = setInterval(() => {
                setCurrentQuote(prev => (prev + 1) % motivationalQuotes.length);
              }, 1500);

              // After showing quotes, show final heading
              setTimeout(() => {
                clearInterval(quoteInterval);
                setShowQuote(false);
                setLoadingStage('complete');
                
                setTimeout(() => {
                  setShowHeading(true);

                  // Final fade out
                  setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => {
                      onLoadingComplete();
                    }, 800);
                  }, 2500);
                }, 500);
              }, 6000);
            }, 500);

            return 100;
          }
          return prev + 1.5;
        });
      }, 20);

      return () => clearInterval(interval);
    });
  }, [onLoadingComplete, fontIndex]);

  // Smooth font switching with fade effect
  useEffect(() => {
    if (fontSwitching) {
      const fontInterval = setInterval(() => {
        setFontIndex(prev => (prev + 1) % fonts.length);
      }, 1200);
      return () => clearInterval(fontInterval);
    }
  }, [fontSwitching]);

  return (
    <div className={`loader-wrapper ${fadeOut ? 'fade-out' : ''}`}>
      {/* Animated Background Gradient */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="loader-content">
        <AnimatePresence mode="wait">
          {loadingStage === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="loading-stage"
            >
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`font-${fontIndex}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="main-title"
                  style={{
                    fontFamily: fonts[fontIndex],
                  }}
                >
                  ADDICTION FREE LIFE
                </motion.h1>
              </AnimatePresence>

              {/* Enhanced Circular Progress Loader */}
              <div className="progress-container">
                <div className="progress-wrapper">
                  <svg className="progress-ring" width="120" height="120">
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <circle
                      className="progress-ring__background"
                      stroke="rgba(255,255,255,0.1)"
                      fill="transparent"
                      strokeWidth="8"
                      r={radius + 10}
                      cx="60"
                      cy="60"
                    />
                    <motion.circle
                      className="progress-ring__circle"
                      stroke="url(#progressGradient)"
                      fill="transparent"
                      strokeWidth="8"
                      strokeDasharray={circumference + 62.8}
                      strokeDashoffset={
                        (circumference + 62.8) - (percentage / 100) * (circumference + 62.8)
                      }
                      r={radius + 10}
                      cx="60"
                      cy="60"
                      strokeLinecap="round"
                      style={{ 
                        transition: 'stroke-dashoffset 0.3s ease',
                        filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))'
                      }}
                    />
                  </svg>
                  <div className="progress-content">
                    <div className="progress-text">{percentage}%</div>
                    <div className="progress-label">Loading</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {loadingStage === 'quote' && showQuote && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="quote-stage"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuote}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className="quote-container"
                >
                  <div className="quote-icon">✨</div>
                  <p className="quote-text">{motivationalQuotes[currentQuote]}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {loadingStage === 'complete' && showHeading && (
            <motion.div
              key="complete"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
              className="completion-stage"
            >
              <h1
                className="final-title"
                style={{
                  fontFamily: finalFont,
                }}
              >
                ADDICTION FREE LIFE
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="title-underline"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Loader;
