import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextType from './TextType';

interface AnimatedLoaderProps {
  onComplete: () => void;
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({ onComplete }) => {
  const [showLoader, setShowLoader] = useState(true);

  const handleTypingComplete = () => {
    // Wait a moment after typing completes, then trigger the transition
    setTimeout(() => {
      setShowLoader(false);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 1500);
  };

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)"
          }}
          transition={{ 
            duration: 0.8,
            ease: "easeInOut"
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-sm"
        >
          {/* Background Orb Effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-96 h-96 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-3xl" />
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative z-10 text-center"
          >
            {/* Animated Text */}
            <div className="mb-8">
              <TextType
                text="Nischay"
                className="text-6xl md:text-8xl font-bold"
                typingSpeed={150}
                initialDelay={800}
                showCursor={true}
                cursorCharacter="|"
                cursorBlinkDuration={0.8}
                onSentenceComplete={handleTypingComplete}
              />
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.6 }}
              className="text-muted-foreground text-lg font-medium"
            >
              Your Journey to Recovery
            </motion.p>

            {/* Loading Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 0.5 }}
              className="flex justify-center space-x-2 mt-8"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Particle Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 10,
                  opacity: 0,
                }}
                animate={{
                  y: -10,
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-1 h-1 bg-primary/40 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedLoader;
