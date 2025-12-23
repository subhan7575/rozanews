
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { GithubConfig, CloudinaryConfig } from '../../../types';
import { Cloud, Loader2, Image as ImageIcon, Database, ShieldCheck, RefreshCw, CheckCircle, Info, Zap, Globe, Server } from 'lucide-react';
import { HF_USERNAME, HF_DATASET } from '../../../constants';

const SyncTab: React.FC = () => {
  const [githubConfig, setGithubConfig] = useState<GithubConfig>({ token: '', owner: '', repo: '', branch: 'main' });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncInfo, setLastSyncInfo] = useState<{ success: boolean; time: string } | null>(null);

  useEffect(() => {
    setGithubConfig(StorageService.getGithubConfig());

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
        StorageService.saveGithubConfig(githubConfig);
        alert("GitHub Terminal Connected! Auto-sync is now ACTIVE.");
    } catch (e: any) {
        alert("Setup failed: " + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  const isConnected = !!(githubConfig.token && githubConfig.owner && githubConfig.repo);

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
        {/* HUGGING FACE STATUS */}
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
               <Server size={200} />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                     <Cloud size={32} className="text-blue-300" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black font-display tracking-tight">Hugging Face Cloud</h3>
                     <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">Active Media & Data Host</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                     <p className="text-[10px] uppercase font-black opacity-50 mb-1">Dataset ID</p>
                     <p className="font-mono text-sm">{HF_USERNAME}/{HF_DATASET}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                     <p className="text-[10px] uppercase font-black opacity-50 mb-1">Status</p>
                     <p className="text-sm font-bold text-emerald-400 flex items-center gap-2"><CheckCircle size={14}/> Integrated & Encrypted</p>
                  </div>
               </div>

               <p className="text-xs text-blue-100/70 leading-relaxed italic">
                  Hugging Face is serving as your primary media server and database. Every image, video, and article edit is automatically synced to the Cloud Dataset.
               </p>
            </div>
        </div>

        {/* GITHUB CONNECT */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden relative">
            <div className="relative z-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl shadow-inner transition-colors duration-500 ${isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        <Zap size={40} className={isConnected ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black dark:text-white font-display tracking-tight">GitHub Backup Connect</h3>
                        <p className="text-gray-500 text-sm font-medium">
                           {isConnected ? "Auto-syncing data.ts to your repo." : "Enable secondary backup layer."}
                        </p>
                    </div>
                  </div>
                  
                  {lastSyncInfo && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-3 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
                         <RefreshCw size={16} className={`text-blue-500 ${isSaving ? 'animate-spin' : ''}`} />
                         <div>
                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Global Sync Status</p>
                            <p className="text-sm font-bold dark:text-blue-300">{lastSyncInfo.time}</p>
                         </div>
                      </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Personal Access Token</label>
                        <input type="password" className="w-full p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-mono text-sm focus:ring-4 focus:ring-primary/20 outline-none transition-all" value={githubConfig.token} onChange={(e) => setGithubConfig({...githubConfig, token: e.target.value})} placeholder="ghp_..." />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">GitHub Owner</label>
                        <input className="w-full p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-bold" value={githubConfig.owner} onChange={(e) => setGithubConfig({...githubConfig, owner: e.target.value})} placeholder="YourUsername" />
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Repository Name</label>
                        <input className="w-full p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-bold" value={githubConfig.repo} onChange={(e) => setGithubConfig({...githubConfig, repo: e.target.value})} placeholder="ronanews" />
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                        <ShieldCheck className="text-primary shrink-0" size={24} />
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                           All your articles and settings are backed up to your GitHub repository in the background.
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
                     <><Database size={24} className="mr-3 group-hover:rotate-12 transition-transform"/> {isConnected ? "Update & Force Sync" : "Connect GitHub Backup"}</>
                  )}
               </button>
            </div>
        </div>
    </div>
  );
};

export default SyncTab;
