
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import AdUnit from '../components/AdUnit';
import Image from '../components/Image';
import SEO from '../components/SEO';
import { ArrowRight, Zap, TrendingUp, Clock, ChevronRight, PlusCircle, LogIn, Flame, Globe, Loader2, RefreshCw } from 'lucide-react';

const ArticleSkeleton = () => (
  <div className="bg-white dark:bg-dark-lighter rounded-3xl p-6 h-[400px] animate-pulse border border-gray-100 dark:border-white/5">
    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4"></div>
    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
    <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
    <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
    <div className="mt-auto flex justify-between">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
    </div>
  </div>
);

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { cat } = useParams<{ cat: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    const fetchInitialArticles = async () => {
       setIsLoading(true);
       const liveData = await StorageService.getArticlesPaginated(12, true);
       setArticles(liveData);
       setHasMore(liveData.length === 12);
       setIsLoading(false);
    };
    
    fetchInitialArticles();

    window.addEventListener('roza_data_updated', fetchInitialArticles);
    return () => window.removeEventListener('roza_data_updated', fetchInitialArticles);
  }, [location.key]);

  const loadMoreArticles = async () => {
     if (isMoreLoading || !hasMore) return;
     setIsMoreLoading(true);
     const moreData = await StorageService.getArticlesPaginated(6, false);
     if (moreData.length < 6) setHasMore(false);
     setArticles(prev => [...prev, ...moreData]);
     setIsMoreLoading(false);
  };

  let displayArticles = articles;
  let pageTitle = "";

  if (searchQuery) {
    displayArticles = articles.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    pageTitle = `Search: "${searchQuery}"`;
  } else if (cat) {
    displayArticles = articles.filter(a => a.category.toLowerCase() === cat.toLowerCase());
    pageTitle = cat;
  }

  if (isLoading && articles.length === 0) {
     return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => <ArticleSkeleton key={i} />)}
            </div>
        </div>
     );
  }

  if (cat || searchQuery) {
    return (
      <div className="space-y-12 animate-fade-in pb-20">
        <SEO 
          title={pageTitle} 
          description={`Latest updates in ${pageTitle} from Roza News.`}
          keywords={[cat || searchQuery || '', 'News']}
        />
        <div className="relative py-12 md:py-16 rounded-3xl overflow-hidden bg-dark text-white mb-8 mx-0 md:mx-4">
           <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-900/40"></div>
           <div className="relative z-10 container mx-auto px-6 md:px-8">
             <span className="text-primary font-bold uppercase tracking-widest text-xs md:text-sm mb-2 block">Browsing Category</span>
             <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-black capitalize tracking-tight mb-4 break-words">{pageTitle}</h1>
             <p className="text-lg md:text-xl text-slate-200 font-light max-w-xl">Explore the latest stories, in-depth analysis, and breaking updates.</p>
           </div>
        </div>

        <div className="container mx-auto px-4">
          {displayArticles.length > 0 ? (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {displayArticles.map(article => (
                        <ArticleCard 
                        key={article.id} 
                        article={article} 
                        onClick={(slug) => navigate(`/article/${slug}`)} 
                        />
                    ))}
                </div>
                {hasMore && !cat && !searchQuery && (
                    <div className="flex justify-center mt-16">
                        <button 
                            onClick={loadMoreArticles}
                            disabled={isMoreLoading}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-2xl font-black text-slate-900 dark:text-white shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 active:scale-95"
                        >
                            {isMoreLoading ? <Loader2 className="animate-spin" size={20}/> : <RefreshCw size={20}/>}
                            {isMoreLoading ? 'Loading more stories...' : 'Load More Headlines'}
                        </button>
                    </div>
                )}
            </>
          ) : (
            <div className="text-center py-24 bg-white dark:bg-dark-lighter rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <h3 className="text-2xl font-bold text-gray-500 mb-2 text-slate-900 dark:text-white">No stories found.</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Try searching for something else.</p>
              <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
                Return Home
              </button>
            </div>
          )}
        </div>
        <AdUnit location="footer_top" />
      </div>
    );
  }

  const heroArticles = articles.slice(0, 2);
  const latest = articles.slice(2); 

  return (
    <div className="space-y-16 md:space-y-20 animate-slide-up pb-20">
      <SEO 
        title="Roza News - Global Perspectives" 
        description="Roza News is your trusted source for breaking news. Unbiased reporting from around the globe."
        keywords={['Roza News', 'Breaking News']}
      />

      {heroArticles.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px] md:min-h-[600px] px-0 md:px-2">
          {heroArticles.map((article, index) => (
            <div 
              key={article.id} 
              onClick={() => navigate(`/article/${article.slug}`)}
              className="relative rounded-xl md:rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl ring-1 ring-black/5 aspect-[4/5] md:aspect-auto"
            >
              <Image 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />
              
              <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end items-start">
                <div className="overflow-hidden mb-3 md:mb-4">
                   <span className={`inline-block text-white text-[10px] md:text-xs font-black px-3 py-1 md:px-4 md:py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-primary/40 transform translate-y-0 transition-transform duration-500 ${index === 0 ? 'bg-red-600' : 'bg-blue-600'}`}>
                    {index === 0 ? <span className="flex items-center gap-1"><Flame size={12} fill="currentColor"/> Most Viewed</span> : 'Trending Now'}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white mb-4 md:mb-6 leading-tight drop-shadow-xl max-w-2xl group-hover:text-gray-100 transition-colors line-clamp-3">
                  {article.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-slate-200 font-bold tracking-wide">
                   <span className="flex items-center"><TrendingUp size={14} className="mr-2 text-primary"/> {article.views.toLocaleString()} Views</span>
                   <span className="flex items-center"><Clock size={14} className="mr-2 text-yellow-400"/> {new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <AdUnit location="home_middle" />

      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 px-2 gap-4">
          <div>
             <span className="text-primary font-black uppercase tracking-widest text-xs mb-2 block">New Arrivals</span>
             <h2 className="text-3xl md:text-4xl font-display font-black text-slate-950 dark:text-white">Latest Headlines</h2>
          </div>
          <button onClick={() => navigate('/category/World')} className="flex items-center px-6 py-3 rounded-full border border-slate-200 dark:border-gray-700 font-black text-slate-950 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-sm w-fit">
            View Archive <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {latest.map(article => (
             <ArticleCard key={article.id} article={article} onClick={(slug) => navigate(`/article/${slug}`)} />
          ))}
        </div>
        
        {hasMore && (
            <div className="flex justify-center mt-20">
                <button 
                    onClick={loadMoreArticles}
                    disabled={isMoreLoading}
                    className="group bg-white dark:bg-dark-lighter border border-gray-100 dark:border-gray-800 px-10 py-5 rounded-[2rem] font-black text-slate-950 dark:text-white shadow-xl hover:shadow-primary/10 transition-all flex items-center gap-4 active:scale-95"
                >
                    <div className={`p-2 rounded-full bg-primary/10 text-primary ${isMoreLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>
                        {isMoreLoading ? <Loader2 size={24}/> : <RefreshCw size={24}/>}
                    </div>
                    <span className="text-lg">{isMoreLoading ? 'Fetching Data...' : 'Discover More News'}</span>
                </button>
            </div>
        )}
      </section>

      <div className="bg-slate-950 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto py-12">
            <Globe size={64} className="text-primary mb-8 animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6">Stay Connected to the World</h2>
            <p className="text-xl text-slate-400 leading-relaxed font-light mb-10">
                Roza News brings you stories that matter, from corners of the globe you've never seen, delivered with absolute integrity.
            </p>
            <div className="flex gap-4">
                <button onClick={() => navigate('/about')} className="bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-slate-200 transition-colors">Our Mission</button>
                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-white/10 backdrop-blur-md text-white font-black px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">Back to Top</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
