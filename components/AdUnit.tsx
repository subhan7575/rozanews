
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
      containerRef.current.innerHTML = '';
      const scriptContent = ad.code;
      
      // Regex to find script tags and their contents
      const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
      let match;
      
      // Create a div for non-script HTML
      const htmlContent = scriptContent.replace(scriptRegex, '');
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      containerRef.current.appendChild(div);

      // Execute scripts
      while ((match = scriptRegex.exec(scriptContent)) !== null) {
        const script = document.createElement('script');
        
        // Extract attributes from the matched script tag if any
        const tagMatch = match[0].match(/<script\b([^>]*)>/);
        if (tagMatch && tagMatch[1]) {
           const attrRegex = /(\w+)=["']?((?:.(?!["']?\s+(?:\w+)=|[>"']))+.)["']?/g;
           let attrMatch;
           while ((attrMatch = attrRegex.exec(tagMatch[1])) !== null) {
              script.setAttribute(attrMatch[1], attrMatch[2]);
           }
        }

        if (match[1].trim()) {
          script.text = match[1];
        }
        
        document.body.appendChild(script);
        // Clean up immediately after execution to prevent duplicates on re-render
        setTimeout(() => {
           if (document.body.contains(script)) document.body.removeChild(script);
        }, 100);
      }
    }
  }, [ad]);

  if (!ad) return null;

  if (ad.type === 'admob') {
    return (
      <div className={`w-full flex flex-col justify-center items-center my-6 ${className || ''}`}>
         <div 
           className="admob-banner-placeholder w-full h-[100px] bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 select-none"
           data-admob-app-id={ad.googleAppId}
           data-admob-unit-id={ad.googleAdUnitId}
         >
            <span className="font-bold text-xs uppercase tracking-widest text-purple-500">AdMob Banner</span>
            <span className="text-[10px] opacity-70">App ID: {ad.googleAppId?.substring(0,10)}...</span>
            <span className="text-[10px] opacity-70">Unit ID: {ad.googleAdUnitId?.substring(0,10)}...</span>
            <p className="text-[8px] mt-2 px-4 text-center">Note: AdMob requires a mobile wrapper (Capacitor/Cordova). For Web, use AdSense/Script type.</p>
         </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col justify-center items-center my-6 ${className || ''}`}>
      <div className="text-[10px] text-gray-400 text-center w-full mb-1 uppercase tracking-widest">Advertisement</div>
      
      {ad.type === 'image' ? (
        <div className="block">
          <img src={ad.code} alt={ad.name} className="max-w-full h-auto shadow-sm border border-gray-200 dark:border-gray-700 mx-auto rounded-lg" />
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="w-full overflow-hidden flex justify-center min-h-[100px] bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-white/5" 
        />
      )}
    </div>
  );
};

export default AdUnit;
