import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlurText from './BlurText'; // Assuming BlurText component is in the same directory
import './Loader.css'; // Assuming Loader.css is in the same directory

interface LoaderProps {
  onLoadingComplete: () => void;
}

const Loader: React.FC<LoaderProps> = ({ onLoadingComplete }) => {
  const [percentage, setPercentage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [showAddictionFreeLife, setShowAddictionFreeLife] = useState(true);
  const [showFinalAnimation, setShowFinalAnimation] = useState(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);

  const loadingSteps = [
    "Initializing recovery platform...",
    "Loading personalized content...",
    "Connecting to support network...",
    "Preparing your dashboard...",
    "Almost ready..."
  ];

  useEffect(() => {
    // This effect runs once on mount to control the entire loading sequence.
    const startLoading = () => {
      const interval = setInterval(() => {
        setPercentage(prev => {
          const newPercentage = prev + 1.2;

          // Update the loading step text based on progress
          const stepIndex = Math.floor((newPercentage / 100) * loadingSteps.length);
          if (stepIndex !== currentLoadingStep && stepIndex < loadingSteps.length) {
            setCurrentLoadingStep(stepIndex);
          }

          // Check if loading is complete
          if (newPercentage >= 100) {
            clearInterval(interval);
            setCurrentLoadingStep(loadingSteps.length - 1);
            setShowAddictionFreeLife(false); // Hide "ADDICTION FREE LIFE" text

            // Wait for the loading stage to animate out before showing the final animation
            setTimeout(() => {
              setShowFinalAnimation(true); // Trigger the "NISCHAY" animation

              // --- KEY CHANGE ---
              // Calculate the duration of the final "NISCHAY" animation.
              // The BlurText animation is the longest part: 7 letters * 0.8s stepDuration = 5.6s.
              // We'll use 5800ms to give it a small buffer to complete fully.
              const finalAnimationDuration = 5800;

              setTimeout(() => {
                setFadeOut(true); // Start fading out the entire loader screen

                // The fade-out animation itself takes 1s (defined in Loader.css).
                // We call onLoadingComplete after this fade-out is finished.
                setTimeout(() => {
                  onLoadingComplete();
                }, 1000);
              }, finalAnimationDuration);
            }, 800); // 800ms delay for a smooth transition between loading stages

            return 100;
          }
          return newPercentage;
        });
      }, 40); // This interval controls the speed of the progress bar

      return () => clearInterval(interval); // Cleanup on unmount
    };

    // A brief delay before starting the loader for a smoother entry
    const timeoutId = setTimeout(startLoading, 500);

    return () => {
      clearTimeout(timeoutId);
    };
    // The dependency array is empty to ensure this effect runs only once.
  }, []);

  return (
    <div className={`blur-text-loader ${fadeOut ? 'fade-out' : ''}`}>
      {/* Background animation divs */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="loader-content">
        <AnimatePresence mode="wait">
          {!showFinalAnimation ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="loading-stage"
            >
              {/* This section is shown during the progress bar loading */}
              {showAddictionFreeLife && (
                <>
                  <BlurText
                    text="ADDICTION FREE LIFE"
                    delay={120}
                    animateBy="words"
                    direction="bottom"
                    className="main-blur-title"
                    stepDuration={0.5}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="progress-section"
                  >
                    {/* The single elegant progress line */}
                    <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>

                    {/* The animated loading step text */}
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentLoadingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="loading-subtitle"
                      >
                        {loadingSteps[currentLoadingStep]}
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="final-stage"
            >
              {/* The final "NISCHAY" animation */}
              <BlurText
                text="NISCHAY"
                delay={100}
                animateBy="letters"
                direction="top"
                className="final-blur-title"
                stepDuration={0.8}
              />
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '60%', opacity: 0.8 }}
                transition={{ duration: 1.5, delay: 1 }}
                className="final-underline"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Loader;