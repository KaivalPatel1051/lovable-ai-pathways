import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TextType from '@/components/TextType';
import Particles from '@/components/Particles';
import './LoaderPage.css';

interface LoaderPageProps {
  onComplete: () => void;
}

const LoaderPage: React.FC<LoaderPageProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (animationComplete) {
      // Start fade-out immediately, then navigate quickly for a snappy transition
      const fadeTimer = setTimeout(() => {
        setShowLoader(false); // Trigger exit animation
        const navTimer = setTimeout(() => {
          onComplete();
          navigate('/login', { state: { fromLoader: true, loginTransition: 'zoomOutReveal' } });
        }, 250); // quick exit animation (~250ms)
        return () => clearTimeout(navTimer);
      }, 0); // no extra wait after typing

      return () => clearTimeout(fadeTimer);
    }
  }, [animationComplete, onComplete, navigate]);

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
  };

  return (
    <AnimatePresence mode="wait">
      {showLoader && (
        <motion.div
          className="loader-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)"
          }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Background Particles */}
          <div className="loader-particles">
            <Particles 
              particleCount={50}
              particleColors={["#6366f1", "#8b5cf6", "#06b6d4"]}
              speed={0.5}
            />
          </div>

          {/* Gradient Background */}
          <div className="loader-gradient-bg" />

          {/* Main Content */}
          <motion.div 
            className="loader-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Logo/Brand Area */}
            <motion.div 
              className="loader-brand"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="brand-icon">
                <motion.div 
                  className="brand-circle"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                />
              </div>
            </motion.div>

            {/* Animated Text */}
            <div className="loader-text-container">
              <TextType
                text="NISCHAY"
                className="loader-main-text"
                typingSpeed={120}
                initialDelay={1200}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="loader-cursor"
                textColors={["#ffffff"]}
                onSentenceComplete={handleAnimationComplete}
                loop={false}
              />
              
              <motion.div 
                className="loader-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 20 }}
                transition={{ duration: 0.6 }}
              >
                Your AI-Powered Recovery Companion
              </motion.div>
            </div>

            {/* Loading Indicator */}
            <motion.div 
              className="loader-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: animationComplete ? 1 : 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="loading-dots">
                <motion.div 
                  className="dot"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div 
                  className="dot"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="dot"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Animated Background Elements */}
          <div className="loader-bg-elements">
            <motion.div 
              className="floating-element element-1"
              animate={{ 
                y: [-20, 20, -20],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="floating-element element-2"
              animate={{ 
                y: [20, -20, 20],
                rotate: [360, 180, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="floating-element element-3"
              animate={{ 
                y: [-15, 15, -15],
                x: [-10, 10, -10]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoaderPage;
