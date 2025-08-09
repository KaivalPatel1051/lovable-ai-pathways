import React, { useEffect, useState } from 'react';
import './Loader.css';

interface LoaderProps {
  onLoadingComplete: () => void;
}

const Loader: React.FC<LoaderProps> = ({ onLoadingComplete }) => {
  const [percentage, setPercentage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Start fade out animation
          setFadeOut(true);
          // After fade out duration, call onLoadingComplete
          setTimeout(() => {
            onLoadingComplete();
          }, 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

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
        <h1>ADDICTION FREE LIFE</h1>
        <p>loading... {percentage}%</p>
      </div>
    </div>
  );
};

export default Loader;
