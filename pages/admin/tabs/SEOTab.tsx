
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { GlobalSEOConfig } from '../../../types';
import { Save, Globe, Search, Tag, ShieldCheck, Image as ImageIcon } from 'lucide-react';

const SEOTab: React.FC = () => {
  const [config, setConfig] = useState<GlobalSEOConfig>(StorageService.getSEOConfig());
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loaded = StorageService.getSEOConfig();
    setConfig(loaded);
    setTagsInput(loaded.globalKeywords.join(', '));
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    const updated: GlobalSEOConfig = {
      ...config,
      globalKeywords: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    };
    StorageService.saveSEOConfig(updated);
    setTimeout(() => {
        setIsSaving(false);
        alert("SEO Tags Saved Successfully!");
    }, 500);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
               <Search size={200} className="text-primary" />
            </div>

            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-primary rounded-2xl shadow-inner">
                     <Globe size={32} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black dark:text-white font-display">Global SEO Manager</h3>
                      <p className="text-gray-500 text-sm">Boost your Google ranking with high-traffic news tags.</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Site Official Name</label>
                        <input 
                           className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-bold"
                           value={config.siteName}
                           onChange={e => setConfig({...config, siteName: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Google Console ID</label>
                        <div className="relative">
                           <ShieldCheck className="absolute left-4 top-4 text-green-500" size={18}/>
                           <input 
                              className="w-full pl-12 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-mono text-xs"
                              placeholder="google-site-verification=..."
                              value={config.googleVerification || ''}
                              onChange={e => setConfig({...config, googleVerification: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">SEO Default Title (Google Result)</label>
                     <input 
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white"
                        value={config.defaultTitle}
                        onChange={e => setConfig({...config, defaultTitle: e.target.value})}
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Site Meta Description</label>
                     <textarea 
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white resize-none"
                        rows={3}
                        value={config.description}
                        onChange={e => setConfig({...config, description: e.target.value})}
                     />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                     <label className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-300 uppercase mb-3">
                        <Tag size={14}/> Ranking Keywords (Comma Separated)
                     </label>
                     <textarea 
                        className="w-full p-4 bg-white dark:bg-black/40 border border-blue-100 dark:border-blue-800 rounded-xl dark:text-white text-sm min-h-[100px]"
                        placeholder="breaking news, world news today, roza global, tech updates..."
                        value={tagsInput}
                        onChange={e => setTagsInput(e.target.value)}
                     />
                     <p className="mt-2 text-[10px] text-gray-500 font-bold italic">* Tip: Add high-volume news keywords related to your region to rank faster.</p>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Default OG Image URL</label>
                     <div className="flex gap-4 items-center">
                        <input 
                           className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white text-xs font-mono"
                           value={config.ogImage}
                           onChange={e => setConfig({...config, ogImage: e.target.value})}
                        />
                        <div className="w-16 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200">
                           <img src={config.ogImage} className="w-full h-full object-cover" alt="og" />
                        </div>
                     </div>
                  </div>

                  <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="w-full bg-primary hover:bg-rose-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                     {isSaving ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Save size={20} />}
                     {isSaving ? "Saving Config..." : "Update Global SEO Tags"}
                  </button>
               </div>
            </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900/50 p-6 rounded-2xl flex items-start gap-4 border border-gray-200 dark:border-gray-800">
           <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-blue-500">
              <Globe size={24} />
           </div>
           <div>
              <h4 className="font-bold dark:text-white text-sm">How this works?</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                 The tags you add here are added to the meta-data of every page on Roza News. When Google's crawlers visit your site, they index these keywords. Combining these with high-quality articles will push your site to the top of search results.
              </p>
           </div>
        </div>
    </div>
  );
};

export default SEOTab;