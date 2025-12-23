
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
  const scriptExecutedRef = useRef<string>('');

  useEffect(() => {
    const ads = StorageService.getAds();
    const found = ads.find(a => a.location === location && a.enabled);
    setAd(found);
  }, [location]);

  useEffect(() => {
    if (ad && ad.type === 'script' && containerRef.current) {
      // Prevent double execution of the same ad code
      if (scriptExecutedRef.current === ad.code) return;
      
      containerRef.current.innerHTML = '';
      const scriptContent = ad.code;
      
      // 1. Extract non-script HTML (like <ins> tags)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = scriptContent;
      const scripts = tempDiv.querySelectorAll('script');
      scripts.forEach(s => s.remove());
      containerRef.current.appendChild(tempDiv);

      // 2. Execute scripts found in the content
      const originalDiv = document.createElement('div');
      originalDiv.innerHTML = scriptContent;
      const scriptTags = originalDiv.querySelectorAll('script');

      scriptTags.forEach((oldScript) => {
        const newScript = document.createElement('script');
        
        // Copy attributes (src, async, etc.)
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });

        // Copy inline content
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }

        // For AdSense specifically, we often need to trigger the push
        if (newScript.innerHTML.includes('adsbygoogle') && !(window as any).adsbygoogle) {
            (window as any).adsbygoogle = [];
        }

        document.head.appendChild(newScript);
      });

      scriptExecutedRef.current = ad.code;
    }
  }, [ad]);

  if (!ad) return null;

  if (ad.type === 'admob') {
    return (
      <div className={`w-full flex flex-col justify-center items-center my-6 ${className || ''}`}>
         <div 
           className="admob-banner-placeholder w-full h-[100px] bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 select-none"
         >
            <span className="font-bold text-xs uppercase tracking-widest text-purple-500">AdMob Banner</span>
            <p className="text-[8px] mt-2 px-4 text-center text-gray-500">AdMob requires a mobile wrapper. Use "Script" type for AdSense.</p>
         </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col justify-center items-center my-6 ${className || ''}`}>
      <div className="text-[10px] text-gray-400 text-center w-full mb-1 uppercase tracking-widest opacity-50">Advertisement</div>
      
      {ad.type === 'image' ? (
        <div className="block">
          <img src={ad.code} alt={ad.name} className="max-w-full h-auto shadow-sm border border-gray-200 dark:border-gray-700 mx-auto rounded-lg" />
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="w-full overflow-hidden flex justify-center min-h-[100px]" 
        />
      )}
    </div>
  );
};

export default AdUnit;
