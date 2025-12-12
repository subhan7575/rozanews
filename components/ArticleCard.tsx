import React from 'react';
import { Article } from '../types';
import { Clock, Eye, TrendingUp, Play } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onClick: (slug: string) => void;
  compact?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, compact }) => {
  if (compact) {
    return (
      <div 
        onClick={() => onClick(article.slug)}
        className="group flex gap-5 items-center cursor-pointer p-3 rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-all duration-300"
      >
        <div className="w-28 h-20 shrink-0 overflow-hidden rounded-xl relative shadow-sm">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            loading="lazy"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          {article.videoUrls && article.videoUrls.length > 0 && (
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
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 font-display">
            {article.title}
          </h3>
          <span className="text-xs text-gray-400 mt-1 block font-medium">
             {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(article.slug)}
      className="group cursor-pointer flex flex-col h-full rounded-3xl bg-white dark:bg-dark-lighter shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden relative border border-gray-100 dark:border-white/5"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          loading="lazy"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
        
        {/* Floating Category */}
        <span className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur-md text-gray-900 dark:text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg z-10 border border-white/20">
          {article.category}
        </span>
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-1 relative">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 font-medium">
           <span className="flex items-center"><Clock size={12} className="mr-1" /> {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
           <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
           <span className="flex items-center text-primary"><TrendingUp size={12} className="mr-1" /> {article.views > 1000 ? (article.views/1000).toFixed(1) + 'k' : article.views}</span>
        </div>

        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-3">
          {article.title}
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed font-light">
          {article.summary}
        </p>
        
        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                 {article.author.charAt(0)}
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{article.author.split(' ')[0]}</span>
           </div>
           <span className="text-primary text-xs font-black uppercase tracking-wider group-hover:underline decoration-2 underline-offset-4">Read Story</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;