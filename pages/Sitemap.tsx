import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Article } from '../types';
import { CATEGORIES } from '../constants';
import SEO from '../components/SEO';

const Sitemap: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setArticles(StorageService.getArticles());
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <SEO 
        title="HTML Sitemap" 
        description="Complete list of pages, categories, and articles on Roza News." 
        keywords={['Sitemap', 'Archive', 'Roza News']}
      />
      
      <h1 className="text-3xl font-serif font-bold mb-8 dark:text-white">Site Index (Sitemap)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Pages */}
        <div>
          <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 dark:text-gray-200">Main Pages</h2>
          <ul className="space-y-2">
            <li><Link to="/" className="text-blue-600 hover:underline">Home</Link></li>
            <li><Link to="/about" className="text-blue-600 hover:underline">About Us</Link></li>
            <li><Link to="/contact" className="text-blue-600 hover:underline">Contact Us</Link></li>
            <li><Link to="/weather" className="text-blue-600 hover:underline">Weather</Link></li>
            <li><Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 dark:text-gray-200">Categories</h2>
          <ul className="space-y-2">
            {CATEGORIES.map(cat => (
              <li key={cat}>
                <Link to={`/category/${cat}`} className="text-blue-600 hover:underline">{cat}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Articles */}
        <div>
          <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 dark:text-gray-200">Recent Articles</h2>
          <ul className="space-y-2">
            {articles.map(article => (
              <li key={article.id}>
                <Link to={`/article/${article.slug}`} className="text-blue-600 hover:underline block truncate">
                  {article.title}
                </Link>
                <span className="text-xs text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;