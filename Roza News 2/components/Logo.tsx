import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", withText = false }) => {
  return (
    <div className={`flex items-center ${withText ? 'gap-3' : ''}`}>
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Roza News Logo"
      >
        <defs>
          <radialGradient id="globeGrad" cx="50" cy="50" r="45" gradientUnits="userSpaceOnUse">
            <stop offset="0.2" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1E3A8A" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbit Ring */}
        <circle cx="50" cy="50" r="42" stroke="#1E3A8A" strokeWidth="3" fill="none" />
        
        {/* Connection Nodes (Satellites) */}
        <circle cx="50" cy="8" r="4" fill="#0EA5E9" />
        <circle cx="92" cy="50" r="4" fill="#0EA5E9" />
        <circle cx="50" cy="92" r="4" fill="#0EA5E9" />
        <circle cx="8" cy="50" r="4" fill="#0EA5E9" />
        
        {/* Connecting Lines to Globe */}
        <line x1="50" y1="8" x2="50" y2="20" stroke="#0EA5E9" strokeWidth="2" />
        <line x1="92" y1="50" x2="80" y2="50" stroke="#0EA5E9" strokeWidth="2" />
        <line x1="50" y1="92" x2="50" y2="80" stroke="#0EA5E9" strokeWidth="2" />
        <line x1="8" y1="50" x2="20" y2="50" stroke="#0EA5E9" strokeWidth="2" />

        {/* Diagonal Nodes */}
        <circle cx="21" cy="21" r="3" fill="#1E3A8A" />
        <circle cx="79" cy="21" r="3" fill="#1E3A8A" />
        <circle cx="79" cy="79" r="3" fill="#1E3A8A" />
        <circle cx="21" cy="79" r="3" fill="#1E3A8A" />

        {/* Globe Base */}
        <circle cx="50" cy="50" r="30" fill="url(#globeGrad)" />
        
        {/* Continents (Stylized) */}
        <path d="M35 45 Q 40 35 50 40 T 65 35 V 50 Q 55 60 45 55 T 35 45 Z" fill="white" opacity="0.9" />
        <path d="M40 60 Q 50 55 60 60 T 65 70 Q 55 75 45 70 T 40 60 Z" fill="white" opacity="0.8" />
        
        {/* Gloss/Shine */}
        <ellipse cx="40" cy="35" rx="10" ry="5" fill="white" opacity="0.3" transform="rotate(-45 40 35)" />
      </svg>
      
      {withText && (
        <div className="flex flex-col leading-none">
          <span className="font-serif font-black text-2xl tracking-tighter text-gray-900 dark:text-white">ROZA</span>
          <span className="font-sans font-bold text-sm tracking-widest text-primary">NEWS</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
