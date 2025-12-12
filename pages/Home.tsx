import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import AdUnit from '../components/AdUnit';
import SEO from '../components/SEO';
import { ArrowRight, Zap, TrendingUp, Clock, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const navigate = useNavigate();
  const { cat } = useParams<{ cat: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');

  useEffect(() => {
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
    pageTitle = `Search: "${searchQuery}"`;
  } else if (cat) {
    displayArticles = articles.filter(a => a.category.toLowerCase() === cat.toLowerCase());
    pageTitle = cat;
  }

  if (articles.length === 0) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  // --- VIEW: CATEGORY OR SEARCH PAGE ---
  if (cat || searchQuery) {
    return (
      <div className="space-y-12 animate-fade-in pb-20">
        <SEO 
          title={pageTitle} 
          description={`Latest updates in ${pageTitle} from Roza News.`}
          keywords={[cat || searchQuery || '', 'News']}
        />
        <div className="relative py-16 rounded-3xl overflow-hidden bg-dark text-white mb-8 mx-0 md:mx-4">
           <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-900/40"></div>
           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary blur-[100px] opacity-30"></div>
           <div className="relative z-10 container mx-auto px-8">
             <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2 block">Browsing Category</span>
             <h1 className="text-5xl md:text-7xl font-display font-black capitalize tracking-tight mb-4">{pageTitle}</h1>
             <p className="text-xl text-gray-300 font-light max-w-xl">Explore the latest stories, in-depth analysis, and breaking updates.</p>
           </div>
        </div>

        <div className="container mx-auto px-4">
          {displayArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  onClick={(slug) => navigate(`/article/${slug}`)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white dark:bg-dark-lighter rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <h3 className="text-2xl font-bold text-gray-400 mb-2">No stories found.</h3>
              <p className="text-gray-500 mb-6">Try searching for something else.</p>
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

  // --- VIEW: CINEMATIC HOME PAGE ---

  const featured = articles.filter(a => a.isFeatured).slice(0, 5);
  const heroMain = featured[0];
  const heroSide = featured.slice(1, 4);
  const latest = articles.slice(0, 8); 
  const business = articles.filter(a => a.category === 'Business').slice(0, 4);
  const tech = articles.filter(a => a.category === 'Technology').slice(0, 5);

  return (
    <div className="space-y-20 animate-slide-up pb-20">
      <SEO 
        title="Roza News - Global Perspectives" 
        description="Roza News is your trusted source for breaking news. Unbiased reporting from around the globe."
        keywords={['Roza News', 'Breaking News']}
      />

      {/* 1. Cinematic Hero Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] px-0 md:px-2">
        {heroMain && (
          <div 
            onClick={() => navigate(`/article/${heroMain.slug}`)}
            className="lg:col-span-8 relative rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl ring-1 ring-black/5"
          >
            <img 
              src={heroMain.imageUrl} 
              alt={heroMain.title} 
              className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
            />
            {/* Dynamic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />
            
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end items-start">
              <div className="overflow-hidden mb-4">
                 <span className="inline-block bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-primary/40 transform translate-y-0 transition-transform duration-500">
                  Top Story
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6 leading-[1.1] drop-shadow-xl max-w-4xl group-hover:text-gray-100 transition-colors">
                {heroMain.title}
              </h2>
              <div className="flex items-center gap-6 text-sm text-gray-300 font-bold tracking-wide">
                 <span className="flex items-center"><Clock size={16} className="mr-2 text-primary"/> {new Date(heroMain.publishedAt).toLocaleDateString()}</span>
                 <span className="flex items-center"><Zap size={16} className="mr-2 text-yellow-400"/> Read in 4 min</span>
              </div>
            </div>
          </div>
        )}

        <div className="lg:col-span-4 flex flex-col gap-6">
          {heroSide.map((article, idx) => (
            <div 
              key={article.id} 
              onClick={() => navigate(`/article/${article.slug}`)}
              className="flex-1 relative rounded-[1.5rem] overflow-hidden cursor-pointer group shadow-lg"
            >
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                 <span className="text-primary text-[10px] font-black uppercase tracking-widest mb-2">{article.category}</span>
                 <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 group-hover:underline decoration-primary decoration-2 underline-offset-4">{article.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AdUnit location="home_middle" />

      {/* 2. Latest Stories - Minimalist Header */}
      <section>
        <div className="flex items-end justify-between mb-10 px-2">
          <div>
             <span className="text-primary font-black uppercase tracking-widest text-xs mb-2 block">New Arrivals</span>
             <h2 className="text-4xl font-display font-black text-gray-900 dark:text-white">Latest Headlines</h2>
          </div>
          <button onClick={() => navigate('/category/World')} className="hidden md:flex items-center px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
            View Archive <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {latest.map(article => (
             <ArticleCard key={article.id} article={article} onClick={(slug) => navigate(`/article/${slug}`)} />
          ))}
        </div>
      </section>

      {/* 3. Feature Section: Tech & Business */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content (Business) */}
          <div className="lg:col-span-8">
             <div className="flex items-center mb-10">
               <div className="p-3 bg-white/10 rounded-2xl mr-4 backdrop-blur-md">
                 <TrendingUp size={24} className="text-primary"/> 
               </div>
               <h2 className="text-3xl font-display font-bold">Business & Markets</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {business.map(article => (
                 <div key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group cursor-pointer">
                    <div className="rounded-2xl overflow-hidden mb-4 relative aspect-video">
                       <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={article.title}/>
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors mb-2">{article.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{article.summary}</p>
                 </div>
               ))}
             </div>
          </div>
          
          {/* Sidebar (Trending Tech) */}
          <aside className="lg:col-span-4 pl-0 lg:pl-8 border-l border-white/10">
            <h2 className="text-2xl font-bold mb-8 font-display">Trending in Tech</h2>
            <div className="space-y-8">
               {tech.map((article, index) => (
                 <div key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="cursor-pointer group flex gap-5 items-start">
                    <span className="text-5xl font-black text-white/10 leading-none group-hover:text-primary transition-colors">{index+1}</span>
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Gadgets</span>
                      <h4 className="font-bold text-lg leading-snug group-hover:text-gray-300 transition-colors">{article.title}</h4>
                    </div>
                 </div>
               ))}
            </div>
            <button onClick={() => navigate('/category/Technology')} className="w-full mt-10 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-sm font-bold text-white transition-all flex items-center justify-center border border-white/5">
              Explore Tech World <ChevronRight size={16} className="ml-2"/>
            </button>
            <AdUnit location="article_sidebar" className="mt-8" />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;