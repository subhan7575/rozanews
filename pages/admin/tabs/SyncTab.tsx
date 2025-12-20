
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { GithubService } from '../../../services/githubService';
import { GithubConfig, CloudinaryConfig } from '../../../types';
import { Cloud, GitBranch, Loader2, Image as ImageIcon, Database, ShieldCheck } from 'lucide-react';

const SyncTab: React.FC = () => {
  const [githubConfig, setGithubConfig] = useState<GithubConfig>({ token: '', owner: '', repo: '', branch: 'main' });
  const [cloudinaryConfig, setCloudinaryConfig] = useState<CloudinaryConfig>({ cloudName: '', uploadPreset: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    setGithubConfig(StorageService.getGithubConfig());
    setCloudinaryConfig(StorageService.getCloudinaryConfig());
  }, []);

  const handleCloudBackup = async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
       alert("Please configure your GitHub credentials first.");
       return;
    }
    
    StorageService.saveGithubConfig(githubConfig);
    setIsSyncing(true);
    setSyncStatus("Preparing Data Backup...");

    try {
      const content = GithubService.generateFileContent(
          StorageService.getApiKey(),
          StorageService.getArticles(),
          StorageService.getVideos(),
          StorageService.getAds(),
          StorageService.getFiles(),
          StorageService.getAllUsers(),
          StorageService.getMessages(),
          StorageService.getTickerConfig(),
          githubConfig,
          StorageService.getJobApplications(),
          StorageService.getJobs()
      );

      const result = await GithubService.pushToGithub(githubConfig, content);
      setSyncStatus(result.message);
      if (result.success) {
         alert("Backup Complete! Your 'All Data' file has been updated on GitHub.");
      }
    } catch (e) {
      setSyncStatus("Backup failed. Check connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const saveCloudinary = () => {
    StorageService.saveCloudinaryConfig(cloudinaryConfig);
    alert('Media Storage Config Saved!');
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
        {/* DATA REPOSITORY SECTION */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-blue-100 dark:border-blue-900/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
               <Database size={160} className="text-blue-500" />
            </div>
            
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-inner"><Database size={32} /></div>
                  <div>
                      <h3 className="text-2xl font-black dark:text-white font-display">Global Data Repository</h3>
                      <p className="text-gray-500 text-sm">Sync all your articles, users, and settings to GitHub (constants.ts).</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">GitHub Access Token</label>
                        <input type="password" className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-mono text-sm" value={githubConfig.token} onChange={(e) => setGithubConfig({...githubConfig, token: e.target.value})} placeholder="ghp_..." />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Username</label>
                        <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white" value={githubConfig.owner} onChange={(e) => setGithubConfig({...githubConfig, owner: e.target.value})} placeholder="RozaNewsOfficial" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Repository Name</label>
                        <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white" value={githubConfig.repo} onChange={(e) => setGithubConfig({...githubConfig, repo: e.target.value})} placeholder="roza-news-web" />
                     </div>
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
                        <ShieldCheck className="text-blue-500 shrink-0" size={20} />
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                           <strong>Secure Backup:</strong> This updates your remote code. When you update the website by replacing files, this data will be automatically restored.
                        </p>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleCloudBackup} 
                  disabled={isSyncing} 
                  className="w-full bg-primary hover:bg-rose-700 text-white font-black py-5 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-primary/20 active:scale-95"
               >
                  {isSyncing ? (
                     <><Loader2 size={24} className="animate-spin mr-3"/> Syncing All Data...</>
                  ) : (
                     <><Cloud size={24} className="mr-3"/> Backup All Data to GitHub</>
                  )}
               </button>
               {syncStatus && <p className="text-center mt-4 text-sm font-bold text-blue-500 animate-pulse">{syncStatus}</p>}
            </div>
        </div>

        {/* MEDIA STORAGE */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl shadow-inner"><ImageIcon size={32} /></div>
                <div>
                    <h3 className="text-xl font-bold dark:text-white">Media Assets (Cloudinary)</h3>
                    <p className="text-gray-500 text-sm">Store high-resolution images and videos permanently.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Cloud Name</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white" value={cloudinaryConfig.cloudName} onChange={(e) => setCloudinaryConfig({...cloudinaryConfig, cloudName: e.target.value})} placeholder="Your Cloudinary Name" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Upload Preset (Unsigned)</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white" value={cloudinaryConfig.uploadPreset} onChange={(e) => setCloudinaryConfig({...cloudinaryConfig, uploadPreset: e.target.value})} placeholder="e.g. roza_preset" />
                </div>
            </div>
            <button onClick={saveCloudinary} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg">
                Save Media Configuration
            </button>
        </div>
    </div>
  );
};

export default SyncTab;
