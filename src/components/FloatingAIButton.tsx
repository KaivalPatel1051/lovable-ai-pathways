import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AIChatbox from './AIChatbox';

const FloatingAIButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        onClick={() => setIsChatOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isChatOpen ? { scale: 0 } : { scale: 1 }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
          transition: 'all 0.3s ease'
        }}
      >
        🤖
      </motion.button>

      {/* AI Chatbox */}
      <AIChatbox
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default FloatingAIButton;
