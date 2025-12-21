
import React, { useState, useEffect, useRef } from 'react';
import { Article, VideoPost } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { GeminiService } from '../../../services/geminiService';
import { MediaService } from '../../../services/firebase';
import { CATEGORIES } from '../../../constants';
import { 
  Bot, Sparkles, Wand2, RefreshCw, Tag, Bold, Italic, Heading, List, Link as LinkIcon, 
  Upload, X, Video, Film, Check, Loader2, Save 
} from 'lucide-react';

interface ArticleEditorTabProps {
  initialArticle: Partial<Article>;
  onSaveComplete: () => void;
  onCancel: () => void;
  onSaveDraft: (draft: Article) => void;
}

const ArticleEditorTab: React.FC<ArticleEditorTabProps> = ({ initialArticle, onSaveComplete, onCancel, onSaveDraft }) => {
  const [editingArticle, setEditingArticle] = useState<Partial<Article>>(initialArticle);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [tagsInput, setTagsInput] = useState(initialArticle.tags?.join(', ') || '');
  const [articleVideoFile, setArticleVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'main' | 'gallery' | 'video'>('main');

  useEffect(() => {
    setEditingArticle(initialArticle);
    setTagsInput(initialArticle.tags?.join(', ') || '');
    setArticleVideoFile(null);
  }, [initialArticle]);

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('article_content_area') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selection = text.substring(start, end);
    
    let newText = "";
    if (syntax === 'bold') newText = before + `**${selection || 'bold text'}**` + after;
    if (syntax === 'italic') newText = before + `*${selection || 'italic text'}*` + after;
    if (syntax === 'h2') newText = before + `\n## ${selection || 'Heading 2'}\n` + after;
    if (syntax === 'h3') newText = before + `\n### ${selection || 'Heading 3'}\n` + after;
    if (syntax === 'list') newText = before + `\n- ${selection || 'List item'}\n` + after;
    if (syntax === 'link') newText = before + `[${selection || 'Link Text'}](url)` + after;

    setEditingArticle({ ...editingArticle, content: newText });
  };

  const handleGenerateAI = async () => { if (!aiPrompt) return alert("Enter topic."); setIsAIProcessing(true); try { const generated = await GeminiService.generateArticle(aiPrompt, editingArticle.category || 'World'); setEditingArticle(prev => ({ ...prev, ...generated })); if (generated.tags) setTagsInput(generated.tags.join(', ')); } catch (e) { alert("AI Failed"); } finally { setIsAIProcessing(false); } };
  const handleAIFix = async (type: 'grammar' | 'rewrite') => { if (!editingArticle.content) return; setIsAIProcessing(true); try { const improved = await GeminiService.improveContent(editingArticle.content, type); setEditingArticle(prev => ({ ...prev, content: improved })); } catch (e) { alert("AI Failed"); } finally { setIsAIProcessing(false); } };
  const handleAIGenerateTags = async () => { if (!editingArticle.content) return; setIsAIProcessing(true); try { const tags = await GeminiService.generateTags(editingArticle.content); setTagsInput(tags.join(', ')); } catch (e) { alert("AI Failed"); } finally { setIsAIProcessing(false); } };

  const triggerUpload = (target: 'main' | 'gallery' | 'video') => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadTarget === 'video') {
       if (!file.type.startsWith('video/')) return alert("Invalid video file");
       setArticleVideoFile(file);
       if (fileInputRef.current) fileInputRef.current.value = '';
       return;
    }

    setIsUploading(true);
    try {
       const url = await MediaService.uploadFile(file, 'images');
       if (uploadTarget === 'main') setEditingArticle(prev => ({ ...prev, imageUrl: url }));
       if (uploadTarget === 'gallery') setEditingArticle(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
    } catch (e: any) { alert(e.message); } 
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const removeGalleryImage = (index: number) => { setEditingArticle(prev => ({ ...prev, gallery: prev.gallery?.filter((_, i) => i !== index) })); };

  const handleSave = async () => {
    if (!editingArticle.title || !editingArticle.category) return alert('Title and Category required.');
    
    setIsUploading(true);
    try {
        let finalLinkedVideoId = editingArticle.linkedVideoId;

        if (articleVideoFile) {
           const videoUrl = await MediaService.uploadFile(articleVideoFile, 'videos');
           const newVideoPost: VideoPost = {
              id: 'v_' + Date.now(),
              title: editingArticle.title,
              description: editingArticle.summary || "Video coverage of " + editingArticle.title,
              url: videoUrl,
              thumbnailUrl: editingArticle.imageUrl || '',
              views: 0,
              likes: 0,
              publishedAt: new Date().toISOString(),
              tags: tagsInput.split(',').filter(Boolean),
              likedBy: [],
              comments: []
           };
           StorageService.saveVideo(newVideoPost);
           finalLinkedVideoId = newVideoPost.id;
        }

        const newArticle: Article = {
          id: editingArticle.id || Date.now().toString(),
          title: editingArticle.title,
          slug: editingArticle.slug || editingArticle.title.toLowerCase().replace(/\s+/g, '-'),
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
          gallery: editingArticle.gallery || [],
          comments: editingArticle.comments || [],
          linkedVideoId: finalLinkedVideoId
        };

        StorageService.saveArticle(newArticle);
        onSaveComplete();
    } catch (e: any) {
       alert("Error: " + e.message);
    } finally {
       setIsUploading(false);
    }
  };

  const handleDraft = () => {
     if (!editingArticle.title) return alert("Title required for draft.");
     const draft: any = {
        ...editingArticle,
        id: editingArticle.id || 'draft_' + Date.now(),
        tags: tagsInput.split(','),
        gallery: editingArticle.gallery || []
     };
     onSaveDraft(draft);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept={uploadTarget === 'video' ? "video/*" : "image/*"} />
        
        {isUploading && (
            <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <Loader2 size={48} className="animate-spin mb-4 text-primary"/>
            <h3 className="text-xl font-bold">Uploading...</h3>
            </div>
        )}

        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mb-8">
                    <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
                        <Bot size={20} /> AI Assistant
                    </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                    <input 
                        className="flex-1 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 text-sm"
                        placeholder="Enter topic..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <button onClick={handleGenerateAI} disabled={isAIProcessing} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center">
                        {isAIProcessing ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Generate
                    </button>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-indigo-200 dark:border-indigo-800/30">
                    <button onClick={() => handleAIFix('grammar')} disabled={isAIProcessing || !editingArticle.content} className="flex-1 bg-white dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 py-2 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 flex items-center justify-center gap-2"><Wand2 size={12}/> Grammar</button>
                    <button onClick={() => handleAIFix('rewrite')} disabled={isAIProcessing || !editingArticle.content} className="flex-1 bg-white dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 py-2 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 flex items-center justify-center gap-2"><RefreshCw size={12}/> Rewrite</button>
                    <button onClick={handleAIGenerateTags} disabled={isAIProcessing || !editingArticle.content} className="flex-1 bg-white dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 py-2 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 flex items-center justify-center gap-2"><Tag size={12}/> Auto Tags</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2 dark:text-white">Title</label>
                        <input className="w-full p-4 text-lg font-bold bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={editingArticle.title || ''} onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})} placeholder="Headline" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 dark:text-white">Slug</label>
                        <input className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 text-sm font-mono" value={editingArticle.slug || ''} disabled />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 dark:text-white">Summary</label>
                        <textarea className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" rows={3} value={editingArticle.summary || ''} onChange={(e) => setEditingArticle({...editingArticle, summary: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 dark:text-white">Content</label>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex gap-1">
                                <button onClick={() => insertMarkdown('bold')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><Bold size={16}/></button>
                                <button onClick={() => insertMarkdown('italic')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><Italic size={16}/></button>
                                <button onClick={() => insertMarkdown('h2')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><Heading size={16}/></button>
                                <button onClick={() => insertMarkdown('list')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><List size={16}/></button>
                                <button onClick={() => insertMarkdown('link')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><LinkIcon size={16}/></button>
                            </div>
                            <textarea id="article_content_area" className="w-full p-4 bg-gray-50 dark:bg-gray-900 outline-none dark:text-white font-mono text-sm leading-relaxed min-h-[400px]" value={editingArticle.content || ''} onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-bold mb-4 flex justify-between dark:text-white">
                            <span>Photo Gallery</span>
                            <button onClick={() => triggerUpload('gallery')} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center"><Upload size={14} className="mr-1"/> Upload</button>
                        </label>
                        <div className="grid grid-cols-4 gap-4">
                            {editingArticle.gallery?.map((img, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                                    <button onClick={() => removeGalleryImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 sticky top-4">
                <h3 className="font-bold mb-4 dark:text-white">Publishing</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                        <select className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={editingArticle.category || ''} onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}>
                            <option value="">Select Category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Main Image</label>
                        <button onClick={() => triggerUpload('main')} className="w-full p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold rounded-xl flex items-center justify-center gap-2 mb-2"><Upload size={18} /> Upload Image</button>
                        {editingArticle.imageUrl && <div className="rounded-lg overflow-hidden h-32 border border-gray-200 dark:border-gray-700"><img src={editingArticle.imageUrl} className="w-full h-full object-cover" alt="Preview"/></div>}
                    </div>

                    <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center"><Video size={14} className="mr-1"/> Companion Video</label>
                        {editingArticle.linkedVideoId ? (
                            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 p-2 rounded-lg text-green-700 dark:text-green-300 text-xs font-bold"><Check size={14}/> Video Linked</div>
                        ) : (
                            articleVideoFile ? (
                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-xs"><div className="flex items-center gap-2"><Film size={14}/> {articleVideoFile.name}</div><button onClick={() => setArticleVideoFile(null)} className="text-red-500"><X size={14}/></button></div>
                            ) : (
                                <button onClick={() => triggerUpload('video')} className="w-full p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold rounded-lg text-xs flex items-center justify-center gap-2"><Video size={14}/> Select Video</button>
                            )
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tags</label>
                        <input className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-sm" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <label className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-lg"><input type="checkbox" checked={editingArticle.isBreaking || false} onChange={(e) => setEditingArticle({...editingArticle, isBreaking: e.target.checked})} className="w-5 h-5 rounded text-primary" /><span className="text-sm font-bold dark:text-white">Breaking News</span></label>
                        <label className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-lg"><input type="checkbox" checked={editingArticle.isFeatured || false} onChange={(e) => setEditingArticle({...editingArticle, isFeatured: e.target.checked})} className="w-5 h-5 rounded text-primary" /><span className="text-sm font-bold dark:text-white">Featured</span></label>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button onClick={handleDraft} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-4 rounded-xl">Draft</button>
                        <button onClick={handleSave} className="flex-[2] bg-primary text-white font-bold py-4 rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"><Save size={18}/> Publish</button>
                    </div>
                    <button onClick={onCancel} className="w-full text-center text-sm text-gray-500 mt-2 hover:underline">Cancel</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ArticleEditorTab;