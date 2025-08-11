import React from 'react';

interface NischayLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const NischayLoader: React.FC<NischayLoaderProps> = ({ 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} font-medium text-primary animate-serene-loader serene-text`}>
        nischay
      </div>
    </div>
  );
};

export default NischayLoader;
