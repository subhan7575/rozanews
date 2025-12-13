import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

const Image: React.FC<ImageProps> = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 ${className}`}>
      {/* Placeholder / Blur Effect */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
      >
         {hasError ? (
            <ImageIcon className="text-gray-400 w-1/3 h-1/3" />
         ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
         )}
      </div>

      <img 
        src={hasError ? "https://placehold.co/600x400?text=Image+Unavailable" : src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default Image;
