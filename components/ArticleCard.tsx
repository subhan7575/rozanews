import React from 'react';
import { Article } from '../types';
import { Clock, Eye } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onClick: (slug: string) => void;
  compact?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, compact }) => {
  return (
    <div 
      onClick={() => onClick(article.slug)}
      className={`group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${compact ? 'flex flex-row h-32' : 'flex flex-col'}`}
    >
      <div className={`${compact ? 'w-1/3' : 'w-full h-48'} overflow-hidden relative`}>
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {article.category && !compact && (
          <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
            {article.category}
          </span>
        )}
      </div>
      
      <div className={`p-4 flex flex-col justify-between ${compact ? 'w-2/3 py-2' : ''}`}>
        <div>
          <h3 className={`font-serif font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors ${compact ? 'text-sm' : 'text-xl'}`}>
            {article.title}
          </h3>
          {!compact && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
              {article.summary}
            </p>
          )}
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-auto space-x-4">
          <span className="flex items-center">
            <Clock size={12} className="mr-1" />
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
          <span className="flex items-center">
            <Eye size={12} className="mr-1" />
            {article.views.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;