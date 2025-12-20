
import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../../../services/storageService';
import { MediaService } from '../../../services/firebase';
import { AdConfig } from '../../../types';
import { Save, ToggleLeft, ToggleRight, Upload, Loader2 } from 'lucide-react';

const AdsTab: React.FC = () => {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeAdId, setActiveAdId] = useState<string | null>(null);

  useEffect(() => {
    setAds(StorageService.getAds());
  }, []);

  const handleAdChange = (id: string, field: keyof AdConfig, value: any) => {
    setAds(ads.map(ad => ad.id === id ? { ...ad, [field]: value } : ad));
  };

  const saveAdsConfig = () => {
    setIsSaving(true);
    StorageService.saveAds(ads);
    setTimeout(() => setIsSaving(false), 500);
  };

  const triggerUpload = (id: string) => {
    setActiveAdId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeAdId) return;
    setIsUploading(true);
    try {
        const url = await MediaService.uploadFile(file, 'images');
        handleAdChange(activeAdId, 'code', url);
    } catch(e) { alert("Upload failed"); }
    finally { setIsUploading(false); if(fileInputRef.current) fileInputRef.current.value = ''; }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
        {isUploading && (
            <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 size={48} className="animate-spin mb-4 text-primary"/>
                <h3 className="text-xl font-bold">Uploading Ad Image...</h3>
            </div>
        )}

        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div>
                <h3 className="text-xl font-bold dark:text-white">Ad Units Configuration</h3>
                <p className="text-gray-500 text-sm mt-1">Manage banner placements and scripts.</p>
            </div>
            <button onClick={saveAdsConfig} className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center">
                <Save size={18} className="mr-2"/> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {ads.map(ad => (
                <div key={ad.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg dark:text-white">{ad.name}</h4>
                        <button onClick={() => handleAdChange(ad.id, 'enabled', !ad.enabled)} className={`p-2 rounded-full transition-colors ${ad.enabled ? 'text-green-500 bg-green-100 dark:bg-green-900/20' : 'text-gray-400 bg-gray-100 dark:bg-gray-700'}`}>
                            {ad.enabled ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                        </button>
                    </div>
                    <p className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-black/30 p-2 rounded">ID: {ad.location}</p>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ad Type</label>
                        <select className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white text-sm" value={ad.type} onChange={(e) => handleAdChange(ad.id, 'type', e.target.value)}>
                            <option value="image">Custom Image Banner</option>
                            <option value="script">HTML/JS Script (AdSense)</option>
                            <option value="admob">Google AdMob (App Only)</option>
                        </select>
                    </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-4">
                    {ad.type === 'image' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image URL</label>
                                <div className="flex gap-2">
                                <input className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-sm font-mono" value={ad.code} onChange={(e) => handleAdChange(ad.id, 'code', e.target.value)} />
                                <button onClick={() => triggerUpload(ad.id)} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"><Upload size={18}/></button>
                                </div>
                            </div>
                            <div className="h-32 bg-gray-100 dark:bg-black/20 rounded-lg flex items-center justify-center overflow-hidden border border-dashed border-gray-300 dark:border-gray-700">
                                {ad.code ? <img src={ad.code} className="h-full object-contain" alt="Preview"/> : <span className="text-gray-400 text-xs">No Image</span>}
                            </div>
                        </>
                    )}
                    {ad.type === 'script' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Script Code</label>
                            <textarea className="w-full p-3 bg-gray-900 text-green-400 font-mono text-xs rounded-xl border border-gray-700 min-h-[150px]" value={ad.code} onChange={(e) => handleAdChange(ad.id, 'code', e.target.value)} placeholder="<script>...</script>" />
                        </div>
                    )}
                    {ad.type === 'admob' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">AdMob App ID</label>
                                <input className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-sm font-mono" value={ad.googleAppId || ''} onChange={(e) => handleAdChange(ad.id, 'googleAppId', e.target.value)} placeholder="ca-app-pub-..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ad Unit ID</label>
                                <input className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-sm font-mono" value={ad.googleAdUnitId || ''} onChange={(e) => handleAdChange(ad.id, 'googleAdUnitId', e.target.value)} placeholder="ca-app-pub-..." />
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default AdsTab;
