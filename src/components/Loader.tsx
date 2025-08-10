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
                    <div className="progress-bar-container">
                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="progress-info">
                        <div className="progress-percentage">{Math.round(percentage)}%</div>
                        <div className="progress-dots">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="progress-dot"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
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
                className="final-blur-title"
                stepDuration={0.8}
                animationFrom={{ filter: 'blur(15px)', opacity: 0, scale: 0.8 }}
                animationTo={[
                  { filter: 'blur(8px)', opacity: 0.6, scale: 0.9 },
                  { filter: 'blur(0px)', opacity: 1, scale: 1.1 }
                ]}
              />
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
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
