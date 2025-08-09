import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VideoLoader.css';

interface VideoLoaderProps {
  onLoadingComplete: () => void;
}

const VideoLoader: React.FC<VideoLoaderProps> = ({ onLoadingComplete }) => {
  const [percentage, setPercentage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [showFinalText, setShowFinalText] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setPercentage(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Show final text animation
          setTimeout(() => {
            setShowFinalText(true);
            
            // Complete loading after final animation
            setTimeout(() => {
              setFadeOut(true);
              setTimeout(() => {
                onLoadingComplete();
              }, 1000);
            }, 3000);
          }, 500);
          
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className={`video-loader-wrapper ${fadeOut ? 'fade-out' : ''}`}>
      {/* Background Video */}
      <video
        className="loader-video"
        src="/loader.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      
      {/* Dark Overlay */}
      <div className="video-overlay" />

      {/* Content Overlay */}
      <div className="video-loader-content">
        <AnimatePresence mode="wait">
          {!showFinalText ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="loading-content"
            >
              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="main-title"
              >
                ADDICTION FREE LIFE
              </motion.h1>

              {/* Loading Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="progress-section"
              >
                {/* Progress Bar */}
                <div className="progress-bar-container">
                  <div className="progress-bar-bg">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="progress-percentage">{percentage}%</div>
                </div>

                {/* Loading Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  className="loading-text"
                >
                  Preparing your journey to recovery...
                </motion.p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="final-content"
            >
              <motion.h1
                initial={{ letterSpacing: '0.1em' }}
                animate={{ letterSpacing: '0.3em' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                className="final-title"
              >
                ADDICTION FREE LIFE
              </motion.h1>
              
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="final-underline"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoLoader;
