
import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../../../services/storageService';
import { MediaService } from '../../../services/firebase';
import { VideoPost } from '../../../types';
import { Upload, Edit, Trash2, MessageSquare, Loader2 } from 'lucide-react';

const VideosTab: React.FC = () => {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [editingVideo, setEditingVideo] = useState<Partial<VideoPost>>({});
  const [videoTagsInput, setVideoTagsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'video' | 'thumb'>('video');

  useEffect(() => {
    refreshVideos();
  }, []);

  const refreshVideos = () => {
    setVideos(StorageService.getVideos());
  };

  const saveVideo = () => {
    if (!editingVideo.title || !editingVideo.url) return alert("Title and Video URL required");
    
    const newVideo = { 
        id: editingVideo.id || 'v_' + Date.now(), 
        title: editingVideo.title, 
        description: editingVideo.description || '', 
        url: editingVideo.url, 
        thumbnailUrl: editingVideo.thumbnailUrl || '', 
        views: editingVideo.views || 0, 
        likes: editingVideo.likes || 0, 
        publishedAt: editingVideo.publishedAt || new Date().toISOString(), 
        tags: videoTagsInput.split(',').filter(Boolean), 
        likedBy: editingVideo.likedBy || [], 
        comments: editingVideo.comments || [] 
    } as VideoPost; 
    
    StorageService.saveVideo(newVideo);
    setEditingVideo({}); 
    setVideoTagsInput(''); 
    refreshVideos();
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Delete video?")) { 
        StorageService.deleteVideo(id); 
        refreshVideos(); 
    }
  };

  const handleEdit = (video: VideoPost) => {
    setEditingVideo(video);
    setVideoTagsInput(video.tags.join(', '));
    window.scrollTo(0, 0);
  };

  const triggerUpload = (target: 'video' | 'thumb') => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
        const folder = uploadTarget === 'video' ? 'videos' : 'images';
        const url = await MediaService.uploadFile(file, folder);
        if (uploadTarget === 'video') setEditingVideo(prev => ({ ...prev, url }));
        else setEditingVideo(prev => ({ ...prev, thumbnailUrl: url }));
    } catch (e: any) { alert(e.message); }
    finally { setIsUploading(false); if(fileInputRef.current) fileInputRef.current.value = ''; }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept={uploadTarget === 'video' ? "video/*" : "image/*"} />
        
        {isUploading && (
            <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 size={48} className="animate-spin mb-4 text-primary"/>
                <h3 className="text-xl font-bold">Uploading Media...</h3>
            </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">{editingVideo.id ? 'Edit Video' : 'Add New Video Clip'}</h3>
                {editingVideo.id && <button onClick={() => { setEditingVideo({}); setVideoTagsInput(''); }} className="text-sm text-red-500 font-bold hover:underline">Cancel Edit</button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                    <input className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={editingVideo.title || ''} onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })} placeholder="Viral Title..." />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Video File</label>
                    <div className="flex gap-2">
                    <input className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={editingVideo.url || ''} onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })} placeholder="https://..." />
                    </div>
                    <button onClick={() => triggerUpload('video')} className="mt-2 w-full p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"><Upload size={18}/> Upload Video</button>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" rows={3} value={editingVideo.description || ''} onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })} placeholder="Brief description..." />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thumbnail</label>
                    <input className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={editingVideo.thumbnailUrl || ''} onChange={(e) => setEditingVideo({ ...editingVideo, thumbnailUrl: e.target.value })} placeholder="https://..." />
                    <button onClick={() => triggerUpload('thumb')} className="mt-2 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold text-xs">Upload Thumbnail</button>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                    <input className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={videoTagsInput} onChange={(e) => setVideoTagsInput(e.target.value)} placeholder="News, Tech, Viral" />
                </div>
            </div>
            <button onClick={saveVideo} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg">{editingVideo.id ? 'Update Video' : 'Publish Video'}</button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
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
                            <div className="text-xs opacity-70 flex items-center gap-1"><MessageSquare size={10} /> {video.comments?.length || 0} comments</div>
                        </td>
                        <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(video)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(video.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 size={16}/></button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default VideosTab;
