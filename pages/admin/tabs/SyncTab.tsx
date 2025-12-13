
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { GithubService } from '../../../services/githubService';
import { GithubConfig, CloudinaryConfig } from '../../../types';
import { Cloud, GitBranch, Loader2, Image as ImageIcon } from 'lucide-react';

const SyncTab: React.FC = () => {
  const [githubConfig, setGithubConfig] = useState<GithubConfig>({ token: '', owner: '', repo: '', branch: 'main' });
  const [cloudinaryConfig, setCloudinaryConfig] = useState<CloudinaryConfig>({ cloudName: '', uploadPreset: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setGithubConfig(StorageService.getGithubConfig());
    setCloudinaryConfig(StorageService.getCloudinaryConfig());
    setApiKey(StorageService.getApiKey());
  }, []);

  const handleGithubSync = async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) return alert("Please enter all GitHub credentials.");
    StorageService.saveGithubConfig(githubConfig);
    setIsSyncing(true);
    setSyncStatus("Pushing...");
    try {
      const content = GithubService.generateFileContent(
          apiKey, 
          StorageService.getArticles(), 
          StorageService.getVideos(), 
          StorageService.getAds(), 
          StorageService.getFiles(), 
          StorageService.getAllUsers(), 
          StorageService.getMessages(), 
          StorageService.getTickerConfig(), 
          githubConfig, 
          StorageService.getJobApplications()
      );
      const result = await GithubService.pushToGithub(githubConfig, content);
      setSyncStatus(result.message);
      alert(result.message);
    } catch (e) { alert("Sync Error"); } 
    finally { setIsSyncing(false); }
  };

  const saveCloudinary = () => {
    StorageService.saveCloudinaryConfig(cloudinaryConfig);
    alert('Cloudinary Config Saved!');
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full"><Cloud size={32} /></div>
                <div>
                    <h3 className="text-xl font-bold dark:text-white">GitHub Cloud Sync</h3>
                    <p className="text-gray-500 text-sm">Push local content to your GitHub repository.</p>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Personal Access Token (PAT)</label>
                    <input type="password" className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono text-sm" value={githubConfig.token} onChange={(e) => setGithubConfig({...githubConfig, token: e.target.value})} placeholder="ghp_..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">GitHub Username</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={githubConfig.owner} onChange={(e) => setGithubConfig({...githubConfig, owner: e.target.value})} placeholder="username" />
                    </div>
                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Repository Name</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={githubConfig.repo} onChange={(e) => setGithubConfig({...githubConfig, repo: e.target.value})} placeholder="repo-name" />
                    </div>
                </div>
            </div>

            <button onClick={handleGithubSync} disabled={isSyncing} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity">
                {isSyncing ? <span className="flex items-center"><Loader2 size={20} className="animate-spin mr-2"/> Syncing to Cloud...</span> : <span className="flex items-center"><GitBranch size={20} className="mr-2"/> Commit & Push Changes</span>}
            </button>
            {syncStatus && <p className="text-center mt-4 text-sm font-bold text-blue-500">{syncStatus}</p>}
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full"><ImageIcon size={32} /></div>
                <div>
                    <h3 className="text-xl font-bold dark:text-white">Media Storage (Cloudinary)</h3>
                    <p className="text-gray-500 text-sm">Required for uploading videos and images.</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cloud Name</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={cloudinaryConfig.cloudName} onChange={(e) => setCloudinaryConfig({...cloudinaryConfig, cloudName: e.target.value})} placeholder="e.g. demo" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Upload Preset (Unsigned)</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={cloudinaryConfig.uploadPreset} onChange={(e) => setCloudinaryConfig({...cloudinaryConfig, uploadPreset: e.target.value})} placeholder="e.g. ml_default" />
                </div>
            </div>
            <button onClick={saveCloudinary} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors">
                Save Media Config
            </button>
        </div>
    </div>
  );
};

export default SyncTab;
