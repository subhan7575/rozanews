import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import AdUnit from '../components/AdUnit';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const navigate = useNavigate();
  const { cat } = useParams<{ cat: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    // Re-fetch articles whenever the location key changes (navigation)
    setArticles(StorageService.getArticles());
  }, [location.key]);

  // Filter Logic
  let displayArticles = articles;
  let pageTitle = "";

  if (searchQuery) {
    displayArticles = articles.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    pageTitle = `Search Results for "${searchQuery}"`;
  } else if (cat) {
    displayArticles = articles.filter(a => a.category.toLowerCase() === cat.toLowerCase());
    pageTitle = `${cat} News`;
  }

  if (articles.length === 0) return <div className="p-10 text-center">Loading Content...</div>;

  // --- VIEW: CATEGORY OR SEARCH PAGE ---
  if (cat || searchQuery) {
    return (
      <div className="space-y-8">
        <SEO 
          title={pageTitle} 
          description={`Latest updates and breaking news in ${pageTitle} from Roza News.`}
          keywords={[cat || searchQuery || '', 'News', 'Roza News']}
        />
        <div className="border-b-2 border-gray-200 dark:border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white capitalize">
            {pageTitle}
          </h1>
          <p className="text-gray-500 mt-1">{displayArticles.length} articles found</p>
        </div>

        {displayArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onClick={(slug) => navigate(`/article/${slug}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold text-gray-400">No articles found.</h3>
            <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold hover:underline">
              Go back home
            </button>
          </div>
        )}
        <AdUnit location="footer_top" />
      </div>
    );
  }

  // --- VIEW: DEFAULT HOME PAGE (MAGAZINE LAYOUT) ---

  const featured = articles.filter(a => a.isFeatured).slice(0, 3);
  const latest = articles.slice(0, 6);
  const sports = articles.filter(a => a.category === 'Sports').slice(0, 3);
  const business = articles.filter(a => a.category === 'Business').slice(0, 3);

  const heroArticle = featured[0];
  const sideFeatured = featured.slice(1, 3);

  return (
    <div className="space-y-12">
      <SEO 
        title="Roza News - Global Perspectives" 
        description="Roza News is your trusted source for breaking news, world updates, business, sports, and technology. Unbiased reporting from around the globe."
        keywords={['Roza News', 'Breaking News', 'World News', 'Subhan Ahmad', 'Live News']}
      />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {heroArticle && (
          <div 
            onClick={() => navigate(`/article/${heroArticle.slug}`)}
            className="lg:col-span-2 relative h-96 rounded-xl overflow-hidden cursor-pointer group"
          >
            <img 
              src={heroArticle.imageUrl} 
              alt={heroArticle.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
              <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded w-fit mb-2">{heroArticle.category}</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 leading-tight">{heroArticle.title}</h2>
              <p className="text-gray-200 line-clamp-2 hidden md:block">{heroArticle.summary}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {sideFeatured.map(article => (
            <div 
              key={article.id} 
              onClick={() => navigate(`/article/${article.slug}`)}
              className="relative h-44 rounded-xl overflow-hidden cursor-pointer group"
            >
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4">
                 <h3 className="text-lg font-bold text-white leading-tight">{article.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AdUnit location="home_middle" />

      {/* Latest News Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 dark:border-gray-800 pb-2">
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Latest News</h2>
          <button className="text-primary text-sm font-semibold hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latest.map(article => (
             <ArticleCard key={article.id} article={article} onClick={(slug) => navigate(`/article/${slug}`)} />
          ))}
        </div>
      </section>

      {/* Category Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
           <h2 className="text-2xl font-serif font-bold mb-4 border-l-4 border-primary pl-3">Business</h2>
           <div className="space-y-4">
             {business.map(article => (
               <ArticleCard key={article.id} article={article} onClick={(slug) => navigate(`/article/${slug}`)} compact />
             ))}
           </div>
        </section>
        
        <aside>
          <h2 className="text-2xl font-serif font-bold mb-4 border-l-4 border-secondary pl-3">Sports</h2>
          <div className="space-y-4">
             {sports.map(article => (
               <div key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="cursor-pointer group">
                  <div className="h-40 overflow-hidden rounded mb-2">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-bold group-hover:text-primary transition-colors">{article.title}</h4>
                  <span className="text-xs text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
               </div>
             ))}
          </div>
          <AdUnit location="article_sidebar" className="mt-8" />
        </aside>
      </div>
    </div>
  );
};

export default Home;