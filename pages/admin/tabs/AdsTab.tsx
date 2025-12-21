
import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../../../services/storageService';
import { MediaService } from '../../../services/firebase';
import { AdConfig, GlobalSEOConfig } from '../../../types';
import { Save, ToggleLeft, ToggleRight, Upload, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';

const AdsTab: React.FC = () => {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [seoConfig, setSeoConfig] = useState<GlobalSEOConfig>(StorageService.getSEOConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeAdId, setActiveAdId] = useState<string | null>(null);

  useEffect(() => {
    setAds(StorageService.getAds());
    setSeoConfig(StorageService.getSEOConfig());
  }, []);

  const handleAdChange = (id: string, field: keyof AdConfig, value: any) => {
    setAds(ads.map(ad => ad.id === id ? { ...ad, [field]: value } : ad));
  };

  const saveAdsConfig = () => {
    setIsSaving(true);
    // 1. Save standard units
    StorageService.saveAds(ads);
    // 2. Save global AdSense script to SEO config
    StorageService.saveSEOConfig(seoConfig);
    
    setTimeout(() => {
        setIsSaving(false);
        alert("Ads Configuration Saved Successfully! Sync to GitHub to backup permanently.");
    }, 500);
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

        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div>
                <h3 className="text-xl font-bold dark:text-white">Ad Units & Monetization</h3>
                <p className="text-gray-500 text-sm mt-1">Manage banner placements and Google AdSense global scripts.</p>
            </div>
            <button onClick={saveAdsConfig} className="mt-4 md:mt-0 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center shadow-lg active:scale-95">
                <Save size={18} className="mr-2"/> {isSaving ? 'Saving...' : 'Save All Ads Config'}
            </button>
        </div>

        {/* GOOGLE ADSENSE GLOBAL SECTION */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-8 rounded-[2rem] border border-yellow-100 dark:border-yellow-900/40 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <ShieldCheck size={120} className="text-orange-600" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-orange-500">
                        <ExternalLink size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black dark:text-white font-display">Google AdSense Global Script</h4>
                        <p className="text-xs text-gray-500 font-medium">This code will be injected into the &lt;head&gt; of every page.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your AdSense Code Block</label>
                    <textarea 
                        className="w-full p-4 bg-white dark:bg-black/40 border border-yellow-200 dark:border-yellow-900/50 rounded-2xl dark:text-green-400 font-mono text-xs outline-none focus:ring-2 focus:ring-orange-500 transition-all min-h-[120px]"
                        placeholder='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..." crossorigin="anonymous"></script>'
                        value={seoConfig.adsenseCode || ''}
                        onChange={(e) => setSeoConfig({...seoConfig, adsenseCode: e.target.value})}
                    />
                    <div className="flex items-start gap-2 bg-white/50 dark:bg-black/20 p-3 rounded-xl">
                        <span className="text-orange-500 font-bold text-xs">Note:</span>
                        <p className="text-[10px] text-gray-500 leading-relaxed italic">
                            Paste the entire script block provided by Google. This is required for site verification and auto-ads. It will be saved to your GitHub constants during next sync.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* STANDARD AD UNITS */}
        <div className="grid grid-cols-1 gap-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Placement Specific Units</h3>
            {ads.map(ad => (
                <div key={ad.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                    <div className="w-full md:w-1/3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg dark:text-white">{ad.name}</h4>
                        <button onClick={() => handleAdChange(ad.id, 'enabled', !ad.enabled)} className={`p-2 rounded-full transition-colors ${ad.enabled ? 'text-green-500 bg-green-100 dark:bg-green-900/20' : 'text-gray-400 bg-gray-100 dark:bg-gray-700'}`}>
                            {ad.enabled ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                        </button>
                    </div>
                    <p className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-black/30 p-2 rounded">Placement: {ad.location}</p>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ad Type</label>
                        <select className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white text-sm font-bold" value={ad.type} onChange={(e) => handleAdChange(ad.id, 'type', e.target.value)}>
                            <option value="image">Custom Image Banner</option>
                            <option value="script">HTML/JS Script (AdSense Unit)</option>
                            <option value="admob">Google AdMob (App Only)</option>
                        </select>
                    </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-4">
                    {ad.type === 'image' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Banner Image URL</label>
                                <div className="flex gap-2">
                                <input className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-sm font-mono" value={ad.code} onChange={(e) => handleAdChange(ad.id, 'code', e.target.value)} />
                                <button onClick={() => triggerUpload(ad.id)} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Upload size={18}/></button>
                                </div>
                            </div>
                            <div className="h-32 bg-gray-100 dark:bg-black/20 rounded-xl flex items-center justify-center overflow-hidden border border-dashed border-gray-300 dark:border-gray-700">
                                {ad.code ? <img src={ad.code} className="h-full object-contain" alt="Preview"/> : <span className="text-gray-400 text-xs">No Image Selected</span>}
                            </div>
                        </>
                    )}
                    {ad.type === 'script' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Unit Script Code</label>
                            <textarea className="w-full p-3 bg-gray-900 text-green-400 font-mono text-xs rounded-xl border border-gray-700 min-h-[150px] outline-none focus:ring-1 focus:ring-primary" value={ad.code} onChange={(e) => handleAdChange(ad.id, 'code', e.target.value)} placeholder='<ins class="adsbygoogle" ...></ins>' />
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
