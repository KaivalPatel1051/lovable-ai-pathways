// src/pages/Loader.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const messages = [
  "Break the scroll.",
  "Focus on real life.",
  "Control the screen.",
  "You’re doing great.",
];

export default function Loader({ onFinish }: { onFinish?: () => void }) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Message change
    const msgTimer = setInterval(() => {
      setIdx((i) => (i + 1) % messages.length);
    }, 500);

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressTimer);
          if (onFinish) onFinish();
          return 100;
        }
        return p + 5;
      });
    }, 50); // speed (fast like Instagram)

    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
    };
  }, [onFinish]);

  return (
    <div style={{
      height: "100vh", display: "flex",
      flexDirection: "column", justifyContent: "center",
      alignItems: "center", background: "#0D0F2C"
    }}>
      {/* Main animation icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          width: 80, height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF4D4D, #FF9933)",
          marginBottom: 20,
        }}
      />

      {/* Messages */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ color: "#FFFFFF", fontSize: "1.2rem", textAlign: "center" }}
        >
          {messages[idx]}
        </motion.div>
      </AnimatePresence>

      {/* Progress percentage */}
      <div style={{ marginTop: 20, color: "#fff", fontSize: "0.9rem" }}>
        {progress}%
      </div>
    </div>
  );
}
