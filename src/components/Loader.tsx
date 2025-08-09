import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Loader.css';

interface LoaderProps {
  onLoadingComplete: () => void;
}

const fonts = [
  '"Montserrat", sans-serif',
  '"Mozilla Headline", sans-serif',
  '"Noto Sans JP", sans-serif',
  '"Noto Sans KR", sans-serif',
  '"Noto Serif", serif',
  '"Oswald", sans-serif'
];

const Loader: React.FC<LoaderProps> = ({ onLoadingComplete }) => {
  const [percentage, setPercentage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [showHeading, setShowHeading] = useState(false);
  const [fontIndex, setFontIndex] = useState(0);
  const [finalFont, setFinalFont] = useState(fonts[0]);
  const [fontSwitching, setFontSwitching] = useState(false); // start false until fonts ready

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Wait for fonts to load before starting loader
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontSwitching(true); // now start font switching

      const interval = setInterval(() => {
        setPercentage(prev => {
          if (prev >= 100) {
            clearInterval(interval);

            // Stop switching fonts before showing heading
            setFontSwitching(false);
            setFinalFont(fonts[fontIndex]);

            // Delay before heading animation starts
            setTimeout(() => {
              setShowHeading(true);

              // After heading animation ends, fade out
              setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                  onLoadingComplete();
                }, 500);
              }, 3000);
            }, 300);

            return 100;
          }
          return prev + 2;
        });
      }, 15);

      return () => clearInterval(interval);
    });
  }, [onLoadingComplete, fontIndex]);

  // Smooth font switching with fade effect
  useEffect(() => {
    if (fontSwitching) {
      const fontInterval = setInterval(() => {
        setFontIndex(prev => (prev + 1) % fonts.length);
      }, 1600);
      return () => clearInterval(fontInterval);
    }
  }, [fontSwitching]);

  return (
    <div className={`loader-wrapper ${fadeOut ? 'fade-out' : ''}`}>
      <video
        className="loader-video"
        src="/videos/loader.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="loader-text">
        <AnimatePresence mode="wait">
          {showHeading ? (
            <motion.h1
              key="heading"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 2.8, ease: 'easeInOut' }}
              style={{
                fontSize: '4rem',
                fontFamily: finalFont, // locked font
                transformOrigin: 'center'
              }}
            >
              ADDICTION FREE LIFE
            </motion.h1>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`font-${fontIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    fontSize: '3rem',
                    fontFamily: fonts[fontIndex],
                    transition: 'font-family 0.5s ease'
                  }}
                >
                  ADDICTION FREE LIFE
                </motion.h1>
              </AnimatePresence>

              {/* Circular Progress Loader */}
              <div className="progress-wrapper">
                <svg
                  className="progress-ring"
                  width="100"
                  height="100"
                >
                  <circle
                    className="progress-ring__background"
                    stroke="#ddd"
                    fill="transparent"
                    strokeWidth="6"
                    r={radius}
                    cx="50"
                    cy="50"
                  />
                  <motion.circle
                    className="progress-ring__circle"
                    stroke="#00aced"
                    fill="transparent"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference - (percentage / 100) * circumference
                    }
                    r={radius}
                    cx="50"
                    cy="50"
                    style={{ transition: 'stroke-dashoffset 0.2s ease' }}
                  />
                </svg>
                <div className="progress-text">{percentage}%</div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Loader;
