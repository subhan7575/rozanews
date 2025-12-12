import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Article as ArticleType, Comment, UserProfile } from '../types';
import AdUnit from '../components/AdUnit';
import ReactMarkdown from 'react-markdown';
import { Calendar, User, Eye, Share2, PlayCircle, Image as ImageIcon, Twitter, Facebook, Linkedin, ArrowLeft, Clock, MessageSquare, Send, ChevronDown, LogIn } from 'lucide-react';
import SEO from '../components/SEO';
import AuthModal from '../components/AuthModal';

const Article: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [scrollY, setScrollY] = useState(0);
  
  // Comment State
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [visibleComments, setVisibleComments] = useState(7);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Auth Check
    setCurrentUser(StorageService.getCurrentUser());

    if (slug) {
      const found = StorageService.getArticleBySlug(slug);
      if (found) {
        setArticle(found);
        setComments(found.comments || []);
        StorageService.incrementViews(found.id);
      } else {
        navigate('/');
      }
    }
    return () => window.removeEventListener('scroll', handleScroll);
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

  if (!article) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  const renderVideo = (url: string, index: number) => {
    // ... video logic ...
    if (url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm')) {
      return (
        <video key={index} controls className="w-full rounded-2xl shadow-xl mb-8 ring-1 ring-black/10">
          <source src={url} type="video/mp4" />
        </video>
      );
    } else {
      let embedUrl = url;
      if (url.includes('youtube.com/watch?v=')) embedUrl = url.replace('watch?v=', 'embed/');
      else if (url.includes('youtu.be/')) embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');

      return (
        <div key={index} className="mb-8 aspect-video bg-black rounded-2xl overflow-hidden shadow-xl relative ring-1 ring-black/10">
           <iframe width="100%" height="100%" src={embedUrl} frameBorder="0" allowFullScreen title="Video"></iframe>
        </div>
      );
    }
  };

  return (
    <div className="animate-fade-in pb-20">
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
      
      {/* Parallax Hero Image */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
         <img 
           src={article.imageUrl} 
           alt={article.title} 
           className="w-full h-full object-cover fixed top-0 left-0 -z-10"
           style={{ transform: `translateY(${scrollY * 0.5}px)` }} // Parallax Effect
         />
         <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-dark via-black/40 to-black/30"></div>
         
         <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
            <div className="container mx-auto">
               <button onClick={() => navigate(-1)} className="mb-8 flex items-center text-white/80 hover:text-white transition-colors font-bold text-sm bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit border border-white/10">
                  <ArrowLeft size={16} className="mr-2"/> Back
               </button>
               <span className="bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg mb-6 inline-block">
                 {article.category}
               </span>
               <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-white leading-[1.1] mb-6 drop-shadow-lg max-w-5xl">
                 {article.title}
               </h1>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Social Share Sidebar (Desktop) - Sticky */}
        <div className="hidden lg:flex lg:col-span-1 flex-col items-center space-y-4 sticky top-32 h-fit pt-20">
           <button onClick={handleShare} className="w-12 h-12 rounded-full bg-white dark:bg-dark-lighter shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-500"><Share2 size={20}/></button>
           <button className="w-12 h-12 rounded-full bg-white dark:bg-dark-lighter shadow-lg flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all text-gray-500"><Twitter size={20}/></button>
           <button className="w-12 h-12 rounded-full bg-white dark:bg-dark-lighter shadow-lg flex items-center justify-center hover:bg-[#4267B2] hover:text-white transition-all text-gray-500"><Facebook size={20}/></button>
        </div>

        {/* Content Body */}
        <article className="lg:col-span-7 bg-white dark:bg-dark rounded-t-[3rem] p-6 md:p-10 shadow-2xl dark:shadow-none min-h-screen">
          
          {/* Author Meta */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-8 mb-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                   {article.author.charAt(0)}
                </div>
                <div>
                   <p className="font-bold text-gray-900 dark:text-white text-lg">{article.author}</p>
                   <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <span className="flex items-center"><Clock size={14} className="mr-1"/> 4 min read</span>
                   </div>
                </div>
             </div>
             <div className="hidden md:flex items-center text-gray-400 gap-2">
                <Eye size={18}/> {article.views}
             </div>
          </div>

          <p className="text-xl md:text-2xl font-serif text-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-light italic border-l-4 border-primary pl-6">
            {article.summary}
          </p>

          <div className="prose prose-lg dark:prose-invert prose-rose max-w-none font-serif text-gray-800 dark:text-gray-300 leading-loose">
            <ReactMarkdown components={{
              p: ({node, ...props}) => <p className="mb-6 text-lg md:text-xl leading-8 first-letter:text-5xl first-letter:font-black first-letter:text-gray-900 first-letter:dark:text-white first-letter:mr-3 first-letter:float-left" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 dark:text-white font-sans tracking-tight" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-6 italic text-gray-700 dark:text-gray-300 my-10 text-2xl font-light" {...props} />
            }}>
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Media Sections */}
          {article.videoUrls && article.videoUrls.length > 0 && (
            <div className="mt-16 pt-10 border-t border-gray-100 dark:border-white/5">
               <h3 className="text-2xl font-bold font-display mb-8 flex items-center"><PlayCircle className="mr-3 text-primary" /> Related Videos</h3>
               {article.videoUrls.map((url, idx) => renderVideo(url, idx))}
            </div>
          )}

          {article.gallery && article.gallery.length > 0 && (
            <div className="mt-16">
               <h3 className="text-2xl font-bold font-display mb-8 flex items-center"><ImageIcon className="mr-3 text-secondary" /> Gallery</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {article.gallery.map((img, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-zoom-in">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Tags */}
          <div className="mt-16 flex flex-wrap gap-3">
            {article.tags.map(tag => (
              <span key={tag} className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-all cursor-pointer border border-gray-200 dark:border-white/10">
                #{tag}
              </span>
            ))}
          </div>
          
          <AdUnit location="article_bottom" />

          {/* COMMENTS SECTION (NEW) */}
          <div className="mt-20 border-t-2 border-gray-100 dark:border-gray-800 pt-10">
             <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="text-primary" size={28} />
                <h3 className="text-2xl font-bold font-display dark:text-white">Discussion ({comments.length})</h3>
             </div>

             {/* Add Comment Input */}
             {currentUser ? (
               <form onSubmit={handlePostComment} className="flex gap-4 mb-12">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                  />
                  <div className="flex-1">
                     <textarea 
                       className="w-full bg-gray-50 dark:bg-dark-lighter border border-gray-200 dark:border-gray-700 rounded-2xl p-4 min-h-[100px] focus:ring-2 focus:ring-primary outline-none dark:text-white resize-y"
                       placeholder="Join the conversation..."
                       value={newCommentText}
                       onChange={(e) => setNewCommentText(e.target.value)}
                     ></textarea>
                     <div className="flex justify-end mt-2">
                        <button 
                          type="submit" 
                          disabled={!newCommentText.trim()}
                          className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
                        >
                           <Send size={16} className="mr-2" /> Post Comment
                        </button>
                     </div>
                  </div>
               </form>
             ) : (
               <div className="bg-gray-50 dark:bg-dark-lighter p-8 rounded-2xl text-center mb-12 border border-gray-200 dark:border-gray-800">
                  <p className="text-gray-600 dark:text-gray-400 mb-4 font-bold">Log in to share your thoughts on this story.</p>
                  <button 
                    onClick={() => setIsAuthOpen(true)}
                    className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-all shadow-lg flex items-center justify-center mx-auto"
                  >
                     <LogIn size={20} className="mr-2"/> Sign In to Comment
                  </button>
               </div>
             )}

             {/* Comments List */}
             <div className="space-y-6">
                {comments.length === 0 ? (
                   <p className="text-gray-400 text-center italic py-4">No comments yet. Be the first to start the discussion!</p>
                ) : (
                   comments.slice(0, visibleComments).map(comment => (
                      <div key={comment.id} className="flex gap-4 group animate-fade-in">
                         <div className="shrink-0">
                            <img src={comment.userAvatar || `https://ui-avatars.com/api/?name=${comment.username}`} alt={comment.username} className="w-10 h-10 rounded-full object-cover" />
                         </div>
                         <div className="flex-1">
                            <div className="bg-gray-50 dark:bg-dark-lighter p-4 rounded-2xl rounded-tl-none">
                               <div className="flex justify-between items-baseline mb-1">
                                  <span className="font-bold text-gray-900 dark:text-white text-sm">{comment.username}</span>
                                  <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                               </div>
                               <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                            </div>
                         </div>
                      </div>
                   ))
                )}
             </div>

             {/* Show More Button */}
             {comments.length > visibleComments && (
                <button 
                  onClick={() => setVisibleComments(prev => prev + 5)}
                  className="w-full mt-8 py-3 bg-gray-100 dark:bg-dark-lighter hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 transition-colors flex items-center justify-center"
                >
                   <ChevronDown size={16} className="mr-2"/> Show More Comments
                </button>
             )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-10 pt-20">
          <div className="sticky top-28">
            <AdUnit location="article_sidebar" />
            
            <div className="bg-white dark:bg-dark-lighter p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 mt-8">
              <h3 className="font-bold text-xl mb-6 font-display dark:text-white">Trending Now</h3>
              <ul className="space-y-6">
                {StorageService.getArticles().filter(a => a.id !== article?.id).slice(0, 5).map(a => (
                  <li key={a.id} className="group cursor-pointer" onClick={() => navigate(`/article/${a.slug}`)}>
                    <div className="flex gap-4">
                      <img src={a.imageUrl} className="w-20 h-20 rounded-xl object-cover shadow-md" alt={a.title} />
                      <div>
                         <span className="text-[10px] uppercase font-black text-primary mb-1 block">{a.category}</span>
                         <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">{a.title}</h4>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Article;