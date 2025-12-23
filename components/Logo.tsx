import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
  lightText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", withText = false, lightText = false }) => {
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
          <radialGradient id="globeGrad" cx="50" cy="50" r="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1E3A8A" />
          </radialGradient>
        </defs>

        {/* Outer Tech Ring (Dashed) */}
        <circle cx="50" cy="50" r="44" stroke="#1E40AF" strokeWidth="2" strokeDasharray="8 6" opacity="0.8" />
        
        {/* Inner Guide Ring */}
        <circle cx="50" cy="50" r="38" stroke="#3B82F6" strokeWidth="0.5" opacity="0.4" />

        {/* Satellites / Nodes (Cardinal Points) */}
        <circle cx="50" cy="6" r="4" fill="#0EA5E9" />
        <circle cx="94" cy="50" r="4" fill="#0EA5E9" />
        <circle cx="50" cy="94" r="4" fill="#0EA5E9" />
        <circle cx="6" cy="50" r="4" fill="#0EA5E9" />
        
        {/* Diagonal Small Nodes */}
        <circle cx="19" cy="19" r="2" fill="#1E3A8A" />
        <circle cx="81" cy="81" r="2" fill="#1E3A8A" />
        <circle cx="81" cy="19" r="2" fill="#1E3A8A" />
        <circle cx="19" cy="81" r="2" fill="#1E3A8A" />

        {/* Globe Body */}
        <circle cx="50" cy="50" r="32" fill="url(#globeGrad)" />
        
        {/* Globe Grid Lines (Lat/Lon) - 3D Effect */}
        <path d="M50 18 C 65 18 78 32 78 50 C 78 68 65 82 50 82" stroke="white" strokeWidth="0.8" opacity="0.3" fill="none"/>
        <path d="M50 18 C 35 18 22 32 22 50 C 22 68 35 82 50 82" stroke="white" strokeWidth="0.8" opacity="0.3" fill="none"/>
        <path d="M50 18 V 82" stroke="white" strokeWidth="0.8" opacity="0.3" />
        <path d="M20 50 H 80" stroke="white" strokeWidth="0.8" opacity="0.3" />
        <path d="M26 35 Q 50 45 74 35" stroke="white" strokeWidth="0.5" opacity="0.3" fill="none" />
        <path d="M26 65 Q 50 55 74 65" stroke="white" strokeWidth="0.5" opacity="0.3" fill="none" />

        {/* Connectors (Ring to Globe) */}
        <line x1="50" y1="6" x2="50" y2="18" stroke="#0EA5E9" strokeWidth="2" />
        <line x1="94" y1="50" x2="82" y2="50" stroke="#0EA5E9" strokeWidth="2" />
        <line x1="50" y1="94" x2="50" y2="82" stroke="#0EA5E9" strokeWidth="2" />
        <line x1="6" y1="50" x2="18" y2="50" stroke="#0EA5E9" strokeWidth="2" />

        {/* Shine Highlight (Gloss) */}
        <ellipse cx="35" cy="35" rx="8" ry="4" fill="white" opacity="0.4" transform="rotate(-45 35 35)" />
      </svg>
      
      {withText && (
        <div className="flex flex-col justify-center">
          <span className={`font-serif font-black text-2xl tracking-tighter ${lightText ? 'text-white' : 'text-gray-900 dark:text-white'} leading-none`}>ROZA</span>
          <span className="font-sans font-bold text-xs tracking-[0.25em] text-primary leading-none ml-0.5 mt-0.5">NEWS</span>
        </div>
      )}
    </div>
  );
};

export default Logo;