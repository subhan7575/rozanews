import React, { useEffect, useState } from 'react';
import { AdConfig } from '../types';
import { StorageService } from '../services/storageService';

interface AdUnitProps {
  location: AdConfig['location'];
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ location, className }) => {
  const [ad, setAd] = useState<AdConfig | undefined>(undefined);

  useEffect(() => {
    const ads = StorageService.getAds();
    const found = ads.find(a => a.location === location && a.enabled);
    setAd(found);
  }, [location]);

  if (!ad) return null;

  return (
    <div className={`w-full flex justify-center items-center my-4 ${className || ''}`}>
      <div className="text-xs text-gray-400 text-center w-full mb-1 uppercase tracking-widest">Advertisement</div>
      {ad.type === 'image' ? (
        <img src={ad.code} alt={ad.name} className="max-w-full h-auto shadow-sm border border-gray-200 dark:border-gray-700" />
      ) : (
        <div 
          className="w-full overflow-hidden" 
          dangerouslySetInnerHTML={{ __html: ad.code }} 
        />
      )}
    </div>
  );
};

export default AdUnit;