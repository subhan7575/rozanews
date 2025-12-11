import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';
import { VideoPost } from '../types';
import SEO from '../components/SEO';
import { Share2, Heart, Eye, PlayCircle } from 'lucide-react';

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
         <div className="flex items-center justify-center mb-6">
            <PlayCircle className="text-primary mr-3" size={32} />
            <h1 className="text-3xl font-bold font-serif">Trending Videos</h1>
         </div>
         
         <div className="space-y-12">
            {videos.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <p>No videos uploaded yet.</p>
                <p className="text-sm">Visit Admin Panel > Video Manager to add content.</p>
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
                   
                   {/* Video Player Container */}
                   <div className="relative bg-black flex items-center justify-center">
                      <video 
                        src={video.url} 
                        controls 
                        playsInline
                        poster={video.thumbnailUrl}
                        className="w-full max-h-[80vh] object-contain"
                        preload="metadata"
                      >
                         <source src={video.url} type="video/mp4" />
                         Your browser does not support the video tag.
                      </video>
                   </div>
                   
                   {/* Info Section */}
                   <div className="p-5 bg-gradient-to-t from-gray-900 to-gray-900/90">
                      <h3 className="font-bold text-xl mb-2 text-white leading-tight">{video.title}</h3>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-4">{video.description}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-800 pt-4">
                         <div className="flex gap-6">
                            <span className="flex items-center"><Eye size={18} className="mr-2 text-blue-400"/> {video.views}</span>
                            <span className="flex items-center hover:text-red-500 cursor-pointer transition-colors"><Heart size={18} className="mr-2"/> Like</span>
                         </div>
                         <button className="flex items-center hover:text-white transition-colors">
                           <Share2 size={18} className="mr-2" /> Share
                         </button>
                      </div>
                      
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                           {video.tags.map((tag, idx) => (
                             <span key={idx} className="text-xs font-bold uppercase tracking-wider bg-gray-800 text-primary px-3 py-1 rounded-full">#{tag}</span>
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