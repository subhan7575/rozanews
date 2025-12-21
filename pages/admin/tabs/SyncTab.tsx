
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { GithubConfig, CloudinaryConfig } from '../../../types';
import { Cloud, Loader2, Image as ImageIcon, Database, ShieldCheck, RefreshCw, CheckCircle, Info, Zap, Globe } from 'lucide-react';

const SyncTab: React.FC = () => {
  const [githubConfig, setGithubConfig] = useState<GithubConfig>({ token: '', owner: '', repo: '', branch: 'main' });
  const [cloudinaryConfig, setCloudinaryConfig] = useState<CloudinaryConfig>({ cloudName: '', uploadPreset: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncInfo, setLastSyncInfo] = useState<{ success: boolean; time: string } | null>(null);

  useEffect(() => {
    setGithubConfig(StorageService.getGithubConfig());
    setCloudinaryConfig(StorageService.getCloudinaryConfig());

    const handleSyncUpdate = (e: any) => {
        setLastSyncInfo(e.detail);
    };
    window.addEventListener('roza_sync_status', handleSyncUpdate);
    return () => window.removeEventListener('roza_sync_status', handleSyncUpdate);
  }, []);

  const handleSaveGithub = async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
       alert("Please enter all GitHub details.");
       return;
    }
    
    setIsSaving(true);
    try {
        // Save locally - this will trigger the first background sync automatically in the storage service
        StorageService.saveGithubConfig(githubConfig);
        alert("GitHub Terminal Connected! Auto-sync is now ACTIVE. Every time you save an article, video, or ad, it will be uploaded to GitHub automatically.");
    } catch (e: any) {
        alert("Setup failed: " + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  const saveCloudinary = () => {
    StorageService.saveCloudinaryConfig(cloudinaryConfig);
    alert('Media Cloud Config Saved!');
  };

  const isConnected = !!(githubConfig.token && githubConfig.owner && githubConfig.repo);

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border-2 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
               <Globe size={250} className="text-primary" />
            </div>
            
            <div className="relative z-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl shadow-inner transition-colors duration-500 ${isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        <Zap size={40} className={isConnected ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black dark:text-white font-display tracking-tight">GitHub Live Connect</h3>
                        <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                           {isConnected ? (
                               <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={14}/> Connected & Auto-Syncing</span>
                           ) : (
                               "Connect once to enable background data persistence."
                           )}
                        </p>
                    </div>
                  </div>
                  
                  {lastSyncInfo && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-3 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
                         <RefreshCw size={16} className="text-blue-500 animate-spin" />
                         <div>
                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Last Background Sync</p>
                            <p className="text-sm font-bold dark:text-blue-300">{lastSyncInfo.time}</p>
                         </div>
                      </div>
                  )}
               </div>

               <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/50 flex items-start gap-4 mb-10">
                   <Info className="text-amber-500 shrink-0 mt-1" size={24} />
                   <div className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                       <strong>Background Sync Active:</strong> Once you save these credentials, you never have to manually backup again. 
                       The system will watch for changes in <strong>Articles, Videos, and Ads</strong> and silently update your GitHub `constants.ts` file in the background.
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Personal Access Token</label>
                        <input type="password" className="w-full p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-mono text-sm focus:ring-4 focus:ring-primary/20 outline-none transition-all" value={githubConfig.token} onChange={(e) => setGithubConfig({...githubConfig, token: e.target.value})} placeholder="ghp_..." />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">GitHub Owner (Username)</label>
                        <input className="w-full p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-bold focus:ring-4 focus:ring-primary/20 outline-none transition-all" value={githubConfig.owner} onChange={(e) => setGithubConfig({...githubConfig, owner: e.target.value})} placeholder="YourUsername" />
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Repository Name</label>
                        <input className="w-full p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-bold focus:ring-4 focus:ring-primary/20 outline-none transition-all" value={githubConfig.repo} onChange={(e) => setGithubConfig({...githubConfig, repo: e.target.value})} placeholder="roza-news-web" />
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                        <ShieldCheck className="text-primary shrink-0" size={24} />
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                           All data is saved into a single file: <code className="bg-white dark:bg-black px-1 rounded text-primary">constants.ts</code>. This makes it easy for you to re-deploy your site anywhere without losing articles.
                        </p>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleSaveGithub} 
                  disabled={isSaving} 
                  className={`w-full font-black py-6 rounded-2xl flex items-center justify-center transition-all shadow-2xl active:scale-95 text-xl group ${isConnected ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-primary hover:bg-rose-700 text-white shadow-primary/30'}`}
               >
                  {isSaving ? (
                     <><Loader2 size={24} className="animate-spin mr-3"/> Authenticating...</>
                  ) : (
                     <><Database size={24} className="mr-3 group-hover:rotate-12 transition-transform"/> {isConnected ? "Update Connection & Sync" : "Connect & Activate Auto-Sync"}</>
                  )}
               </button>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl"><ImageIcon size={32} /></div>
                <div>
                    <h3 className="text-2xl font-bold dark:text-white">Media Engine (Cloudinary)</h3>
                    <p className="text-gray-500 text-sm">Persistent storage for images and videos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cloud Name</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-bold" value={cloudinaryConfig.cloudName} onChange={(e) => setCloudinaryConfig({...cloudinaryConfig, cloudName: e.target.value})} placeholder="demo" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Upload Preset</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-bold" value={cloudinaryConfig.uploadPreset} onChange={(e) => setCloudinaryConfig({...cloudinaryConfig, uploadPreset: e.target.value})} placeholder="roza_preset" />
                </div>
            </div>
            <button onClick={saveCloudinary} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg active:scale-95">
                Save Media Configuration
            </button>
        </div>
    </div>
  );
};

export default SyncTab;
