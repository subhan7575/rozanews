import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { GithubService } from '../../services/githubService';
import { 
  Trash2, Edit, Plus, Save, Bot, LogOut, Layout, 
  DollarSign, Code, RefreshCw, ArrowRight, Menu, X, Key, Film, Cloud, Users, Mail, Eye, Sparkles, Wand2, Tag, Upload, Megaphone
} from 'lucide-react';
import { CATEGORIES } from '../../constants';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const activeTabState = useState<'articles' | 'ads' | 'article_editor' | 'code_editor' | 'api' | 'videos' | 'sync' | 'users' | 'messages' | 'ticker'>('articles');
  const [activeTab, setActiveTab] = activeTabState;
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  
  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tickerConfig, setTickerConfig] = useState<TickerConfig>({ visible: true, content: [] });
  
  // Article Editor State
  const [editingArticle, setEditingArticle] = useState<Partial<Article>>({});
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Video Editor State
  const [editingVideo, setEditingVideo] = useState<Partial<VideoPost>>({});
  const [videoTagsInput, setVideoTagsInput] = useState('');

  // Ads & Ticker Save State
  const [isSavingAds, setIsSavingAds] = useState(false);
  const [isSavingTicker, setIsSavingTicker] = useState(false);

  // Code Editor State
  const [currentFile, setCurrentFile] = useState<VirtualFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  
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
    setUsers([...StorageService.getAllUsers()]);
    setMessages([...StorageService.getMessages()]);
    setTickerConfig(StorageService.getTickerConfig());
  };

  const handleLogout = () => {
    StorageService.logout();
    navigate('/login');
  };

  const handleSystemReset = () => {
    if (window.confirm("DANGER: This will delete ALL articles, ads, users, and changes. It will reset the website to the initial installation state. Are you sure?")) {
      StorageService.factoryReset();
    }
  };

  const saveApiKey = () => {
    StorageService.saveApiKey(apiKey);
    alert('API Key Saved Successfully!');
  };

  // --- GITHUB SYNC FUNCTIONS ---
  const handleGithubSync = async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
       alert("Please enter all GitHub credentials.");
       return;
    }
    
    StorageService.saveGithubConfig(githubConfig);
    
    setIsSyncing(true);
    setSyncStatus("Preparing data...");

    try {
      const freshArticles = StorageService.getArticles();
      const freshVideos = StorageService.getVideos();
      const freshAds = StorageService.getAds();
      const freshFiles = StorageService.getFiles();
      const freshUsers = StorageService.getAllUsers();
      const freshMessages = StorageService.getMessages();
      const freshTicker = StorageService.getTickerConfig();

      const fileContent = GithubService.generateFileContent(
        apiKey, 
        freshArticles, 
        freshVideos, 
        freshAds, 
        freshFiles,
        freshUsers,
        freshMessages,
        freshTicker,
        githubConfig
      );
      
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

  // --- TICKER FUNCTIONS ---
  const handleTickerChange = (index: number, value: string) => {
    const newContent = [...tickerConfig.content];
    newContent[index] = value;
    setTickerConfig({ ...tickerConfig, content: newContent });
  };

  const saveTicker = () => {
    setIsSavingTicker(true);
    StorageService.saveTickerConfig(tickerConfig);
    setTimeout(() => setIsSavingTicker(false), 500);
  };

  // --- USER FUNCTIONS ---
  const deleteUser = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (window.confirm('PERMANENT ACTION: Are you sure you want to delete this user?')) {
      StorageService.deleteUser(id);
      refreshData();
    }
  };

  // --- ARTICLE FUNCTIONS ---
  const deleteArticle = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (window.confirm('PERMANENT ACTION: Are you sure you want to delete this article?')) {
      const success = StorageService.deleteArticle(String(id));
      if (success) {
         refreshData();
      }
    }
  };

  const editExistingArticle = (article: Article) => {
    setEditingArticle({ ...article, videoUrls: article.videoUrls || [], gallery: article.gallery || [] });
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
    }

    const newArticle: Article = {
      id: editingArticle.id || Date.now().toString(),
      title: editingArticle.title,
      slug: finalSlug,
      summary: editingArticle.summary || '',
      content: editingArticle.content || '',
      category: editingArticle.category,
      author: editingArticle.author || 'Subhan Ahmad',
      publishedAt: editingArticle.publishedAt || new Date().toISOString(),
      imageUrl: editingArticle.imageUrl || 'https://picsum.photos/800/600',
      views: editingArticle.views || 0,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      isBreaking: editingArticle.isBreaking || false,
      isFeatured: editingArticle.isFeatured || false,
      videoUrls: editingArticle.videoUrls || [],
      gallery: editingArticle.gallery || []
    };

    StorageService.saveArticle(newArticle);
    setEditingArticle({});
    setTagsInput('');
    setActiveTab('articles');
    refreshData();
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) return alert("Please enter a topic.");
    if (!editingArticle.category) return alert("Please select a category first.");
    
    setIsAIProcessing(true);
    try {
       const generated = await GeminiService.generateArticle(aiPrompt, editingArticle.category);
       setEditingArticle(prev => ({
          ...prev,
          ...generated
       }));
       if (generated.tags) setTagsInput(generated.tags.join(', '));
    } catch (e) {
      alert("AI Generation Failed. Check Console.");
    } finally {
      setIsAIProcessing(false);
    }
  };

  // --- ADVANCED AI TOOLS ---
  const handleAIFix = async (type: 'grammar' | 'rewrite') => {
     if (!editingArticle.content) return alert("Write some content first.");
     setIsAIProcessing(true);
     try {
        const improved = await GeminiService.improveContent(editingArticle.content, type);
        setEditingArticle(prev => ({ ...prev, content: improved }));
     } catch (e) {
        alert("AI improvement failed.");
     } finally {
        setIsAIProcessing(false);
     }
  };

  const handleAIGenerateTags = async () => {
     if (!editingArticle.content) return alert("Write content first.");
     setIsAIProcessing(true);
     try {
        const tags = await GeminiService.generateTags(editingArticle.content);
        setTagsInput(tags.join(', '));
     } catch (e) {
        alert("Tag generation failed.");
     } finally {
        setIsAIProcessing(false);
     }
  };

  // --- VIDEO FUNCTIONS ---
  const saveVideo = () => {
     if (!editingVideo.title || !editingVideo.url) {
        return alert("Title and URL are required.");
     }

     const newVideo: VideoPost = {
       id: editingVideo.id || 'v_' + Date.now(),
       title: editingVideo.title,
       description: editingVideo.description || '',
       url: editingVideo.url,
       thumbnailUrl: editingVideo.thumbnailUrl || 'https://picsum.photos/400/700?random=' + Date.now(),
       views: editingVideo.views || 0,
       likes: editingVideo.likes || 0,
       publishedAt: editingVideo.publishedAt || new Date().toISOString(),
       tags: videoTagsInput.split(',').map(t => t.trim()).filter(Boolean),
       likedBy: editingVideo.likedBy || [],
       comments: editingVideo.comments || []
     };

     StorageService.saveVideo(newVideo);
     setEditingVideo({});
     setVideoTagsInput('');
     refreshData();
     alert("Video Saved!");
  };

  const handleEditVideo = (video: VideoPost) => {
     setEditingVideo(video);
     setVideoTagsInput(video.tags.join(', '));
     window.scrollTo(0,0);
  };

  const handleCancelEditVideo = () => {
     setEditingVideo({});
     setVideoTagsInput('');
  };

  const handleDeleteVideo = (id: string) => {
     if(window.confirm("Are you sure you want to delete this video? This cannot be undone.")) {
        StorageService.deleteVideo(id);
        refreshData();
     }
  };

  // --- AD FUNCTIONS ---
  const handleAdChange = (id: string, field: keyof AdConfig, value: any) => {
    const updatedAds = ads.map(ad => ad.id === id ? { ...ad, [field]: value } : ad);
    setAds(updatedAds);
  };

  const saveAdsConfig = () => {
    setIsSavingAds(true);
    StorageService.saveAds(ads);
    setTimeout(() => setIsSavingAds(false), 500);
  };

  // --- CODE EDITOR ---
  const loadFile = (file: VirtualFile) => {
     setCurrentFile(file);
     setFileContent(file.content);
  };

  const saveFileContent = () => {
     if (!currentFile) return;
     const updatedFile = { ...currentFile, content: fileContent };
     StorageService.saveFile(updatedFile);
     refreshData();
     alert(`Saved ${currentFile.name}`);
  };

  // --- TAB RENDERERS ---
  
  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
         <h2 className="text-xl font-black tracking-tighter flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">R</div>
           ADMIN
         </h2>
         <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3">
         <div className="text-xs font-bold text-gray-500 uppercase px-3 mb-2">Content</div>
         <button onClick={() => { setActiveTab('articles'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'articles' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Layout size={18} /> Articles
         </button>
         <button onClick={() => { setActiveTab('videos'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'videos' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Film size={18} /> Videos
         </button>
         <button onClick={() => { setActiveTab('ticker'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'ticker' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Megaphone size={18} /> Breaking News
         </button>

         <div className="text-xs font-bold text-gray-500 uppercase px-3 mb-2 mt-6">Monetization</div>
         <button onClick={() => { setActiveTab('ads'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'ads' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <DollarSign size={18} /> Ad Manager
         </button>

         <div className="text-xs font-bold text-gray-500 uppercase px-3 mb-2 mt-6">System</div>
         <button onClick={() => { setActiveTab('users'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Users size={18} /> Users
         </button>
         <button onClick={() => { setActiveTab('messages'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'messages' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Mail size={18} /> Messages
         </button>
         <button onClick={() => { setActiveTab('code_editor'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'code_editor' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Code size={18} /> File Editor
         </button>
         <button onClick={() => { setActiveTab('sync'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'sync' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Cloud size={18} /> Cloud Sync
         </button>
         <button onClick={() => { setActiveTab('api'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'api' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Key size={18} /> API Keys
         </button>
      </nav>

      <div className="p-4 border-t border-white/10">
         <button onClick={handleSystemReset} className="w-full mb-3 flex items-center justify-center gap-2 text-red-500 text-xs font-bold hover:text-red-400">
             Reset System
         </button>
         <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg transition-colors text-sm font-bold">
            <LogOut size={16} /> Sign Out
         </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black font-sans overflow-hidden">
      {renderSidebar()}
      
      {/* Mobile Toggle */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-dark text-white rounded-lg shadow-lg"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
          
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
             <h1 className="text-3xl font-bold dark:text-white capitalize flex items-center gap-3">
               {activeTab.replace('_', ' ')}
               {isSyncing && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded animate-pulse">Syncing...</span>}
             </h1>
             <button onClick={() => window.open('/', '_blank')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                View Site <ArrowRight size={16} />
             </button>
          </header>

          {/* --- TAB CONTENT --- */}
          
          {/* TICKER TAB */}
          {activeTab === 'ticker' && (
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <h3 className="text-xl font-bold dark:text-white">Breaking News Ticker</h3>
                      <p className="text-sm text-gray-500">Manage the scrolling text at the top of the site.</p>
                   </div>
                   <button 
                      onClick={saveTicker}
                      className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center"
                   >
                      <Save size={18} className="mr-2"/> {isSavingTicker ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                      <span className="font-bold dark:text-white">Show Ticker on Website</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={tickerConfig.visible}
                           onChange={(e) => setTickerConfig({...tickerConfig, visible: e.target.checked})}
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      </label>
                   </div>

                   <div className="space-y-4">
                      {[0, 1, 2].map((index) => (
                         <div key={index}>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Headline #{index + 1}</label>
                            <input 
                              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                              value={tickerConfig.content[index] || ''}
                              onChange={(e) => handleTickerChange(index, e.target.value)}
                              placeholder={`Enter news headline #${index + 1}...`}
                            />
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                     <tr>
                       <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">User</th>
                       <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Role</th>
                       <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Joined</th>
                       <th className="p-4 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                     {users.map(u => (
                       <tr key={u.id}>
                         <td className="p-4">
                           <div className="flex items-center gap-3">
                              <img src={u.avatar} className="w-8 h-8 rounded-full bg-gray-200" alt={u.name}/>
                              <div>
                                 <p className="font-bold text-gray-900 dark:text-white text-sm">{u.name}</p>
                                 <p className="text-xs text-gray-500">{u.email || u.phoneNumber}</p>
                              </div>
                           </div>
                         </td>
                         <td className="p-4"><span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{u.role}</span></td>
                         <td className="p-4 text-sm text-gray-500">{new Date(u.joinedAt).toLocaleDateString()}</td>
                         <td className="p-4 text-right">
                           {u.role !== 'admin' && (
                              <button onClick={(e) => deleteUser(e, u.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                           )}
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
             </div>
          )}

          {/* ARTICLE EDITOR TAB */}
          {activeTab === 'article_editor' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                      {/* AI Generator Box */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mb-8">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
                               <Bot size={20} /> AI Assistant
                            </div>
                            <div className="text-xs text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded">Advanced</div>
                         </div>
                         
                         {/* Generate New */}
                         <div className="flex gap-2 mb-4">
                            <input 
                              className="flex-1 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 text-sm"
                              placeholder="Enter topic (e.g. 'SpaceX launch success')"
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                            />
                            <button 
                              onClick={handleGenerateAI}
                              disabled={isAIProcessing}
                              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center"
                            >
                              {isAIProcessing ? <span className="animate-spin mr-2">⟳</span> : <Sparkles size={16} className="mr-2"/>}
                              Generate
                            </button>
                         </div>

                         {/* AI Tools for Existing Content */}
                         <div className="flex gap-2 pt-4 border-t border-indigo-200 dark:border-indigo-800/30">
                            <button 
                               onClick={() => handleAIFix('grammar')}
                               disabled={isAIProcessing || !editingArticle.content}
                               className="flex-1 bg-white dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 py-2 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                            >
                               <Wand2 size={12}/> Fix Grammar
                            </button>
                            <button 
                               onClick={() => handleAIFix('rewrite')}
                               disabled={isAIProcessing || !editingArticle.content}
                               className="flex-1 bg-white dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 py-2 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                            >
                               <RefreshCw size={12}/> Rewrite
                            </button>
                            <button 
                               onClick={handleAIGenerateTags}
                               disabled={isAIProcessing || !editingArticle.content}
                               className="flex-1 bg-white dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 py-2 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                            >
                               <Tag size={12}/> Auto Tags
                            </button>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                            <input 
                              className="w-full p-4 text-lg font-bold bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                              value={editingArticle.title || ''}
                              onChange={handleTitleChange}
                              placeholder="Article Headline"
                            />
                         </div>
                         
                         <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Slug (SEO URL)</label>
                            <input 
                              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 text-sm font-mono"
                              value={editingArticle.slug || ''}
                              disabled
                            />
                         </div>

                         <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Summary</label>
                            <textarea 
                              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                              rows={3}
                              value={editingArticle.summary || ''}
                              onChange={(e) => setEditingArticle({...editingArticle, summary: e.target.value})}
                              placeholder="Brief intro..."
                            />
                         </div>

                         <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Content (Markdown Supported)</label>
                            <textarea 
                              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono text-sm leading-relaxed"
                              rows={15}
                              value={editingArticle.content || ''}
                              onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                              placeholder="# Heading&#10;Write your story here..."
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold mb-4 dark:text-white">Publishing</h3>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                            <select 
                               className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                               value={editingArticle.category || ''}
                               onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}
                            >
                               <option value="">Select Category</option>
                               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         </div>
                         
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image URL</label>
                            <div className="flex gap-2">
                               <input 
                                 className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-sm"
                                 value={editingArticle.imageUrl || ''}
                                 onChange={(e) => setEditingArticle({...editingArticle, imageUrl: e.target.value})}
                                 placeholder="https://..."
                               />
                               {editingArticle.imageUrl && (
                                  <img src={editingArticle.imageUrl} className="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="Preview"/>
                               )}
                            </div>
                         </div>

                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tags</label>
                            <input 
                              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-sm"
                              value={tagsInput}
                              onChange={(e) => setTagsInput(e.target.value)}
                              placeholder="Comma separated"
                            />
                         </div>

                         <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                               <input 
                                 type="checkbox" 
                                 checked={editingArticle.isBreaking || false}
                                 onChange={(e) => setEditingArticle({...editingArticle, isBreaking: e.target.checked})}
                                 className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                               />
                               <span className="text-sm font-bold dark:text-white">Breaking</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                               <input 
                                 type="checkbox" 
                                 checked={editingArticle.isFeatured || false}
                                 onChange={(e) => setEditingArticle({...editingArticle, isFeatured: e.target.checked})}
                                 className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                               />
                               <span className="text-sm font-bold dark:text-white">Featured</span>
                            </label>
                         </div>
                         
                         <button 
                           onClick={saveArticle}
                           className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-red-700 transition-colors mt-4"
                         >
                           {editingArticle.id ? 'Update Article' : 'Publish Now'}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* ARTICLES LIST TAB */}
          {activeTab === 'articles' && (
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                   <h2 className="font-bold dark:text-white">All Articles ({articles.length})</h2>
                   <button onClick={() => { setEditingArticle({}); setTagsInput(''); setActiveTab('article_editor'); }} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                      <Plus size={16} className="mr-2"/> New Article
                   </button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                     <tr>
                       <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Title</th>
                       <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Category</th>
                       <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Views</th>
                       <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Date</th>
                       <th className="p-4 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                     {articles.map(article => (
                       <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                         <td className="p-4">
                           <div className="font-bold text-gray-900 dark:text-white line-clamp-1 max-w-[200px] md:max-w-xs">{article.title}</div>
                         </td>
                         <td className="p-4">
                            <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{article.category}</span>
                         </td>
                         <td className="p-4 text-sm text-gray-500">{article.views}</td>
                         <td className="p-4 text-sm text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</td>
                         <td className="p-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <button onClick={() => editExistingArticle(article)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit">
                                <Edit size={16}/>
                             </button>
                             <button onClick={(e) => deleteArticle(e, article.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete">
                                <Trash2 size={16}/>
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
             </div>
          )}

          {/* ADS TAB */}
          {activeTab === 'ads' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                   <div>
                      <h2 className="text-xl font-bold dark:text-white">Advertising Manager</h2>
                      <p className="text-sm text-gray-500">Configure ad placements and codes.</p>
                   </div>
                   <button 
                      onClick={saveAdsConfig}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center"
                   >
                      <Save size={18} className="mr-2"/> {isSavingAds ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>

                <div className="grid gap-6">
                   {ads.map(ad => (
                      <div key={ad.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-green-500"></span> {ad.name}
                            </h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                               <input 
                                 type="checkbox" 
                                 className="sr-only peer" 
                                 checked={ad.enabled}
                                 onChange={(e) => handleAdChange(ad.id, 'enabled', e.target.checked)}
                               />
                               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                            </label>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ad Type</label>
                               <select 
                                 className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white text-sm"
                                 value={ad.type}
                                 onChange={(e) => handleAdChange(ad.id, 'type', e.target.value)}
                               >
                                  <option value="image">Image Banner</option>
                                  <option value="script">Custom Script (AdSense)</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                               <input 
                                 className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 text-sm"
                                 value={ad.location}
                                 disabled
                               />
                            </div>
                            <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                  {ad.type === 'image' ? 'Image URL' : 'Script / HTML Code'}
                               </label>
                               {ad.type === 'image' ? (
                                  <input 
                                     className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white font-mono text-sm"
                                     value={ad.code}
                                     onChange={(e) => handleAdChange(ad.id, 'code', e.target.value)}
                                  />
                               ) : (
                                  <textarea 
                                     className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white font-mono text-sm h-32"
                                     value={ad.code}
                                     onChange={(e) => handleAdChange(ad.id, 'code', e.target.value)}
                                  />
                               )}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* VIDEOS TAB */}
          {activeTab === 'videos' && (
             <div className="space-y-8">
                {/* Form */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold dark:text-white">{editingVideo.id ? 'Edit Video' : 'Add New Video Clip'}</h3>
                      {editingVideo.id && (
                         <button onClick={handleCancelEditVideo} className="text-sm text-red-500 font-bold hover:underline">Cancel Edit</button>
                      )}
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                         <input 
                           className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                           value={editingVideo.title || ''}
                           onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                           placeholder="Viral Title..."
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Video URL (MP4 or YouTube)</label>
                         <input 
                           className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                           value={editingVideo.url || ''}
                           onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })}
                           placeholder="https://..."
                         />
                      </div>
                      <div className="md:col-span-2">
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                         <textarea 
                           className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                           rows={3}
                           value={editingVideo.description || ''}
                           onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                           placeholder="Brief description..."
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thumbnail URL</label>
                         <input 
                           className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                           value={editingVideo.thumbnailUrl || ''}
                           onChange={(e) => setEditingVideo({ ...editingVideo, thumbnailUrl: e.target.value })}
                           placeholder="https://..."
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tags (Comma separated)</label>
                         <input 
                           className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                           value={videoTagsInput}
                           onChange={(e) => setVideoTagsInput(e.target.value)}
                           placeholder="News, Tech, Viral"
                         />
                      </div>
                   </div>
                   <button onClick={saveVideo} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-primary/30">
                      {editingVideo.id ? 'Update Video' : 'Publish Video'}
                   </button>
                </div>

                {/* Video List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                   <table className="w-full">
                     <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Video</th>
                          <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Stats</th>
                          <th className="p-4 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {videos.map(video => (
                          <tr key={video.id}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={video.thumbnailUrl} className="w-16 h-10 object-cover rounded bg-gray-200" alt="thumb" />
                                <div>
                                  <div className="font-bold dark:text-white line-clamp-1 max-w-[200px]">{video.title}</div>
                                  <div className="text-xs text-gray-500">{new Date(video.publishedAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                               <div>{video.views} views</div>
                               <div className="text-xs opacity-70">{video.likes} likes</div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditVideo(video)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit">
                                   <Edit size={16}/>
                                </button>
                                <button onClick={() => handleDeleteVideo(video.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete">
                                   <Trash2 size={16}/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {videos.length === 0 && (
                           <tr><td colSpan={3} className="p-8 text-center text-gray-500">No videos published yet.</td></tr>
                        )}
                     </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
             <div className="space-y-4">
                {messages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
                {messages.map(msg => (
                  <div key={msg.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                     <div className="flex justify-between mb-4">
                        <div>
                           <h3 className="font-bold dark:text-white">{msg.name}</h3>
                           <p className="text-sm text-gray-500">{msg.email}</p>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                     </div>
                     <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">{msg.content}</p>
                  </div>
                ))}
             </div>
          )}

          {/* CLOUD SYNC TAB */}
          {activeTab === 'sync' && (
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center">
                       <Cloud size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold dark:text-white">GitHub Integration</h3>
                       <p className="text-sm text-gray-500">Sync your content to your repository for persistence.</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Personal Access Token</label>
                       <input 
                         type="password" 
                         value={githubConfig.token}
                         onChange={(e) => setGithubConfig({ ...githubConfig, token: e.target.value })}
                         className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white"
                         placeholder="ghp_..."
                       />
                       <p className="text-xs text-gray-400 mt-1">Must have 'repo' scope.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Owner (Username)</label>
                          <input 
                            type="text" 
                            value={githubConfig.owner}
                            onChange={(e) => setGithubConfig({ ...githubConfig, owner: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white"
                            placeholder="Jobsofficial786"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Repository Name</label>
                          <input 
                            type="text" 
                            value={githubConfig.repo}
                            onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white"
                            placeholder="roza-news"
                          />
                       </div>
                    </div>
                    
                    <button 
                       onClick={handleGithubSync}
                       disabled={isSyncing}
                       className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-80 transition-opacity flex justify-center items-center mt-4"
                    >
                       {isSyncing ? (
                          <>
                             <RefreshCw size={20} className="mr-2 animate-spin"/> {syncStatus}
                          </>
                       ) : (
                          <>
                             <Upload size={20} className="mr-2"/> Push Data to GitHub
                          </>
                       )}
                    </button>
                 </div>
             </div>
          )}

          {/* API KEY TAB */}
          {activeTab === 'api' && (
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl">
                <h3 className="text-xl font-bold dark:text-white mb-6">Gemini API Configuration</h3>
                <div className="mb-6">
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Google Gemini API Key</label>
                   <input 
                     type="text" 
                     value={apiKey}
                     onChange={(e) => setApiKey(e.target.value)}
                     className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono text-sm"
                     placeholder="AIza..."
                   />
                   <p className="text-xs text-gray-500 mt-2">Required for AI Article Generation.</p>
                </div>
                <button onClick={saveApiKey} className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-red-700 transition-colors">
                   Save Key
                </button>
             </div>
          )}

          {/* CODE EDITOR TAB */}
          {activeTab === 'code_editor' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
               {/* File Browser */}
               <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 overflow-y-auto">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Project Files</h3>
                  <div className="space-y-1">
                     {files.map(file => (
                       <button 
                         key={file.path}
                         onClick={() => loadFile(file)}
                         className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${currentFile?.path === file.path ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                       >
                          {file.name}
                       </button>
                     ))}
                  </div>
               </div>
               
               {/* Editor Area */}
               <div className="lg:col-span-3 bg-[#1e1e1e] rounded-xl overflow-hidden flex flex-col shadow-2xl">
                  {currentFile ? (
                    <>
                       <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-black/20">
                          <span className="text-gray-300 text-xs font-mono">{currentFile.path}</span>
                          <button onClick={saveFileContent} className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-red-600 flex items-center">
                             <Save size={12} className="mr-1" /> Save
                          </button>
                       </div>
                       <textarea 
                          className="flex-1 w-full bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 outline-none resize-none"
                          value={fileContent}
                          onChange={(e) => setFileContent(e.target.value)}
                          spellCheck={false}
                       />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                       Select a file to edit
                    </div>
                  )}
               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;