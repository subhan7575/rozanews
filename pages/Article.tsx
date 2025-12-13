import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Article as ArticleType, Comment, UserProfile } from '../types';
import AdUnit from '../components/AdUnit';
import ReactMarkdown from 'react-markdown';
import { 
  Share2, Eye, Calendar, Clock, MessageSquare, Send, 
  ChevronDown, LogIn, Volume2, StopCircle, Bookmark, 
  Type, Minus, Plus, Lock, Zap, ArrowLeft, PlayCircle, Image as ImageIcon,
  Twitter, Facebook, Linkedin, Copy
} from 'lucide-react';
import SEO from '../components/SEO';
import AuthModal from '../components/AuthModal';

const Article: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [scrollY, setScrollY] = useState(0);
  
  // UX Features State
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Comment State
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [visibleComments, setVisibleComments] = useState(5);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const navigate = useNavigate();
  const synth = window.speechSynthesis;

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    setCurrentUser(StorageService.getCurrentUser());

    if (slug) {
      const found = StorageService.getArticleBySlug(slug);
      if (found) {
        setArticle(found);
        setComments(found.comments || []);
        StorageService.incrementViews(found.id);
        setIsBookmarked(StorageService.isBookmarked(found.id));

        // Calculate Reading Time
        const wordCount = (found.content + found.summary).split(/\s+/).length;
        setReadingTime(Math.ceil(wordCount / 200));
      } else {
        navigate('/');
      }
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (synth.speaking) synth.cancel();
    };
  }, [slug, navigate]);

  // --- ACTIONS ---

  const handleBookmark = () => {
    if (article) {
      const newState = StorageService.toggleBookmark(article.id);
      setIsBookmarked(newState);
    }
  };

  const handleSpeak = () => {
    if (!article) return;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      const text = `${article.title}. ${article.summary}. ${article.content.replace(/[#*]/g, '')}`; 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      
      const voices = synth.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      synth.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleFontSize = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      if (fontSize === 'normal') setFontSize('large');
      else if (fontSize === 'large') setFontSize('xl');
    } else {
      if (fontSize === 'xl') setFontSize('large');
      else if (fontSize === 'large') setFontSize('normal');
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
    setShowShareMenu(false);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    if (!newCommentText.trim() || !article) return;

    const result = StorageService.addCommentToArticle(article.id, newCommentText);
    if (result.success && result.article) {
       setArticle(result.article);
       setComments(result.article.comments || []);
       setNewCommentText('');
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  if (!article) return <div className="min-h-screen flex items-center justify-center dark:bg-dark"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  const isLocked = article.isPremium && !currentUser?.isPremium;

  // Typography Classes
  const contentSizeClass = {
    'normal': 'prose-lg',
    'large': 'prose-xl',
    'xl': 'prose-2xl'
  }[fontSize];

  return (
    <div className="bg-white dark:bg-dark min-h-screen font-sans animate-fade-in">
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

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      {/* --- CINEMATIC HEADER --- */}
      <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
         {/* Background Image with Parallax */}
         <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ 
               backgroundImage: `url(${article.imageUrl})`,
               transform: `translateY(${scrollY * 0.4}px)` 
            }}
         />
         
         {/* Premium Overlay Gradient */}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>
         
         {/* Content Overlay */}
         <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-20 px-4">
            <div className="container mx-auto max-w-5xl">
               {/* Back Button */}
               <button 
                  onClick={() => navigate(-1)} 
                  className="absolute top-8 left-4 md:left-8 flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all text-sm font-bold border border-white/10"
               >
                  <ArrowLeft size={18} /> Back
               </button>

               {/* Tags & Category */}
               <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded uppercase tracking-widest shadow-lg shadow-primary/40">
                     {article.category}
                  </span>
                  {article.isPremium && (
                     <span className="bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded uppercase tracking-widest flex items-center gap-1">
                        <Zap size={12} fill="currentColor"/> Premium
                     </span>
                  )}
                  {article.isBreaking && (
                     <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded uppercase tracking-widest animate-pulse">
                        Breaking
                     </span>
                  )}
               </div>

               {/* Title */}
               <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-black text-white leading-[1.1] mb-8 drop-shadow-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  {article.title}
               </h1>

               {/* Meta Data */}
               <div className="flex flex-col md:flex-row md:items-center gap-6 text-white/80 text-sm font-medium border-t border-white/20 pt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">
                           {article.author.charAt(0)}
                        </div>
                     </div>
                     <div>
                        <span className="block text-white font-bold text-base leading-none mb-1">{article.author}</span>
                        <span className="text-xs opacity-70 uppercase tracking-wider">Editorial Team</span>
                     </div>
                  </div>
                  
                  <div className="hidden md:block w-px h-8 bg-white/20"></div>

                  <div className="flex flex-wrap gap-6">
                     <span className="flex items-center gap-2"><Calendar size={16} className="text-primary"/> {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                     <span className="flex items-center gap-2"><Clock size={16} className="text-blue-400"/> {readingTime} min read</span>
                     <span className="flex items-center gap-2"><Eye size={16} className="text-green-400"/> {article.views.toLocaleString()} views</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="container mx-auto px-4 max-w-6xl -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24">
         
         {/* LEFT CONTENT COLUMN */}
         <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#0b1120] rounded-t-3xl shadow-xl p-6 md:p-12 min-h-screen">
               
               {/* Sticky Action Bar (Mobile & Desktop) */}
               <div className="sticky top-4 z-30 flex items-center justify-between bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-lg rounded-full px-4 py-2 mb-10 w-fit mx-auto lg:w-full">
                  
                  {/* Left: Text Controls */}
                  <div className="flex items-center gap-2 border-r border-gray-200 dark:border-white/10 pr-4">
                     <button onClick={() => handleFontSize('decrease')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400"><Minus size={16}/></button>
                     <Type size={18} className="text-gray-400"/>
                     <button onClick={() => handleFontSize('increase')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400"><Plus size={16}/></button>
                  </div>

                  {/* Center: Audio Player */}
                  <button 
                     onClick={handleSpeak}
                     className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs md:text-sm transition-all mx-2 ${isSpeaking ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-primary text-white hover:bg-rose-700 shadow-md'}`}
                  >
                     {isSpeaking ? <StopCircle size={16} className="animate-pulse"/> : <Volume2 size={16} />}
                     <span className="hidden xs:inline">{isSpeaking ? 'Stop Listening' : 'Listen to Story'}</span>
                  </button>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-white/10">
                     <button 
                        onClick={handleBookmark} 
                        className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        title="Save Article"
                     >
                        <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                     </button>
                     
                     <div className="relative">
                        <button 
                           onClick={() => setShowShareMenu(!showShareMenu)}
                           className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-primary transition-colors"
                        >
                           <Share2 size={20} />
                        </button>
                        
                        {/* Share Dropdown */}
                        {showShareMenu && (
                           <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-2 min-w-[150px] animate-fade-in">
                              <button onClick={copyLink} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm text-gray-700 dark:text-gray-300 w-full text-left">
                                 <Copy size={16}/> Copy Link
                              </button>
                              <a 
                                 href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} 
                                 target="_blank" rel="noreferrer"
                                 className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300 w-full text-left"
                              >
                                 <Twitter size={16} className="text-blue-400"/> Twitter
                              </a>
                              <a 
                                 href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                                 target="_blank" rel="noreferrer"
                                 className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300 w-full text-left"
                              >
                                 <Facebook size={16} className="text-blue-600"/> Facebook
                              </a>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Summary (Lead) */}
               <p className="text-xl md:text-2xl font-serif text-gray-700 dark:text-gray-300 mb-10 leading-relaxed italic border-l-4 border-primary pl-6 font-light">
                  {article.summary}
               </p>

               {/* Main Content */}
               <div className={`prose ${contentSizeClass} dark:prose-invert prose-rose max-w-none font-serif text-gray-800 dark:text-gray-300 leading-loose break-words article-content relative`}>
                  
                  {isLocked ? (
                     <div className="relative">
                        <div className="blur-[3px] select-none pointer-events-none opacity-40 max-h-[500px] overflow-hidden">
                           <ReactMarkdown>{article.content}</ReactMarkdown>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-dark/80 dark:to-dark z-10 flex flex-col items-center justify-center p-8 text-center">
                           <div className="w-20 h-20 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mb-6 shadow-2xl">
                              <Lock size={36} />
                           </div>
                           <h2 className="text-3xl font-black font-display text-gray-900 dark:text-white mb-4">Premium Story</h2>
                           <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                              This in-depth reporting is exclusive to Roza Premium members. Support independent journalism.
                           </p>
                           <button 
                              onClick={() => navigate('/profile')}
                              className="bg-primary hover:bg-rose-700 text-white font-bold py-4 px-12 rounded-full shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                           >
                              <Zap size={20} fill="currentColor"/> Unlock Full Story
                           </button>
                        </div>
                     </div>
                  ) : (
                     <ReactMarkdown 
                        components={{
                           p: ({node, ...props}) => <p className="mb-8 leading-[2] text-gray-800 dark:text-gray-300" {...props} />,
                           h2: ({node, ...props}) => <h2 className="text-2xl md:text-3xl font-sans font-bold mt-12 mb-6 text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-white/5 pb-2" {...props} />,
                           h3: ({node, ...props}) => <h3 className="text-xl md:text-2xl font-sans font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />,
                           blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-6 italic text-gray-700 dark:text-gray-400 my-10 text-xl font-light bg-gray-50 dark:bg-white/5 py-4 pr-4 rounded-r-lg" {...props} />,
                           ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-8 space-y-2 marker:text-primary" {...props} />,
                           li: ({node, ...props}) => <li className="pl-2" {...props} />,
                           a: ({node, ...props}) => <a className="text-primary hover:underline font-bold transition-colors" target="_blank" rel="noopener" {...props} />,
                           img: ({node, ...props}) => <img className="w-full rounded-2xl shadow-lg my-8" {...props} />
                        }}
                     >
                        {article.content}
                     </ReactMarkdown>
                  )}
               </div>

               {/* Gallery & Video (If unlocked) */}
               {!isLocked && (
                  <div className="space-y-12 mt-16 border-t border-gray-100 dark:border-white/10 pt-12">
                     {article.videoUrls && article.videoUrls.length > 0 && (
                        <div>
                           <h3 className="text-2xl font-bold font-display mb-6 flex items-center dark:text-white"><PlayCircle className="mr-3 text-primary" /> Related Coverage</h3>
                           <div className="grid gap-6">
                              {article.videoUrls.map((url, idx) => (
                                 <div key={idx} className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                                    <iframe 
                                       width="100%" height="100%" 
                                       src={url.includes('youtu') ? url.replace('watch?v=', 'embed/') : url} 
                                       frameBorder="0" allowFullScreen title="Video"
                                    ></iframe>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {article.gallery && article.gallery.length > 0 && (
                        <div>
                           <h3 className="text-2xl font-bold font-display mb-6 flex items-center dark:text-white"><ImageIcon className="mr-3 text-secondary" /> Gallery</h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {article.gallery.map((img, idx) => (
                                 <div key={idx} className="rounded-2xl overflow-hidden shadow-md group cursor-zoom-in relative aspect-[4/3]">
                                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {/* Tags */}
               <div className="mt-12 flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                     <span key={tag} className="px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer">
                        #{tag}
                     </span>
                  ))}
               </div>

               {/* Discussion Area */}
               <div className="mt-16 pt-12 border-t border-gray-100 dark:border-white/10">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-2xl font-bold font-display dark:text-white flex items-center gap-3">
                        <MessageSquare className="text-primary"/> Discussion 
                        <span className="text-gray-400 text-lg font-normal">({comments.length})</span>
                     </h3>
                  </div>

                  {currentUser ? (
                     <form onSubmit={handlePostComment} className="mb-10">
                        <div className="flex gap-4">
                           <img src={currentUser.avatar} className="w-10 h-10 rounded-full shadow-sm" alt="User"/>
                           <div className="flex-1">
                              <textarea 
                                 className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none dark:text-white min-h-[100px] transition-all"
                                 placeholder="Add to the conversation..."
                                 value={newCommentText}
                                 onChange={(e) => setNewCommentText(e.target.value)}
                              />
                              <div className="flex justify-end mt-2">
                                 <button type="submit" disabled={!newCommentText.trim()} className="bg-primary hover:bg-rose-700 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
                                    <Send size={14}/> Post Comment
                                 </button>
                              </div>
                           </div>
                        </div>
                     </form>
                  ) : (
                     <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-8 text-center mb-10 border border-gray-100 dark:border-white/5">
                        <p className="text-gray-500 mb-4">Sign in to share your thoughts.</p>
                        <button onClick={() => setIsAuthOpen(true)} className="bg-white dark:bg-white/10 text-primary dark:text-white font-bold px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all">
                           Log In / Sign Up
                        </button>
                     </div>
                  )}

                  <div className="space-y-6">
                     {comments.slice(0, visibleComments).map(comment => (
                        <div key={comment.id} className="flex gap-4 animate-fade-in">
                           <img src={comment.userAvatar || `https://ui-avatars.com/api/?name=${comment.username}`} className="w-10 h-10 rounded-full" alt="User"/>
                           <div className="flex-1">
                              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none">
                                 <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-sm dark:text-white">{comment.username}</h4>
                                    <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                 </div>
                                 <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                     {comments.length > visibleComments && (
                        <button onClick={() => setVisibleComments(prev => prev + 5)} className="w-full py-3 text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
                           <ChevronDown size={16}/> Load More Comments
                        </button>
                     )}
                  </div>
               </div>

            </div>
         </div>

         {/* RIGHT SIDEBAR */}
         <aside className="lg:col-span-4 space-y-8">
            <AdUnit location="article_sidebar" className="sticky top-24" />
            
            {/* Trending Widget */}
            <div className="bg-white dark:bg-dark-lighter p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 sticky top-[450px]">
               <h3 className="font-bold text-lg mb-6 flex items-center gap-2 dark:text-white">
                  <span className="w-2 h-6 bg-primary rounded-full"></span> Trending Now
               </h3>
               <div className="space-y-5">
                  {StorageService.getArticles().filter(a => a.id !== article.id).slice(0, 5).map((a, i) => (
                     <div key={a.id} onClick={() => navigate(`/article/${a.slug}`)} className="flex gap-4 group cursor-pointer">
                        <span className="text-2xl font-black text-gray-200 dark:text-white/10 group-hover:text-primary transition-colors">0{i+1}</span>
                        <div>
                           <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {a.title}
                           </h4>
                           <span className="text-xs text-gray-400 mt-1 block uppercase tracking-wider">{a.category}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </aside>

      </div>
    </div>
  );
};

export default Article;