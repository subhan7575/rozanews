
import React, { useRef } from 'react';
import { Article, VideoPost } from '../types';
import { Clock, TrendingUp, Play, Video } from 'lucide-react';
import Image from './Image';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';

interface ArticleCardProps {
  article: Article;
  onClick: (slug: string) => void;
  compact?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, compact }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.linkedVideoId) {
       navigate('/videos', { state: { videoId: article.linkedVideoId } });
    } else if (article.videoUrls && article.videoUrls.length > 0) {
       navigate('/videos'); 
    }
  };

  const getLinkedVideo = (): VideoPost | undefined => {
     if (!article.linkedVideoId) return undefined;
     const videos = StorageService.getVideos();
     return videos.find(v => v.id === article.linkedVideoId);
  };

  const linkedVideo = getLinkedVideo();

  if (compact) {
    return (
      <div 
        onClick={() => onClick(article.slug)}
        className="group flex gap-5 items-center cursor-pointer p-3 rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-all duration-300"
      >
        <div className="w-28 h-20 shrink-0 overflow-hidden rounded-xl relative shadow-sm">
          <Image 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full transform group-hover:scale-110 transition-transform duration-700"
          />
          {((article.videoUrls && article.videoUrls.length > 0) || article.linkedVideoId) && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                   <Play size={10} className="text-white ml-0.5" fill="currentColor"/>
                </div>
             </div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-center gap-2 mb-1.5">
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">
               {article.category}
             </span>
             {article.isBreaking && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
          </div>
          <h3 className="font-black text-slate-950 dark:text-slate-100 text-sm md:text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 font-display">
            {article.title}
          </h3>
          <span className="text-xs text-slate-700 dark:text-slate-400 mt-1 block font-bold">
             {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group flex flex-col h-full rounded-3xl bg-white dark:bg-dark-lighter shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden relative border border-gray-100 dark:border-white/5"
    >
      <div 
        ref={scrollContainerRef}
        className="relative aspect-[4/3] overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex scrollbar-hide"
      >
        <div 
           className="w-full h-full shrink-0 snap-center relative cursor-pointer"
           onClick={() => onClick(article.slug)}
        >
           <Image 
             src={article.imageUrl} 
             alt={article.title} 
             className="w-full h-full transform group-hover:scale-105 transition-transform duration-1000 ease-out"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />
           
           <span className="absolute top-4 left-4 bg-white/95 dark:bg-black/80 backdrop-blur-md text-slate-950 dark:text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg z-10 border border-white/20 pointer-events-none">
             {article.category}
           </span>

           {linkedVideo && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white animate-pulse pointer-events-none z-20 backdrop-blur-sm border border-white/20">
                 <Video size={16} />
              </div>
           )}
        </div>

        {linkedVideo && (
           <div 
              className="w-full h-full shrink-0 snap-center relative bg-black cursor-pointer flex items-center justify-center"
              onClick={handleVideoClick}
           >
              <img 
                 src={linkedVideo.thumbnailUrl || article.imageUrl} 
                 className="w-full h-full object-cover opacity-60 hover:opacity-40 transition-all duration-500"
                 alt="Video Preview"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white group-video">
                 <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl shadow-primary/50 group-hover:scale-110 transition-transform">
                    <Play size={32} fill="currentColor" className="ml-1" />
                 </div>
                 <span className="mt-3 text-xs font-black uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">Watch Full Video</span>
              </div>
           </div>
        )}
      </div>
      
      <div 
        className="p-6 flex flex-col flex-1 relative cursor-pointer"
        onClick={() => onClick(article.slug)}
      >
        <div className="flex items-center gap-3 text-xs text-slate-800 dark:text-slate-300 mb-3 font-bold">
           <span className="flex items-center"><Clock size={12} className="mr-1" /> {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
           <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
           <span className="flex items-center text-primary"><TrendingUp size={12} className="mr-1" /> {article.views > 1000 ? (article.views/1000).toFixed(1) + 'k' : article.views}</span>
        </div>

        <h3 className="font-display font-black text-xl text-slate-950 dark:text-white leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-3 tracking-tight">
          {article.title}
        </h3>
        
        <p className="text-slate-900 dark:text-slate-200 text-sm line-clamp-2 mb-6 leading-relaxed font-semibold">
          {article.summary}
        </p>
        
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-950 dark:text-slate-300">
                 {article.author.charAt(0)}
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-slate-400">{article.author.split(' ')[0]}</span>
           </div>
           <span className="text-primary text-xs font-black uppercase tracking-wider group-hover:underline decoration-2 underline-offset-4">Read Story</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
