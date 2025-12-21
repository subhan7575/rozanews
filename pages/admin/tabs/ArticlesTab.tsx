
import React, { useEffect, useState } from 'react';
import { StorageService } from '../../../services/storageService';
import { Article } from '../../../types';
import { PlusCircle, Trash2, MessageSquare, Lock, Video } from 'lucide-react';

interface ArticlesTabProps {
  onEdit: (article: Article) => void;
  onCreate: () => void;
}

const ArticlesTab: React.FC<ArticlesTabProps> = ({ onEdit, onCreate }) => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    refreshArticles();
  }, []);

  const refreshArticles = () => {
    setArticles(StorageService.getArticles());
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this article?")) {
      StorageService.deleteArticle(id);
      refreshArticles();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold dark:text-white">Manage Articles</h2>
            <button 
            onClick={onCreate}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-lg transition-transform hover:scale-105"
            >
            <PlusCircle size={20} className="mr-2"/> Create New
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">No articles published yet.</p>}
        {articles.map(article => (
            <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 group hover:shadow-md transition-shadow">
                <div className="h-40 relative">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                    {article.isPremium && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1 rounded-full shadow-md" title="Premium">
                        <Lock size={12} fill="currentColor" />
                    </div>
                    )}
                    {article.linkedVideoId && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-full shadow-md backdrop-blur-sm" title="Has Companion Video">
                        <Video size={14} />
                    </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={(e) => handleDelete(e, article.id)} className="bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16}/>
                    </button>
                    </div>
                </div>
                <div className="p-4">
                    <span className="text-xs font-bold text-primary uppercase">{article.category}</span>
                    <h3 className="font-bold dark:text-white line-clamp-2 mb-2 leading-tight">{article.title}</h3>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MessageSquare size={12}/> {article.comments?.length || 0}
                    </div>
                    <button onClick={() => onEdit(article)} className="text-sm font-bold text-blue-500 hover:underline">Edit & Moderate</button>
                    </div>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
};

export default ArticlesTab;
