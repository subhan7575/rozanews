import React, { useEffect, useState, useRef } from 'react';
import { StorageService } from '../services/storageService';
import { VideoPost } from '../types';
import SEO from '../components/SEO';
import { Share2, Heart, Eye } from 'lucide-react';

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<VideoPost[]>([]);

  useEffect(() => {
    setVideos(StorageService.getVideos());
  }, []);

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      <SEO 
        title="Videos - Roza News" 
        description="Watch the latest trending videos, news shorts, and reports on Roza News." 
        type="website"
      />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
         <h1 className="text-2xl font-bold mb-6 text-center font-serif text-primary">Trending Shorts & Videos</h1>
         
         <div className="space-y-8">
            {videos.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No videos uploaded yet. Check back soon!
              </div>
            ) : (
              videos.map((video) => (
                <div key={video.id} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
                   <SEO 
                     title={video.title} 
                     description={video.description} 
                     type="video" 
                     image={video.thumbnailUrl}
                     videoUrl={video.url}
                   />
                   
                   <div className="relative aspect-[9/16] md:aspect-video bg-black">
                      <video 
                        src={video.url} 
                        controls 
                        poster={video.thumbnailUrl}
                        className="w-full h-full object-contain"
                        preload="metadata"
                      />
                   </div>
                   
                   <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <h3 className="font-bold text-lg mb-1">{video.title}</h3>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-3">{video.description}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-400">
                         <div className="flex gap-4">
                            <span className="flex items-center"><Eye size={16} className="mr-1"/> {video.views}</span>
                            <span className="flex items-center hover:text-red-500 cursor-pointer transition-colors"><Heart size={16} className="mr-1"/> Like</span>
                         </div>
                         <button className="flex items-center hover:text-white transition-colors">
                           <Share2 size={16} className="mr-1" /> Share
                         </button>
                      </div>
                      
                      {video.tags && (
                        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                           {video.tags.map(tag => (
                             <span key={tag} className="text-xs bg-gray-800 text-blue-400 px-2 py-1 rounded-full">#{tag}</span>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
              ))
            )}
         </div>
      </div>
    </div>
  );
};

export default Videos;