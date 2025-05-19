// components/EchonestLogo.tsx
import React from 'react';

type EchonestLogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const EchonestLogo: React.FC<EchonestLogoProps> = ({ className = "", size = "md" }) => {
  // Size classes
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12"
  };

  // Use type assertion to ensure TypeScript knows size is a valid key
  const iconSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${iconSize} relative`}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Gradient background */}
          <defs>
            <linearGradient id="echonestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" /> {/* blue-500 */}
              <stop offset="100%" stopColor="#8B5CF6" /> {/* purple-500 */}
            </linearGradient>
          </defs>
          
          {/* Main circular background */}
          <circle cx="50" cy="50" r="45" fill="url(#echonestGradient)" />

          {/* Sound wave circles */}
          <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="3" strokeDasharray="2 3" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="3" strokeDasharray="2 3" />
          
          {/* Central Echo Dot */}
          <circle cx="50" cy="50" r="10" fill="white" />
        </svg>
      </div>
      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-xl">
        Echonest.ai
      </span>
    </div>
  );
};

export default EchonestLogo;