
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import AdUnit from '../components/AdUnit';
import Image from '../components/Image';
import SEO from '../components/SEO';
import { ArrowRight, Zap, TrendingUp, Clock, ChevronRight, PlusCircle, LogIn, Flame } from 'lucide-react';

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

  if (articles.length === 0) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-dark-deep">
           <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Zap size={48} className="text-gray-400" />
           </div>
           <h1 className="text-3xl font-black font-display text-slate-950 dark:text-white mb-2">Welcome to Roza News</h1>
           <p className="text-slate-700 dark:text-slate-400 mb-8 max-w-md">The platform is ready, but no articles have been published yet. Sign in as an admin to start creating content.</p>
           
           <div className="flex gap-4">
              <button 
                 onClick={() => navigate('/login')}
                 className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg"
              >
                 <LogIn size={20} /> Login to Admin
              </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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

  const mostViewed = [...articles].sort((a, b) => b.views - a.views);
  const heroArticles = mostViewed.slice(0, 2);
  const latest = [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 8); 
  const business = articles.filter(a => a.category === 'Business').slice(0, 4);
  const tech = articles.filter(a => a.category === 'Technology').slice(0, 5);

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
      </section>

      <div className="bg-slate-950 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
             <div className="flex items-center mb-8 md:mb-10">
               <div className="p-3 bg-white/10 rounded-2xl mr-4 backdrop-blur-md">
                 <TrendingUp size={24} className="text-primary"/> 
               </div>
               <h2 className="text-2xl md:text-3xl font-display font-black">Business & Markets</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {business.map(article => (
                 <div key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group cursor-pointer">
                    <div className="rounded-2xl overflow-hidden mb-4 relative aspect-video">
                       <Image src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={article.title}/>
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <h3 className="text-lg md:text-xl font-black leading-tight group-hover:text-primary transition-colors mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-slate-300 text-xs md:text-sm line-clamp-2 font-medium">{article.summary}</p>
                 </div>
               ))}
             </div>
          </div>
          
          <aside className="lg:col-span-4 pl-0 lg:pl-8 border-l-0 lg:border-l border-white/10 pt-8 lg:pt-0 border-t lg:border-t-0">
            <h2 className="text-2xl font-black mb-8 font-display">Trending in Tech</h2>
            <div className="space-y-6 md:space-y-8">
               {tech.map((article, index) => (
                 <div key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="cursor-pointer group flex gap-5 items-start">
                    <span className="text-4xl md:text-5xl font-black text-white/10 leading-none group-hover:text-primary transition-colors">{index+1}</span>
                    <div className="pt-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 block">Gadgets</span>
                      <h4 className="font-black text-base md:text-lg leading-snug group-hover:text-slate-300 transition-colors line-clamp-2">{article.title}</h4>
                    </div>
                 </div>
               ))}
            </div>
            <button onClick={() => navigate('/category/Technology')} className="w-full mt-10 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-sm font-black text-white transition-all flex items-center justify-center border border-white/5">
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
