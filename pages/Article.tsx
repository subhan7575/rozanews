import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Article as ArticleType } from '../types';
import AdUnit from '../components/AdUnit';
import ReactMarkdown from 'react-markdown';
import { Calendar, User, Eye, Share2, PlayCircle, Image as ImageIcon } from 'lucide-react';
import SEO from '../components/SEO';

const Article: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      const found = StorageService.getArticleBySlug(slug);
      if (found) {
        setArticle(found);
        StorageService.incrementViews(found.id);
      } else {
        // Handle 404
        navigate('/');
      }
    }
  }, [slug, navigate]);

  const handleShare = async () => {
    if (!article) return;
    
    const shareData = {
      title: article.title,
      text: article.summary,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  if (!article) return <div className="min-h-screen flex items-center justify-center">Loading Article...</div>;

  // Helper to detect if a URL is an uploaded Base64 video or an embeddable link
  const renderVideo = (url: string, index: number) => {
    if (url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm')) {
      return (
        <video key={index} controls className="w-full rounded-lg shadow-lg mb-6">
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      // Assuming YouTube/Vimeo embed or standard link
      // Simple regex to fix youtube links to embeds if user pasted standard link
      let embedUrl = url;
      if (url.includes('youtube.com/watch?v=')) {
        embedUrl = url.replace('watch?v=', 'embed/');
      } else if (url.includes('youtu.be/')) {
        embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');
      }

      return (
        <div key={index} className="mb-6 aspect-video bg-black rounded-lg overflow-hidden shadow-lg relative">
           <iframe 
             width="100%" 
             height="100%" 
             src={embedUrl} 
             title={`Article Video ${index + 1}`}
             frameBorder="0"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowFullScreen
           ></iframe>
        </div>
      );
    }
  };

  return (
    <>
      <SEO 
        title={article.title}
        description={article.summary}
        image={article.imageUrl}
        keywords={article.tags}
        type="article"
        publishedAt={article.publishedAt}
        author={article.author}
        category={article.category}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-8 bg-white dark:bg-gray-800 p-6 md:p-10 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <header className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                {article.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 dark:text-white mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between border-y border-gray-200 dark:border-gray-700 py-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                <span className="flex items-center"><User size={16} className="mr-2"/> {article.author}</span>
                <span className="flex items-center"><Calendar size={16} className="mr-2"/> {new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center"><Eye size={16} className="mr-2"/> {article.views} views</span>
                <button onClick={handleShare} className="flex items-center hover:text-primary transition-colors"><Share2 size={16} className="mr-2"/> Share</button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-auto rounded-lg mb-8 shadow-md"
          />

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none font-serif text-gray-800 dark:text-gray-200 leading-loose mb-10">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {/* Video Section */}
          {article.videoUrls && article.videoUrls.length > 0 && (
            <div className="mb-10">
               <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                  <PlayCircle className="mr-2" />
                  <h3 className="text-2xl font-bold font-serif">Featured Videos</h3>
               </div>
               <div className="space-y-6">
                 {article.videoUrls.map((url, idx) => renderVideo(url, idx))}
               </div>
            </div>
          )}

          {/* Image Gallery */}
          {article.gallery && article.gallery.length > 0 && (
            <div className="mb-10">
               <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                  <ImageIcon className="mr-2" />
                  <h3 className="text-2xl font-bold font-serif">Image Gallery</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.gallery.map((img, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Tags */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-bold mb-2">Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <AdUnit location="article_bottom" />
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-24">
            <AdUnit location="article_sidebar" />
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
              <h3 className="font-bold text-xl mb-4">Related News</h3>
              {/* Mock Related */}
              <ul className="space-y-4">
                {StorageService.getArticles().slice(0, 4).map(a => (
                  <li key={a.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-2">
                    <a href={`#/article/${a.slug}`} className="hover:text-primary font-medium block">{a.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Article;