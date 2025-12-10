import React, { useEffect, useRef, useState } from 'react';
import { AdConfig } from '../types';
import { StorageService } from '../services/storageService';

interface AdUnitProps {
  location: AdConfig['location'];
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ location, className }) => {
  const [ad, setAd] = useState<AdConfig | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ads = StorageService.getAds();
    const found = ads.find(a => a.location === location && a.enabled);
    setAd(found);
  }, [location]);

  useEffect(() => {
    if (ad && ad.type === 'script' && containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';

      // Create a temporary container to parse the HTML string
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = ad.code;

      // Move elements to the real container and execute scripts
      Array.from(tempDiv.childNodes).forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const oldScript = node as HTMLScriptElement;
          const newScript = document.createElement('script');
          
          // Copy attributes (src, async, etc.)
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });

          // Copy content
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          
          containerRef.current?.appendChild(newScript);
        } else {
          containerRef.current?.appendChild(node.cloneNode(true));
        }
      });
    }
  }, [ad]);

  if (!ad) return null;

  return (
    <div className={`w-full flex flex-col justify-center items-center my-6 ${className || ''}`}>
      <div className="text-[10px] text-gray-400 text-center w-full mb-1 uppercase tracking-widest">Advertisement</div>
      
      {ad.type === 'image' ? (
        <a href="#" className="block">
          <img src={ad.code} alt={ad.name} className="max-w-full h-auto shadow-sm border border-gray-200 dark:border-gray-700 mx-auto" />
        </a>
      ) : (
        <div 
          ref={containerRef}
          className="w-full overflow-hidden flex justify-center min-h-[100px] bg-gray-50 dark:bg-gray-800/50" 
        />
      )}
    </div>
  );
};

export default AdUnit;