import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { GithubService } from '../../services/githubService';
import { 
  Trash2, Edit, Plus, Save, Bot, LogOut, Layout, 
  DollarSign, Code, FileCode, CheckCircle, 
  RefreshCw, ArrowLeft, Terminal, Menu,
  Image as ImageIcon, Video, Upload, X, Zap, Search, AlertTriangle, Key, Film, Download, Cloud, Link as LinkIcon
} from 'lucide-react';
import { CATEGORIES } from '../../constants';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'articles' | 'ads' | 'article_editor' | 'code_editor' | 'api' | 'videos' | 'sync'>('articles');
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle
  
  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [videos, setVideos] = useState<VideoPost[]>([]);
  
  // Article Editor State
  const [editingArticle, setEditingArticle] = useState<Partial<Article>>({});
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Video Editor State
  const [editingVideo, setEditingVideo] = useState<Partial<VideoPost>>({});
  const [videoTagsInput, setVideoTagsInput] = useState('');

  // Ads State
  const [isSavingAds, setIsSavingAds] = useState(false);

  // Code Editor State
  const [currentFile, setCurrentFile] = useState<VirtualFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [codePrompt, setCodePrompt] = useState('');
  const [isCodeGenerating, setIsCodeGenerating] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState('');

  // GitHub Sync State
  const [githubConfig, setGithubConfig] = useState<GithubConfig>({ token: '', owner: '', repo: '', branch: 'main' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    if (!StorageService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    refreshData();
    setApiKey(StorageService.getApiKey());
    setGithubConfig(StorageService.getGithubConfig());
  }, [navigate]);

  const refreshData = () => {
    setArticles([...StorageService.getArticles()]);
    setAds([...StorageService.getAds()]);
    setFiles([...StorageService.getFiles()]);
    setVideos([...StorageService.getVideos()]);
  };

  const handleLogout = () => {
    StorageService.logout();
    navigate('/login');
  };

  const handleSystemReset = () => {
    if (window.confirm("DANGER: This will delete ALL articles, ads, and changes. It will reset the website to the initial installation state. Are you sure?")) {
      StorageService.factoryReset();
    }
  };

  const saveApiKey = () => {
    StorageService.saveApiKey(apiKey);
    alert('API Key Saved Successfully! The website will now use this key for AI features.');
  };

  // --- GITHUB SYNC FUNCTIONS ---
  const handleGithubSync = async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
       alert("Please enter all GitHub credentials.");
       return;
    }
    
    // Save credentials first
    StorageService.saveGithubConfig(githubConfig);
    
    setIsSyncing(true);
    setSyncStatus("Preparing data...");

    try {
      const fileContent = GithubService.generateFileContent(apiKey, articles, videos, ads, files);
      setSyncStatus("Pushing to GitHub...");
      
      const result = await GithubService.pushToGithub(githubConfig, fileContent);
      
      if (result.success) {
        setSyncStatus("Success!");
        alert(result.message);
      } else {
        setSyncStatus("Failed.");
        alert(result.message);
      }
    } catch (e) {
      setSyncStatus("Error");
      alert("An unexpected error occurred during sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- MANUAL EXPORT FUNCTION ---
  const handleDownloadSource = () => {
    const fileContent = GithubService.generateFileContent(apiKey, articles, videos, ads, files);
    const blob = new Blob([fileContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constants.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Downloaded 'constants.ts'. Replace this file in your repo and push manually if Cloud Sync is not used.");
  };

  // --- ARTICLE FUNCTIONS ---
  const deleteArticle = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (window.confirm('PERMANENT ACTION: Are you sure you want to delete this article?')) {
      const strId = String(id);
      const success = StorageService.deleteArticle(strId);
      if (success) {
         setArticles(prevArticles => prevArticles.filter(a => String(a.id) !== strId));
      } else {
         alert("Error: Could not delete from storage. Please refresh and try again.");
      }
    }
  };

  const editExistingArticle = (article: Article) => {
    setEditingArticle({
      ...article,
      videoUrls: article.videoUrls || [],
      gallery: article.gallery || []
    });
    setTagsInput(article.tags?.join(', ') || '');
    setActiveTab('article_editor');
    setSidebarOpen(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setEditingArticle(prev => {
      const isNewOrEmpty = !prev.id || !prev.slug;
      let newSlug = prev.slug;
      if (isNewOrEmpty) {
        newSlug = newTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 100);
      }
      return { ...prev, title: newTitle, slug: newSlug };
    });
  };

  const saveArticle = () => {
    if (!editingArticle.title || !editingArticle.title.trim()) return alert('Error: Article Title is required.');
    if (!editingArticle.category) return alert('Error: Please select a Category.');
    
    let finalSlug = editingArticle.slug;
    if (!finalSlug || !finalSlug.trim()) {
      finalSlug = editingArticle.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 100);
    } else {
        finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    const finalTags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const articleToSave: Article = {
      id: editingArticle.id ? String(editingArticle.id) : Date.now().toString(),
      title: editingArticle.title,
      slug: finalSlug,
      summary: editingArticle.summary || '',
      content: editingArticle.content || '',
      category: editingArticle.category,
      author: editingArticle.author || 'Subhan Ahmad',
      publishedAt: editingArticle.publishedAt || new Date().toISOString(),
      imageUrl: editingArticle.imageUrl || `https://picsum.photos/800/600?random=${Date.now()}`,
      videoUrls: editingArticle.videoUrls || [],
      gallery: editingArticle.gallery || [],
      views: editingArticle.views || 0,
      tags: finalTags,
      isBreaking: editingArticle.isBreaking || false,
      isFeatured: editingArticle.isFeatured || false,
    };

    try {
      StorageService.saveArticle(articleToSave);
      setEditingArticle({});
      setTagsInput('');
      setActiveTab('articles');
      refreshData();
      alert('Article Saved locally! Go to "Cloud Sync" tab to publish.');
    } catch (error) {
      console.error(error);
      alert('Error saving article. Please try again.');
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt) return alert("Please enter a topic for AI.");
    setIsAIProcessing(true);
    try {
      const generated = await GeminiService.generateArticle(aiPrompt, editingArticle.category || 'World');
      setEditingArticle(prev => ({ ...prev, ...generated, videoUrls: [], gallery: [] }));
      setTagsInput(generated.tags?.join(', ') || '');
    } catch (e) {
      alert('AI Generation Failed. Please check your internet or API limits.');
    } finally {
      setIsAIProcessing(false);
    }
  };

  // --- MEDIA HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'gallery' | 'video' | 'videoThumbnail' | 'videoFile') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const limit = (field === 'video' || field === 'videoFile') ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > limit) { 
      alert(`File too large. Max 5MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (field === 'imageUrl') setEditingArticle(prev => ({ ...prev, imageUrl: result }));
      else if (field === 'gallery') setEditingArticle(prev => ({ ...prev, gallery: [...(prev.gallery || []), result] }));
      else if (field === 'video') setEditingArticle(prev => ({ ...prev, videoUrls: [...(prev.videoUrls || []), result] }));
      else if (field === 'videoFile') setEditingVideo(prev => ({ ...prev, url: result }));
      else if (field === 'videoThumbnail') setEditingVideo(prev => ({ ...prev, thumbnailUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  // --- VIDEO MANAGER FUNCTIONS ---
  const saveVideoPost = () => {
    if (!editingVideo.title || !editingVideo.url) {
      alert("Title and Video File/URL are required!");
      return;
    }
    const finalTags = videoTagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const videoToSave: VideoPost = {
      id: editingVideo.id || Date.now().toString(),
      title: editingVideo.title,
      description: editingVideo.description || '',
      url: editingVideo.url,
      thumbnailUrl: editingVideo.thumbnailUrl || 'https://picsum.photos/400/300',
      views: editingVideo.views || 0,
      publishedAt: editingVideo.publishedAt || new Date().toISOString(),
      tags: finalTags
    };
    StorageService.saveVideo(videoToSave);
    setEditingVideo({});
    setVideoTagsInput('');
    refreshData();
    alert("Video Saved Locally! Go to 'Cloud Sync' to publish.");
  };

  const deleteVideo = (id: string) => {
    if (window.confirm("Delete this video permanently?")) {
      StorageService.deleteVideo(id);
      refreshData();
    }
  };

  const editVideo = (video: VideoPost) => {
    setEditingVideo(video);
    setVideoTagsInput(video.tags?.join(', ') || '');
    setSidebarOpen(false);
  };

  // --- ADS FUNCTIONS ---
  const handleAdChange = (id: string, field: keyof AdConfig, value: any) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const saveAllAds = () => {
    setIsSavingAds(true);
    setTimeout(() => {
      StorageService.saveAds(ads);
      setIsSavingAds(false);
      alert("Ad Config Saved Locally! Go to 'Cloud Sync' to publish.");
    }, 500); 
  };

  // --- CODE EDITOR FUNCTIONS ---
  const handleFileSelect = (file: VirtualFile) => {
    setCurrentFile(file);
    setFileContent(file.content);
    setCodePrompt(''); 
    setSidebarOpen(false);
  };

  const handleSaveFile = () => {
    if (currentFile) {
      const updatedFile = { ...currentFile, content: fileContent };
      StorageService.saveFile(updatedFile);
      const updatedFiles = StorageService.getFiles(); 
      setFiles(updatedFiles);
      setCurrentFile(updatedFiles.find(f => f.path === updatedFile.path) || updatedFile);
      alert(`File '${updatedFile.name}' saved locally.`);
    }
  };

  const handleNavClick = (tab: any) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar on mobile when navigating
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex font-sans relative overflow-x-hidden">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 w-full bg-dark text-white z-50 flex items-center justify-between p-4 shadow-md">
         <div className="font-bold text-xl flex items-center"><CheckCircle className="text-primary mr-2" size={20}/> CMS</div>
         <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2">
           {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen md:shadow-none`}>
        <div className="p-6 font-bold text-xl border-b border-gray-700 hidden md:flex items-center">
          <CheckCircle className="text-primary mr-2" size={20} />
          CMS Panel
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => { refreshData(); handleNavClick('articles'); }} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'articles' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Layout size={18} className="mr-3" /> All Articles
          </button>
          <button onClick={() => { setEditingArticle({}); setTagsInput(''); handleNavClick('article_editor'); }} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'article_editor' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Plus size={18} className="mr-3" /> New Article
          </button>
          <button onClick={() => handleNavClick('videos')} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'videos' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Film size={18} className="mr-3" /> Video Manager
          </button>
          <button onClick={() => handleNavClick('ads')} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'ads' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <DollarSign size={18} className="mr-3" /> Ads Manager
          </button>
          <button onClick={() => handleNavClick('sync')} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'sync' ? 'bg-green-700' : 'text-green-400 hover:bg-gray-800'}`}>
            <Cloud size={18} className="mr-3" /> Cloud Sync (Live)
          </button>
          <button onClick={() => { refreshData(); handleNavClick('code_editor'); }} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'code_editor' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Code size={18} className="mr-3" /> Website Editor
          </button>
          <button onClick={() => handleNavClick('api')} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'api' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Key size={18} className="mr-3" /> API Settings
          </button>
        </nav>
        
        {/* System Tools */}
        <div className="p-4 border-t border-gray-700 space-y-2">
           <button onClick={handleDownloadSource} className="w-full flex items-center p-3 rounded text-gray-400 hover:bg-gray-800 transition-colors">
              <Download size={18} className="mr-3" /> Manual Backup
           </button>
           <button onClick={handleSystemReset} className="w-full flex items-center p-3 rounded text-red-400 hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-900/30">
              <AlertTriangle size={18} className="mr-3" /> System Reset
           </button>
           <button onClick={handleLogout} className="w-full flex items-center p-3 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <LogOut size={18} className="mr-3" /> Logout
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-20 md:pt-8 w-full">
        
        {/* ================= ARTICLES TAB ================= */}
        {activeTab === 'articles' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 dark:text-white">All Articles</h2>
              <button onClick={() => { setEditingArticle({}); setTagsInput(''); setActiveTab('article_editor'); }} className="bg-primary hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center transition-colors w-full md:w-auto justify-center">
                <Plus size={18} className="mr-2" /> Create New
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {articles.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No articles found. Create one!</td></tr>
                  ) : (
                    articles.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="p-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">{a.title}</td>
                        <td className="p-4"><span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">{a.category}</span></td>
                        <td className="p-4 text-gray-500 dark:text-gray-400">{a.views}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">{new Date(a.publishedAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => editExistingArticle(a)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={18} /></button>
                          <button onClick={(e) => deleteArticle(e, a.id)} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VIDEOS MANAGER TAB ================= */}
        {activeTab === 'videos' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl md:text-3xl font-serif font-bold dark:text-white flex items-center">
                 <Film className="mr-3 text-primary" /> Video Manager
               </h2>
             </div>

             <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
                <h3 className="font-bold text-lg mb-4">{editingVideo.id ? 'Edit Video' : 'Add New Video'}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                   <div>
                      <label className="block text-sm font-bold mb-1">Video Title</label>
                      <input 
                        className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                        value={editingVideo.title || ''}
                        onChange={e => setEditingVideo({...editingVideo, title: e.target.value})}
                        placeholder="Video Title"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold mb-1">Tags (Comma separated)</label>
                      <input 
                        className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                        value={videoTagsInput}
                        onChange={e => setVideoTagsInput(e.target.value)}
                        placeholder="Tech, Sports, Viral"
                      />
                   </div>
                </div>

                {/* Rest of Video Form (Same logic, slightly compacted for mobile if needed, but grid handles it) */}
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">Description</label>
                  <textarea 
                    className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                    value={editingVideo.description || ''}
                    onChange={e => setEditingVideo({...editingVideo, description: e.target.value})}
                    rows={2}
                  />
                </div>
                
                {/* Source Selection */}
                <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                   <h4 className="font-bold text-sm mb-3">Video Source (Choose One)</h4>
                   <div className="flex flex-col gap-4">
                      <div className="flex-1">
                         <label className="block text-xs font-bold text-gray-500 mb-1">External URL</label>
                         <input 
                            className="w-full p-3 border rounded dark:bg-gray-800"
                            value={editingVideo.url || ''}
                            onChange={e => setEditingVideo({...editingVideo, url: e.target.value})}
                            placeholder="https://example.com/video.mp4"
                         />
                      </div>
                      <div className="flex-1">
                         <label className="block text-xs font-bold text-gray-500 mb-1">Or Upload</label>
                         <div className="relative">
                           <button className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 py-3 rounded border border-dashed border-blue-400 flex justify-center items-center">
                              <Upload size={18} className="mr-2" /> Select File
                           </button>
                           <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'videoFile')} />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Thumbnail */}
                <div className="mb-6">
                   <label className="block text-sm font-bold mb-1">Thumbnail</label>
                   <div className="flex gap-4">
                      <input 
                         className="flex-1 p-2 border rounded dark:bg-gray-700"
                         value={editingVideo.thumbnailUrl || ''}
                         onChange={e => setEditingVideo({...editingVideo, thumbnailUrl: e.target.value})}
                         placeholder="Image URL"
                      />
                      <div className="relative">
                           <button className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded"><Upload size={18} /></button>
                           <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'videoThumbnail')} />
                      </div>
                   </div>
                </div>

                <div className="flex justify-end">
                   <button onClick={saveVideoPost} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center w-full md:w-auto justify-center">
                     <Save size={18} className="mr-2" /> Save Video
                   </button>
                </div>
             </div>

             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-100 dark:bg-gray-900 text-left text-xs uppercase text-gray-500 font-bold">
                     <tr><th className="p-4">Video</th><th className="p-4">Views</th><th className="p-4 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {videos.map(v => (
                       <tr key={v.id} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="p-4 flex items-center">
                             <div className="w-16 h-10 bg-black rounded mr-3 overflow-hidden shrink-0"><img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" /></div>
                             <div className="truncate max-w-[200px]"><div className="font-bold truncate">{v.title}</div><div className="text-xs text-gray-500">{new Date(v.publishedAt).toLocaleDateString()}</div></div>
                          </td>
                          <td className="p-4">{v.views}</td>
                          <td className="p-4 text-right space-x-2"><button onClick={() => editVideo(v)} className="text-blue-500"><Edit size={18}/></button><button onClick={() => deleteVideo(v.id)} className="text-red-500"><Trash2 size={18}/></button></td>
                       </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* ================= ADS MANAGER TAB ================= */}
        {activeTab === 'ads' && (
          <div className="animate-fade-in pb-20">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 py-4 gap-4">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 dark:text-white">Ads</h2>
              <button onClick={saveAllAds} disabled={isSavingAds} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center w-full md:w-auto justify-center disabled:opacity-70">
                {isSavingAds ? <><RefreshCw className="animate-spin mr-2" size={20} /> Saving...</> : <><Save size={20} className="mr-2" /> Save Changes</>}
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {ads.map(ad => (
                <div key={ad.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{ad.name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Location: {ad.location}</p>
                    </div>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-2 rounded-lg">
                       <span className={`mr-3 text-sm font-bold ${ad.enabled ? 'text-green-600' : 'text-gray-400'}`}>{ad.enabled ? 'ON' : 'OFF'}</span>
                       <button onClick={() => handleAdChange(ad.id, 'enabled', !ad.enabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${ad.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                         <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${ad.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                       </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Code / HTML</label>
                    <textarea className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 font-mono text-xs h-32 focus:ring-2 focus:ring-primary outline-none" value={ad.code} onChange={(e) => handleAdChange(ad.id, 'code', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= CLOUD SYNC TAB (GITHUB) ================= */}
        {activeTab === 'sync' && (
          <div className="animate-fade-in max-w-3xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 dark:text-white flex items-center">
                <Cloud className="mr-3 text-green-600" /> Cloud Sync
              </h2>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
               <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                 <p className="font-bold flex items-center mb-2"><Zap size={16} className="mr-2"/> Info:</p>
                 <p>Push changes to GitHub to make them live.</p>
               </div>

               <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-bold mb-1">GitHub Token</label>
                    <input type="password" className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600" value={githubConfig.token} onChange={e => setGithubConfig({...githubConfig, token: e.target.value})} placeholder="ghp_..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Repo Owner</label>
                      <input type="text" className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600" value={githubConfig.owner} onChange={e => setGithubConfig({...githubConfig, owner: e.target.value})} placeholder="Username" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Repo Name</label>
                      <input type="text" className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600" value={githubConfig.repo} onChange={e => setGithubConfig({...githubConfig, repo: e.target.value})} placeholder="repo-name" />
                    </div>
                  </div>
               </div>

               <div className="flex flex-col md:flex-row justify-end items-center gap-4">
                  {syncStatus && <span className="font-bold text-gray-600 dark:text-gray-300 text-center">{syncStatus}</span>}
                  <button onClick={handleGithubSync} disabled={isSyncing} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold shadow-lg w-full md:w-auto flex justify-center items-center disabled:opacity-50">
                    {isSyncing ? <RefreshCw className="animate-spin mr-2"/> : <Cloud className="mr-2"/>} {isSyncing ? "Syncing..." : "Publish Live"}
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* ================= API SETTINGS TAB ================= */}
        {activeTab === 'api' && (
          <div className="animate-fade-in max-w-3xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 dark:text-white flex items-center"><Key className="mr-3 text-primary" /> API Settings</h2>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
               <div className="mb-6">
                  <label className="block text-sm font-bold mb-2">Gemini API Key</label>
                  <div className="relative">
                    <input type="text" className="w-full p-4 pl-12 border rounded-lg dark:bg-gray-900 font-mono focus:ring-2 focus:ring-primary outline-none" placeholder="AIzaSy..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                    <Key size={20} className="absolute left-4 top-4 text-gray-400" />
                  </div>
               </div>
               <div className="flex justify-end">
                  <button onClick={saveApiKey} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center w-full md:w-auto justify-center"><Save size={20} className="mr-2" /> Save Key</button>
               </div>
            </div>
          </div>
        )}

        {/* ================= ARTICLE EDITOR TAB (Responsive) ================= */}
        {activeTab === 'article_editor' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
               <button onClick={() => setActiveTab('articles')} className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center"><ArrowLeft size={20} className="mr-1"/> Back</button>
               <h2 className="text-xl md:text-2xl font-bold">{editingArticle.id ? 'Edit' : 'New'} Article</h2>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 rounded-xl border border-blue-100 dark:border-blue-800 mb-8">
               <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
                  <div className="bg-blue-600 text-white p-2 rounded-lg hidden md:block"><Bot size={24} /></div>
                  <div className="flex-1 w-full">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">AI Assistant</h3>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input type="text" className="flex-1 p-2 border rounded dark:bg-gray-800" placeholder="Topic..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
                      <button onClick={generateWithAI} disabled={isAIProcessing} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex justify-center items-center">
                        {isAIProcessing ? <RefreshCw className="animate-spin mr-2" size={18}/> : 'Generate'}
                      </button>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-xl shadow-lg space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold mb-1">Title *</label>
                    <input type="text" className="w-full p-3 border rounded dark:bg-gray-700" value={editingArticle.title || ''} onChange={handleTitleChange} />
                 </div>
                 <div>
                    <label className="block text-sm font-bold mb-1">Category *</label>
                    <select className="w-full p-3 border rounded dark:bg-gray-700" value={editingArticle.category || ''} onChange={e => setEditingArticle({...editingArticle, category: e.target.value})}>
                      <option value="">Select</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold mb-1">Slug</label>
                 <input type="text" className="w-full p-3 border rounded dark:bg-gray-700 font-mono text-sm" value={editingArticle.slug || ''} onChange={e => setEditingArticle({...editingArticle, slug: e.target.value})} />
              </div>

              {/* Media Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-lg mb-4 flex items-center"><ImageIcon className="mr-2" size={20}/> Media</h3>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Featured Image</label>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                     <input type="text" className="flex-1 p-2 border rounded dark:bg-gray-700" value={editingArticle.imageUrl || ''} onChange={e => setEditingArticle({...editingArticle, imageUrl: e.target.value})} placeholder="URL" />
                     <div className="relative">
                       <button className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded w-full md:w-auto">Upload</button>
                       <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'imageUrl')} />
                     </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Content (Markdown)</label>
                <textarea rows={15} className="w-full p-3 border rounded dark:bg-gray-700 font-mono text-sm" value={editingArticle.content || ''} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} />
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button onClick={saveArticle} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg w-full md:w-auto flex justify-center items-center">
                  <Save size={20} className="mr-2" /> Publish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= WEBSITE EDITOR TAB ================= */}
        {activeTab === 'code_editor' && (
          <div className="animate-fade-in h-full flex flex-col">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6 flex items-center"><Code className="mr-3" /> Code Editor</h2>
            <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-6 min-h-[500px]">
               <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col mb-4 md:mb-0">
                 <h3 className="font-bold text-xs uppercase mb-4">Files</h3>
                 <div className="flex-1 overflow-y-auto max-h-40 md:max-h-full space-y-1">
                   {files.map(file => (
                     <button key={file.path} onClick={() => handleFileSelect(file)} className={`w-full text-left px-3 py-2 rounded text-sm font-mono truncate ${currentFile?.path === file.path ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                       {file.name}
                     </button>
                   ))}
                 </div>
               </div>
               <div className="md:col-span-9 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden h-[500px] md:h-auto">
                 {currentFile ? (
                   <>
                     <div className="bg-gray-50 dark:bg-gray-900 border-b p-4 flex justify-between items-center">
                        <span className="font-mono text-sm truncate max-w-[150px]">{currentFile.path}</span>
                        <div className="flex space-x-2">
                          <button onClick={handleSaveFile} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm flex items-center"><Save size={14} className="mr-2" /> Save</button>
                        </div>
                     </div>
                     <textarea className="w-full h-full p-4 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] resize-none focus:outline-none" value={fileContent} onChange={(e) => setFileContent(e.target.value)} spellCheck={false} />
                   </>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4 text-center"><Code size={48} className="mb-4 opacity-20" /><p>Select a file.</p></div>
                 )}
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;