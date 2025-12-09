import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { Article, AdConfig, VirtualFile } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { 
  Trash2, Edit, Plus, Save, Bot, LogOut, Layout, 
  DollarSign, Code, FileCode, CheckCircle, XCircle, 
  ExternalLink, RefreshCw, Eye, ArrowLeft, Terminal,
  Image as ImageIcon, Video, Upload, X
} from 'lucide-react';
import { CATEGORIES } from '../../constants';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'articles' | 'ads' | 'article_editor' | 'code_editor'>('articles');
  
  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [files, setFiles] = useState<VirtualFile[]>([]);
  
  // Article Editor State
  const [editingArticle, setEditingArticle] = useState<Partial<Article>>({});
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Media Inputs State
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [tempGalleryUrl, setTempGalleryUrl] = useState('');

  // Code Editor State
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [codePrompt, setCodePrompt] = useState('');
  const [isCodeGenerating, setIsCodeGenerating] = useState(false);

  useEffect(() => {
    if (!StorageService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    refreshData();
  }, [navigate]);

  const refreshData = () => {
    setArticles([...StorageService.getArticles()]);
    setAds([...StorageService.getAds()]);
    setFiles([...StorageService.getFiles()]);
  };

  const handleLogout = () => {
    StorageService.logout();
    navigate('/login');
  };

  // --- ARTICLE FUNCTIONS ---

  const deleteArticle = (e: React.MouseEvent, id: string) => {
    // 1. Prevent Default & Stop Propagation immediately
    e.preventDefault();
    e.stopPropagation(); 
    
    // 2. Confirm
    if (window.confirm('PERMANENT ACTION: Are you sure you want to delete this article? It will be removed from the website immediately.')) {
      const strId = String(id);
      
      // 3. Perform Deletion in Storage
      const success = StorageService.deleteArticle(strId);
      
      if (success) {
         // 4. Update UI Instantly
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
    setActiveTab('article_editor');
  };

  const saveArticle = () => {
    // Validation
    if (!editingArticle.title || !editingArticle.title.trim()) {
      return alert('Error: Article Title is required.');
    }
    if (!editingArticle.category) {
      return alert('Error: Please select a Category.');
    }
    
    // Ensure slug exists and is valid
    let finalSlug = editingArticle.slug;
    if (!finalSlug || !finalSlug.trim()) {
      finalSlug = editingArticle.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .substring(0, 50); // limit length
    } else {
        // Clean manually entered slug
        finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

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
      // Map new media arrays
      videoUrls: editingArticle.videoUrls || [],
      gallery: editingArticle.gallery || [],
      
      views: editingArticle.views || 0,
      tags: editingArticle.tags || [],
      isBreaking: editingArticle.isBreaking || false,
      isFeatured: editingArticle.isFeatured || false,
    };

    try {
      StorageService.saveArticle(articleToSave);
      setEditingArticle({});
      setActiveTab('articles');
      refreshData();
      // Small delay to ensure the alert shows after render cycle
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
    } catch (e) {
      alert('AI Generation Failed. Please check your internet or API limits.');
    } finally {
      setIsAIProcessing(false);
    }
  };

  // --- MEDIA HANDLERS ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'gallery' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check (simulated constraint for local storage)
    if (file.size > 2 * 1024 * 1024) { // 2MB limit warning
      if(!window.confirm("This file is large (>2MB). Saving large files might fill up your browser storage quickly. Continue?")) {
        return;
      }
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


  // --- ADS FUNCTIONS ---

  const toggleAd = (id: string) => {
    const updated = ads.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    StorageService.saveAds(updated);
    setAds(updated);
  };

  const updateAdCode = (id: string, code: string) => {
    const updated = ads.map(a => a.id === id ? { ...a, code } : a);
    StorageService.saveAds(updated);
    setAds(updated);
  };

  // --- CODE EDITOR FUNCTIONS ---

  const handleFileSelect = (file: VirtualFile) => {
    setSelectedFile(file);
    setFileContent(file.content);
    setCodePrompt(''); // Reset prompt on file change
  };

  const handleSaveFile = () => {
    if (selectedFile) {
      const updatedFile = { ...selectedFile, content: fileContent };
      StorageService.saveFile(updatedFile);
      // Update local state
      const updatedFiles = StorageService.getFiles(); 
      setFiles(updatedFiles);
      setSelectedFile(updatedFiles.find(f => f.path === updatedFile.path) || updatedFile);
      alert(`File '${updatedFile.name}' saved successfully. \nNote: In this demo environment, changes are saved to browser storage. In a real app, this would deploy to the server.`);
    }
  };

  const handleAICodeEdit = async () => {
    if (!codePrompt || !selectedFile) return alert("Please enter instructions for the AI.");
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
          <button onClick={() => { setEditingArticle({}); setActiveTab('article_editor'); }} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'article_editor' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Plus size={18} className="mr-3" /> New Article
          </button>
          <button onClick={() => setActiveTab('ads')} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'ads' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <DollarSign size={18} className="mr-3" /> Ads Manager
          </button>
          <button onClick={() => { refreshData(); setActiveTab('code_editor'); }} className={`w-full flex items-center p-3 rounded transition-colors ${activeTab === 'code_editor' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
            <Code size={18} className="mr-3" /> Website Editor
          </button>
        </nav>
        <button onClick={handleLogout} className="p-4 flex items-center text-red-400 hover:text-white hover:bg-red-900/20 border-t border-gray-700 transition-colors">
          <LogOut size={18} className="mr-3" /> Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 ml-64 overflow-y-auto min-h-screen">
        
        {/* ================= ARTICLES TAB ================= */}
        {activeTab === 'articles' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white">All Articles</h2>
              <button onClick={() => { setEditingArticle({}); setActiveTab('article_editor'); }} className="bg-primary hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
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

        {/* ================= ADS MANAGER TAB ================= */}
        {activeTab === 'ads' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white">Ads Management</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {ads.map(ad => (
                <div key={ad.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{ad.name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Location: {ad.location}</p>
                    </div>
                    <div className="flex items-center">
                       <span className={`mr-2 text-sm font-bold ${ad.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                         {ad.enabled ? 'ACTIVE' : 'INACTIVE'}
                       </span>
                       <button 
                        onClick={() => toggleAd(ad.id)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${ad.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                       >
                         <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${ad.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                       </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ad Code / Image URL
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 font-mono text-sm h-24 focus:ring-2 focus:ring-primary outline-none"
                      value={ad.code}
                      onChange={(e) => updateAdCode(ad.id, e.target.value)}
                      placeholder="<script>...</script> or https://image.com/banner.jpg"
                    />
                  </div>
                </div>
              ))}
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
                       className={`w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center ${selectedFile?.path === file.path ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                     >
                       <FileCode size={16} className="mr-2" />
                       {file.name}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Editor Area */}
               <div className="col-span-9 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                 {selectedFile ? (
                   <>
                     {/* Toolbar */}
                     <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                        <span className="font-mono text-sm text-gray-500">{selectedFile.path}</span>
                        <div className="flex space-x-2">
                          <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-red-500 text-xs uppercase font-bold mr-4">Close</button>
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