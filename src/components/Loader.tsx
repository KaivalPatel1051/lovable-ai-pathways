import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlurText from './BlurText';
import './Loader.css';

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
    setShowAddictionFreeLife(true);

    const intervalId = setTimeout(() => {
      const interval = setInterval(() => {
        setPercentage(prev => {
          const newPercentage = prev + 1.2;

          const stepIndex = Math.floor((newPercentage / 100) * loadingSteps.length);
          if (stepIndex !== currentLoadingStep && stepIndex < loadingSteps.length) {
            setCurrentLoadingStep(stepIndex);
          }

          if (newPercentage >= 100) {
            clearInterval(interval);
            setCurrentLoadingStep(loadingSteps.length - 1);
            setShowAddictionFreeLife(false); // Hide “ADDICTION FREE LIFE”

            setTimeout(() => {
              setShowFinalAnimation(true); // Show “NISCHAY” animation

              setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                  onLoadingComplete();
                }, 1000);
              }, 3000);
            }, 800);

            return 100;
          }
          return newPercentage;
        });
      }, 40);
    }, 1000);

    return () => {
      clearTimeout(intervalId);
    };
  }, [currentLoadingStep, loadingSteps.length, onLoadingComplete]);

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

                  {/* Progress Bar + Steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="progress-section"
                  >
                    <div className="progress-section">
                      {/* Elegant single progress line */}
                      <div className="w-full h-0.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full animate-serene-progress"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

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
              <BlurText
                text="NISCHAY"
                delay={100}
                animateBy="letters"
                direction="top"
                className="final-blur-title serene-text"
                stepDuration={0.8}
                animationFrom={{ filter: 'blur(10px)', opacity: 0, scale: 0.95 }}
                animationTo={[
                  { filter: 'blur(5px)', opacity: 0.7, scale: 0.98 },
                  { filter: 'blur(0px)', opacity: 1, scale: 1.02 }
                ]}
              />
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '60%', opacity: 0.8 }}
                transition={{ duration: 1.5, delay: 1 }}
                className="h-0.5 bg-primary rounded-full mx-auto mt-4"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Loader;
