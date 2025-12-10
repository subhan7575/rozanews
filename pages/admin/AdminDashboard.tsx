import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { Article, AdConfig, VirtualFile, VideoPost } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { 
  Trash2, Edit, Plus, Save, Bot, LogOut, Layout, 
  DollarSign, Code, FileCode, CheckCircle, XCircle, 
  ExternalLink, RefreshCw, Eye, ArrowLeft, Terminal,
  Image as ImageIcon, Video, Upload, X, Zap, Search, AlertTriangle, Key, Film
} from 'lucide-react';
import { CATEGORIES } from '../../constants';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'articles' | 'ads' | 'article_editor' | 'code_editor' | 'api' | 'videos'>('articles');
  
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

  // Media Inputs State
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [tempGalleryUrl, setTempGalleryUrl] = useState('');

  // Ads State
  const [isSavingAds, setIsSavingAds] = useState(false);

  // Code Editor State
  const [selectedFile, setSelectedFile] = useState<VirtualFile[] | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [codePrompt, setCodePrompt] = useState('');
  const [isCodeGenerating, setIsCodeGenerating] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState('');

  // Fix type helper for selected file
  const [currentFile, setCurrentFile] = useState<VirtualFile | null>(null);

  useEffect(() => {
    if (!StorageService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    refreshData();
    setApiKey(StorageService.getApiKey());
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
  };

  const saveArticle = () => {
    if (!editingArticle.title || !editingArticle.title.trim()) {
      return alert('Error: Article Title is required.');
    }
    if (!editingArticle.category) {
      return alert('Error: Please select a Category.');
    }
    
    let finalSlug = editingArticle.slug;
    if (!finalSlug || !finalSlug.trim()) {
      finalSlug = editingArticle.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    } else {
        finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    // Process Tags
    const finalTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

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
      setTimeout(() => alert('Success! Article published successfully.'), 50);
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
      setEditingArticle(prev => ({ 
        ...prev, 
        ...generated,
        videoUrls: [],
        gallery: []
      }));
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

    // Check size limit (10MB for video to be generous, but risky for localStorage)
    const limit = (field === 'video' || field === 'videoFile') ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    
    if (file.size > limit) { 
      alert(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max limit is ${limit / 1024 / 1024}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (field === 'imageUrl') {
        setEditingArticle(prev => ({ ...prev, imageUrl: result }));
      } else if (field === 'gallery') {
        setEditingArticle(prev => ({ ...prev, gallery: [...(prev.gallery || []), result] }));
      } else if (field === 'video') {
         setEditingArticle(prev => ({ ...prev, videoUrls: [...(prev.videoUrls || []), result] }));
      } else if (field === 'videoFile') {
         setEditingVideo(prev => ({ ...prev, url: result }));
      } else if (field === 'videoThumbnail') {
         setEditingVideo(prev => ({ ...prev, thumbnailUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addVideoUrl = () => {
    if (!tempVideoUrl) return;
    setEditingArticle(prev => ({ ...prev, videoUrls: [...(prev.videoUrls || []), tempVideoUrl] }));
    setTempVideoUrl('');
  };

  const removeVideo = (index: number) => {
    setEditingArticle(prev => ({
      ...prev,
      videoUrls: prev.videoUrls?.filter((_, i) => i !== index)
    }));
  };

  const addGalleryUrl = () => {
     if (!tempGalleryUrl) return;
     setEditingArticle(prev => ({ ...prev, gallery: [...(prev.gallery || []), tempGalleryUrl] }));
     setTempGalleryUrl('');
  };

  const removeGalleryImage = (index: number) => {
    setEditingArticle(prev => ({
      ...prev,
      gallery: prev.gallery?.filter((_, i) => i !== index)
    }));
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
    alert("Video Saved Successfully!");
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
  };

  // --- ADS FUNCTIONS ---

  const handleAdChange = (id: string, field: keyof AdConfig, value: any) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const generateCodeFromIds = (id: string) => {
    const ad = ads.find(a => a.id === id);
    if (!ad) return;
    
    const unitId = ad.googleAdUnitId?.trim() || '';
    let pubId = '';
    let slotId = '';

    if (unitId.includes('/')) {
      const parts = unitId.split('/');
      pubId = parts[0]; 
      slotId = parts[1]; 
    } else {
       const appId = ad.googleAppId?.trim() || '';
       pubId = appId.split('~')[0]; 
    }

    if (!pubId || !slotId) {
      alert("Could not auto-generate. Please ensure 'Ad Unit ID' is in the format 'ca-app-pub-XXX/YYY'.");
      return;
    }

    const newCode = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}"
     crossorigin="anonymous"></script>
<!-- Roza News Auto Generated -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${pubId}"
     data-ad-slot="${slotId}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;

    handleAdChange(id, 'code', newCode);
    handleAdChange(id, 'type', 'script');
    alert("Code generated successfully! Click 'Save All Changes' to apply.");
  };

  const saveAllAds = () => {
    setIsSavingAds(true);
    setTimeout(() => {
      StorageService.saveAds(ads);
      setIsSavingAds(false);
      alert("Success! Ads configuration has been saved and is now live.");
      window.location.reload();
    }, 500); 
  };

  // --- CODE EDITOR FUNCTIONS ---

  const handleFileSelect = (file: VirtualFile) => {
    setCurrentFile(file);
    setFileContent(file.content);
    setCodePrompt(''); 
  };

  const handleSaveFile = () => {
    if (currentFile) {
      const updatedFile = { ...currentFile, content: fileContent };
      StorageService.saveFile(updatedFile);
      const updatedFiles = StorageService.getFiles(); 
      setFiles(updatedFiles);
      setCurrentFile(updatedFiles.find(f => f.path === updatedFile.path) || updatedFile);
      alert(`File '${updatedFile.name}' saved successfully.`);
    }
  };

  const handleAICodeEdit = async () => {
    if (!codePrompt || !currentFile) return alert("Please enter instructions for the AI.");
    setIsCodeGenerating(true);
    try {
      const updatedCode = await GeminiService.editCode(fileContent, codePrompt);
      setFileContent(updatedCode);
    } catch (e) {
      alert('AI Code Edit Failed. Please try again.');
    } finally {
      setIsCodeGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-dark text-white flex flex-col fixed h-full z-20 shadow-xl">
        <div className="p-6 font-bold text-xl border-b border-gray-700 flex items-center">
          <CheckCircle className="text-primary mr-2" size={20} />
          CMS Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { refreshData(); setActiveTab('articles'); }} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'articles' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Layout size={18} className="mr-3" /> All Articles
          </button>
          <button onClick={() => { setEditingArticle({}); setTagsInput(''); setActiveTab('article_editor'); }} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'article_editor' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Plus size={18} className="mr-3" /> New Article
          </button>
          <button onClick={() => setActiveTab('videos')} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'videos' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Film size={18} className="mr-3" /> Video Manager
          </button>
          <button onClick={() => setActiveTab('ads')} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'ads' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <DollarSign size={18} className="mr-3" /> Ads Manager
          </button>
          <button onClick={() => { refreshData(); setActiveTab('code_editor'); }} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'code_editor' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Code size={18} className="mr-3" /> Website Editor
          </button>
          <button onClick={() => setActiveTab('api')} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'api' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Key size={18} className="mr-3" /> API Settings
          </button>
        </nav>
        
        {/* System Tools */}
        <div className="p-4 border-t border-gray-700 space-y-2">
           <button onClick={handleSystemReset} className="w-full flex items-center p-3 rounded text-red-400 hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-900/30">
              <AlertTriangle size={18} className="mr-3" /> System Reset
           </button>
           <button onClick={handleLogout} className="w-full flex items-center p-3 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <LogOut size={18} className="mr-3" /> Logout
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 ml-64 overflow-y-auto min-h-screen">
        
        {/* ================= ARTICLES TAB ================= */}
        {activeTab === 'articles' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white">All Articles</h2>
              <button onClick={() => { setEditingArticle({}); setTagsInput(''); setActiveTab('article_editor'); }} className="bg-primary hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                <Plus size={18} className="mr-2" /> Create New
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left">
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
                        <td className="p-4 text-right space-x-2">
                          <button 
                            type="button" 
                            onClick={() => editExistingArticle(a)} 
                            className="text-blue-600 hover:text-blue-800 p-2 relative z-10" 
                            title="Edit"
                          >
                            <Edit size={18} className="pointer-events-none" />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => deleteArticle(e, a.id)} 
                            className="text-red-600 hover:text-red-800 p-2 relative z-10" 
                            title="Delete"
                          >
                            <Trash2 size={18} className="pointer-events-none" />
                          </button>
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
               <h2 className="text-3xl font-serif font-bold dark:text-white flex items-center">
                 <Film className="mr-3 text-primary" /> Video Manager
               </h2>
             </div>

             {/* Video Editor Form */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
                <h3 className="font-bold text-lg mb-4">{editingVideo.id ? 'Edit Video' : 'Add New Video'}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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

                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">Description</label>
                  <textarea 
                    className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                    value={editingVideo.description || ''}
                    onChange={e => setEditingVideo({...editingVideo, description: e.target.value})}
                    rows={2}
                  />
                </div>

                {/* Video Source Selection */}
                <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                   <h4 className="font-bold text-sm mb-3">Video Source (Choose One)</h4>
                   
                   <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                         <label className="block text-xs font-bold text-gray-500 mb-1">Option A: Paste External URL (YouTube/MP4)</label>
                         <input 
                            className="w-full p-3 border rounded dark:bg-gray-800"
                            value={editingVideo.url || ''}
                            onChange={e => setEditingVideo({...editingVideo, url: e.target.value})}
                            placeholder="https://example.com/video.mp4"
                         />
                      </div>
                      <div className="flex items-center text-gray-400 font-bold">OR</div>
                      <div className="flex-1">
                         <label className="block text-xs font-bold text-gray-500 mb-1">Option B: Upload from Device</label>
                         <div className="relative">
                           <button className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 py-3 rounded border border-dashed border-blue-400 flex justify-center items-center">
                              <Upload size={18} className="mr-2" /> Select Video File
                           </button>
                           <input 
                             type="file" 
                             accept="video/*"
                             className="absolute inset-0 opacity-0 cursor-pointer"
                             onChange={(e) => handleFileUpload(e, 'videoFile')}
                           />
                         </div>
                      </div>
                   </div>
                   {editingVideo.url && (
                     <div className="mt-2 text-xs text-green-600 font-bold break-all">
                       Source Selected: {editingVideo.url.substring(0, 50)}...
                     </div>
                   )}
                </div>

                {/* Thumbnail */}
                <div className="mb-6">
                   <label className="block text-sm font-bold mb-1">Thumbnail Image</label>
                   <div className="flex gap-4">
                      <input 
                         className="flex-1 p-2 border rounded dark:bg-gray-700"
                         value={editingVideo.thumbnailUrl || ''}
                         onChange={e => setEditingVideo({...editingVideo, thumbnailUrl: e.target.value})}
                         placeholder="Image URL"
                      />
                      <div className="relative">
                           <button className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded">
                              <Upload size={18} />
                           </button>
                           <input 
                             type="file" 
                             accept="image/*"
                             className="absolute inset-0 opacity-0 cursor-pointer"
                             onChange={(e) => handleFileUpload(e, 'videoThumbnail')}
                           />
                      </div>
                   </div>
                </div>

                <div className="flex justify-end">
                   <button 
                     onClick={saveVideoPost}
                     className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center"
                   >
                     <Save size={18} className="mr-2" /> Save Video
                   </button>
                </div>
             </div>

             {/* Video List */}
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-900 text-left text-xs uppercase text-gray-500 font-bold">
                     <tr>
                        <th className="p-4">Video</th>
                        <th className="p-4">Views</th>
                        <th className="p-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                    {videos.map(v => (
                       <tr key={v.id} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="p-4 flex items-center">
                             <div className="w-16 h-10 bg-black rounded mr-3 overflow-hidden">
                                <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                             </div>
                             <div>
                                <div className="font-bold">{v.title}</div>
                                <div className="text-xs text-gray-500">{new Date(v.publishedAt).toLocaleDateString()}</div>
                             </div>
                          </td>
                          <td className="p-4">{v.views}</td>
                          <td className="p-4 text-right space-x-2">
                             <button onClick={() => editVideo(v)} className="text-blue-500"><Edit size={18}/></button>
                             <button onClick={() => deleteVideo(v.id)} className="text-red-500"><Trash2 size={18}/></button>
                          </td>
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
             <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 py-4">
              <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white">Ads Management</h2>
              <button 
                onClick={saveAllAds}
                disabled={isSavingAds}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center transition-all disabled:opacity-70"
              >
                {isSavingAds ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={20} /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" /> Save All Ad Changes
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {ads.map(ad => (
                <div key={ad.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{ad.name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Location: {ad.location}</p>
                    </div>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-2 rounded-lg">
                       <span className={`mr-3 text-sm font-bold ${ad.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                         {ad.enabled ? 'ACTIVE' : 'DISABLED'}
                       </span>
                       <button 
                        onClick={() => handleAdChange(ad.id, 'enabled', !ad.enabled)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${ad.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                       >
                         <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${ad.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                       </button>
                    </div>
                  </div>

                  {/* Google Ads Integration */}
                  <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-3 flex items-center">
                      <Zap size={16} className="mr-2 text-yellow-500" /> 
                      Google AdMob / AdSense Config
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                          App ID / Reference (Optional)
                        </label>
                        <input 
                          type="text" 
                          placeholder="ca-app-pub-xxx~xxx"
                          className="w-full p-2 border rounded dark:bg-gray-800 text-sm font-mono"
                          value={ad.googleAppId || ''}
                          onChange={(e) => handleAdChange(ad.id, 'googleAppId', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Ad Unit ID (Required)
                        </label>
                        <input 
                          type="text" 
                          placeholder="ca-app-pub-xxx/xxx"
                          className="w-full p-2 border rounded dark:bg-gray-800 text-sm font-mono"
                          value={ad.googleAdUnitId || ''}
                          onChange={(e) => handleAdChange(ad.id, 'googleAdUnitId', e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => generateCodeFromIds(ad.id)}
                      className="mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-bold"
                    >
                      Generate Code from IDs
                    </button>
                  </div>

                  {/* Manual Code Editor */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Ad Code / HTML (Editable)
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 font-mono text-xs h-32 focus:ring-2 focus:ring-primary outline-none"
                      value={ad.code}
                      onChange={(e) => handleAdChange(ad.id, 'code', e.target.value)}
                      placeholder="Paste your AdMob / AdSense code or Image URL here..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= API SETTINGS TAB ================= */}
        {activeTab === 'api' && (
          <div className="animate-fade-in max-w-3xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white flex items-center">
                <Key className="mr-3 text-primary" /> API Settings
              </h2>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
               <div className="mb-6">
                 <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Gemini AI Configuration</h3>
                 <p className="text-gray-500 dark:text-gray-400 text-sm">
                   Manage the API key used for AI Article Generation, Code Editing, and Content Improvement features.
                 </p>
               </div>

               <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Google Gemini API Key</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full p-4 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 font-mono text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Key size={20} className="absolute left-4 top-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <CheckCircle size={12} className="mr-1 text-green-500" />
                    Updates apply immediately to all AI features.
                  </p>
               </div>

               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-8 flex items-start">
                  <AlertTriangle size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-bold mb-1">Security Note:</p>
                    <p>This key is stored locally in your browser storage. If you clear your browser data or switch devices, you may need to re-enter it. The default key will be used if this field is empty.</p>
                  </div>
               </div>

               <div className="flex justify-end">
                  <button 
                    onClick={saveApiKey}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transform hover:-translate-y-1 transition-all flex items-center"
                  >
                    <Save size={20} className="mr-2" /> Save API Key
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* ================= ARTICLE EDITOR TAB ================= */}
        {activeTab === 'article_editor' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
               <button onClick={() => setActiveTab('articles')} className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center">
                 <ArrowLeft size={20} className="mr-1"/> Back
               </button>
               <h2 className="text-2xl font-bold">{editingArticle.id ? 'Edit Article' : 'New Article'}</h2>
            </div>

            {/* AI Assistant Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 mb-8">
               <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 text-white p-2 rounded-lg mt-1">
                    <Bot size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">AI Article Assistant</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">Enter a topic and I will write a full professional article for you, including title, summary, and content.</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 p-2 border border-blue-200 dark:border-blue-700 rounded dark:bg-gray-800"
                        placeholder="e.g., SpaceX launches new satellite..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                      <button 
                        onClick={generateWithAI}
                        disabled={isAIProcessing}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50 flex items-center"
                      >
                        {isAIProcessing ? <RefreshCw className="animate-spin mr-2" size={18}/> : 'Generate'}
                      </button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Editor Form */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Article Title *</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingArticle.title || ''}
                      onChange={e => setEditingArticle({...editingArticle, title: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                    <select 
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingArticle.category || ''}
                      onChange={e => setEditingArticle({...editingArticle, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Slug (URL)</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm font-mono text-gray-600 dark:text-gray-400"
                  value={editingArticle.slug || ''}
                  onChange={e => setEditingArticle({...editingArticle, slug: e.target.value})}
                  placeholder="e.g. global-markets-rally"
                />
              </div>

              {/* SEO TAGS */}
              <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <Search size={16} className="mr-1 text-primary"/> SEO Keywords / Tags (Comma Separated)
                 </label>
                 <input 
                  type="text" 
                  className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="e.g. World News, Subhan Ahmad, Politics, Breaking"
                />
                <p className="text-xs text-gray-500 mt-1">These keywords help your article rank #1 on Google searches.</p>
              </div>

              {/* MEDIA MANAGER */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800 dark:text-white">
                  <ImageIcon className="mr-2" size={20}/> Media Manager
                </h3>

                {/* Featured Image */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Featured Image</label>
                  <div className="flex gap-4 mb-4">
                     <input 
                      type="text" 
                      className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingArticle.imageUrl || ''}
                      onChange={e => setEditingArticle({...editingArticle, imageUrl: e.target.value})}
                      placeholder="Paste Image URL"
                    />
                    <div className="relative overflow-hidden">
                       <button className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded flex items-center cursor-pointer">
                          <Upload size={16} className="mr-2" /> Upload
                       </button>
                       <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleFileUpload(e, 'imageUrl')}
                       />
                    </div>
                  </div>
                  {editingArticle.imageUrl && (
                    <div className="h-48 w-full bg-gray-100 dark:bg-gray-900 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                       <img src={editingArticle.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Gallery */}
                <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Image Gallery</label>
                   <div className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        value={tempGalleryUrl}
                        onChange={e => setTempGalleryUrl(e.target.value)}
                        placeholder="Image URL"
                      />
                      <button onClick={addGalleryUrl} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"><Plus size={16}/></button>
                      <div className="relative overflow-hidden ml-2">
                        <button className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 px-4 py-2 rounded flex items-center h-full">
                            <Upload size={16} />
                        </button>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleFileUpload(e, 'gallery')}
                        />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(editingArticle.gallery || []).map((img, idx) => (
                        <div key={idx} className="relative group rounded overflow-hidden h-24 bg-black">
                          <img src={img} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                          <button onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Videos */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Videos (Multiple)</label>
                   <div className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        value={tempVideoUrl}
                        onChange={e => setTempVideoUrl(e.target.value)}
                        placeholder="YouTube/Vimeo URL"
                      />
                      <button onClick={addVideoUrl} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"><Plus size={16}/></button>
                      <div className="relative overflow-hidden ml-2">
                         <button className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 px-4 py-2 rounded flex items-center h-full">
                            <Upload size={16} />
                         </button>
                         <input 
                           type="file" 
                           accept="video/*"
                           className="absolute inset-0 opacity-0 cursor-pointer"
                           onChange={(e) => handleFileUpload(e, 'video')}
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      {(editingArticle.videoUrls || []).map((vid, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                           <div className="flex items-center truncate mr-2">
                             <Video size={16} className="mr-2 text-gray-500" />
                             <span className="text-sm truncate max-w-xs">{vid.substring(0, 50)}...</span>
                           </div>
                           <button onClick={() => removeVideo(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                        </div>
                      ))}
                   </div>
                </div>

              </div>

              {/* Text Content */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Summary</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                  value={editingArticle.summary || ''}
                  onChange={e => setEditingArticle({...editingArticle, summary: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Content (Markdown Supported)</label>
                <textarea 
                  rows={15}
                  className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                  value={editingArticle.content || ''}
                  onChange={e => setEditingArticle({...editingArticle, content: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded"
                    checked={editingArticle.isFeatured || false}
                    onChange={e => setEditingArticle({...editingArticle, isFeatured: e.target.checked})}
                  />
                  <span className="font-bold text-gray-700 dark:text-gray-300">Featured Article</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded"
                    checked={editingArticle.isBreaking || false}
                    onChange={e => setEditingArticle({...editingArticle, isBreaking: e.target.checked})}
                  />
                  <span className="font-bold text-red-600">Breaking News</span>
                </label>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={saveArticle}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transform hover:-translate-y-1 transition-all flex items-center"
                >
                  <Save size={20} className="mr-2" /> Publish Article
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= WEBSITE EDITOR TAB (CODE) ================= */}
        {activeTab === 'code_editor' && (
          <div className="animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white flex items-center">
                <Code className="mr-3" /> Website Code Editor
              </h2>
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded text-sm flex items-center">
                 <Terminal size={16} className="mr-2" />
                 AI Powered Mode Active
              </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-[600px]">
               {/* File Explorer */}
               <div className="col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col">
                 <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-4">Project Files</h3>
                 <div className="space-y-1 flex-1 overflow-y-auto">
                   {files.map(file => (
                     <button
                       key={file.path}
                       onClick={() => handleFileSelect(file)}
                       className={`w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center ${currentFile?.path === file.path ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                     >
                       <FileCode size={16} className="mr-2" />
                       {file.name}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Editor Area */}
               <div className="col-span-9 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                 {currentFile ? (
                   <>
                     {/* Toolbar */}
                     <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                        <span className="font-mono text-sm text-gray-500">{currentFile.path}</span>
                        <div className="flex space-x-2">
                          <button onClick={() => setCurrentFile(null)} className="text-gray-500 hover:text-red-500 text-xs uppercase font-bold mr-4">Close</button>
                          <button 
                            onClick={handleSaveFile}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm flex items-center"
                          >
                            <Save size={14} className="mr-2" /> Save Changes
                          </button>
                        </div>
                     </div>

                     {/* Monaco-style Editor */}
                     <div className="flex-1 relative">
                       <textarea 
                         className="w-full h-full p-4 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] resize-none focus:outline-none leading-relaxed"
                         value={fileContent}
                         onChange={(e) => setFileContent(e.target.value)}
                         spellCheck={false}
                       />
                     </div>

                     {/* AI Code Assistant */}
                     <div className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center mb-2">
                           <Bot size={16} className="text-primary mr-2" />
                           <span className="text-xs font-bold uppercase text-gray-500">AI Code Assistant</span>
                        </div>
                        <div className="flex gap-2">
                           <input 
                             type="text" 
                             className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 text-sm"
                             placeholder="e.g., Change the background color to black, Add a button here..."
                             value={codePrompt}
                             onChange={(e) => setCodePrompt(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && handleAICodeEdit()}
                           />
                           <button 
                             onClick={handleAICodeEdit}
                             disabled={isCodeGenerating}
                             className="bg-primary hover:bg-red-800 text-white px-4 py-2 rounded text-sm font-bold flex items-center disabled:opacity-50"
                           >
                             {isCodeGenerating ? <RefreshCw className="animate-spin" size={16}/> : 'Edit Code'}
                           </button>
                        </div>
                     </div>
                   </>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                     <Code size={48} className="mb-4 opacity-20" />
                     <p>Select a file from the left sidebar to start editing.</p>
                   </div>
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