import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { VideoPost, Comment, UserProfile } from '../types';
import SEO from '../components/SEO';
import AuthModal from '../components/AuthModal';
import { 
  Share2, Heart, MessageCircle, Play, Search, 
  X, Send, Music2, LogIn, ArrowLeft 
} from 'lucide-react';

const Videos: React.FC = () => {
  const [allVideos, setAllVideos] = useState<VideoPost[]>([]);
  const [displayVideos, setDisplayVideos] = useState<VideoPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Interaction State
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // Refs for auto-play observer
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loaded = StorageService.getVideos();
    setAllVideos(loaded);
    setDisplayVideos(loaded);
    
    // Check Auth
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    // Reload videos to update like status for new user
    const loaded = StorageService.getVideos();
    setAllVideos(loaded);
    setDisplayVideos(loaded);
  };

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayVideos(allVideos);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = allVideos.filter(v => 
        v.title.toLowerCase().includes(lower) || 
        v.tags.some(t => t.toLowerCase().includes(lower))
      );
      setDisplayVideos(filtered);
    }
  }, [searchQuery, allVideos]);

  // Intersection Observer for Auto-Play
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute('data-id');
          if (!videoId) return;
          
          const videoElement = videoRefs.current[videoId];
          
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
             setActiveVideoId(videoId);
             if (videoElement) {
                videoElement.play().catch(e => console.log("Autoplay prevented:", e));
             }
          } else {
             if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0; // Reset loop or pause
             }
          }
        });
      },
      { threshold: 0.7 } // Trigger when 70% visible
    );

    const elements = document.querySelectorAll('.tiktok-video-container');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [displayVideos]);

  // --- ACTIONS ---

  const handleLike = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const result = StorageService.toggleLikeVideo(videoId);
    if (result.success && result.video) {
       setAllVideos(prev => prev.map(v => v.id === videoId ? result.video! : v));
    }
  };

  const handleShare = async (e: React.MouseEvent, video: VideoPost) => {
    e.stopPropagation();
    if (navigator.share) {
       try {
         await navigator.share({
           title: video.title,
           text: `Check out this video on Roza News: ${video.title}`,
           url: window.location.href
         });
       } catch (e) { console.log('Share canceled'); }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCommentClick = (videoId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setOpenCommentId(videoId);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!openCommentId || !newComment.trim()) return;
    
    const result = StorageService.addCommentToVideo(openCommentId, newComment);
    if (result.success && result.video) {
      setAllVideos(prev => prev.map(v => v.id === openCommentId ? result.video! : v));
      setNewComment('');
    }
  };

  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (video) {
       if (video.paused) video.play();
       else video.pause();
    }
  };

  return (
    <div className="bg-black h-[100dvh] w-full text-white relative overflow-hidden">
      <SEO title="Trending Videos - Roza News" description="Watch viral news, tech, and sports videos." />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      {/* --- TOP NAV BAR (FULL SCREEN OVERLAY) --- */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
         {/* Back Button */}
         <button onClick={() => navigate(-1)} className="p-3 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-all text-white">
            <ArrowLeft size={24} />
         </button>

         {/* Search Bar */}
         <div className="flex-1 max-w-xs mx-4">
           <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center p-2 w-full transition-all focus-within:bg-black/60 focus-within:border-primary">
              <Search size={16} className="text-gray-300 ml-2" />
              <input 
                 type="text" 
                 placeholder="Search clips..." 
                 className="bg-transparent border-none outline-none text-white text-sm px-3 w-full placeholder-gray-400"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && <button onClick={() => setSearchQuery('')}><X size={16} className="text-gray-300 mr-2"/></button>}
           </div>
         </div>
         
         {/* Empty spacer or Profile icon could go here */}
         <div className="w-10"></div> 
      </div>

      {/* --- VIDEO FEED CONTAINER --- */}
      <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        
        {displayVideos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
             <Play size={48} className="mb-4 opacity-50"/>
             <p>No videos found.</p>
          </div>
        )}

        {displayVideos.map((video) => {
           const isLiked = currentUser ? video.likedBy.includes(currentUser.id) : false;
           
           return (
             <div 
               key={video.id} 
               data-id={video.id}
               className="tiktok-video-container snap-center relative w-full h-full bg-gray-900 overflow-hidden flex items-center justify-center"
             >
                {/* VIDEO PLAYER */}
                <video 
                   ref={(el) => { if(el) videoRefs.current[video.id] = el; }}
                   src={video.url} 
                   className="w-full h-full object-cover cursor-pointer"
                   loop
                   playsInline
                   poster={video.thumbnailUrl}
                   onClick={() => togglePlay(video.id)}
                />

                {/* OVERLAY: PLAY ICON (If paused) */}
                {videoRefs.current[video.id]?.paused && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
                      <Play size={64} className="text-white/50 animate-pulse" fill="currentColor"/>
                   </div>
                )}

                {/* OVERLAY: BOTTOM INFO */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-24">
                   <div className="flex items-end justify-between">
                      <div className="flex-1 pr-16 max-w-3xl">
                         <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm shadow-lg border border-white/20">RN</div>
                            <span className="font-bold text-base drop-shadow-md">Roza News</span>
                         </div>
                         <h3 className="font-bold text-xl leading-tight mb-2 text-shadow text-white">{video.title}</h3>
                         <p className="text-sm text-gray-200 line-clamp-3 mb-3 leading-relaxed drop-shadow">{video.description}</p>
                         <div className="flex items-center gap-2 text-xs text-gray-300 bg-black/30 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                            <Music2 size={12} className="animate-spin-slow" />
                            <span>Original Audio - Roza News</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* OVERLAY: RIGHT SIDE ACTIONS */}
                <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
                   {/* LIKE */}
                   <button onClick={(e) => handleLike(e, video.id)} className="flex flex-col items-center gap-1 group">
                      <div className={`p-3.5 rounded-full bg-black/40 backdrop-blur-md transition-transform active:scale-90 border border-white/10 ${isLiked ? 'text-red-500' : 'text-white'}`}>
                         <Heart size={30} fill={isLiked ? 'currentColor' : 'none'} />
                      </div>
                      <span className="text-xs font-bold drop-shadow-md">{video.likes}</span>
                   </button>

                   {/* COMMENT */}
                   <button onClick={() => handleCommentClick(video.id)} className="flex flex-col items-center gap-1 group">
                      <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-md text-white active:scale-90 border border-white/10">
                         <MessageCircle size={30} />
                      </div>
                      <span className="text-xs font-bold drop-shadow-md">{video.comments.length}</span>
                   </button>

                   {/* SHARE */}
                   <button onClick={(e) => handleShare(e, video)} className="flex flex-col items-center gap-1 group">
                      <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-md text-white active:scale-90 border border-white/10">
                         <Share2 size={30} />
                      </div>
                      <span className="text-xs font-bold drop-shadow-md">Share</span>
                   </button>
                   
                   {/* Spinning Disc (Aesthetic) */}
                   <div className="mt-4 w-12 h-12 rounded-full border-4 border-gray-800 bg-gray-900 overflow-hidden animate-spin-slow">
                      <img src="https://picsum.photos/50/50" className="w-full h-full object-cover opacity-80" alt="Disc" />
                   </div>
                </div>
             </div>
           );
        })}
      </div>

      {/* --- COMMENTS DRAWER (MODAL) --- */}
      {openCommentId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpenCommentId(null)}>
           <div 
             className="bg-white dark:bg-gray-900 w-full max-w-lg h-[70vh] rounded-t-3xl flex flex-col shadow-2xl animate-slide-up"
             onClick={(e) => e.stopPropagation()} 
           >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                 <div className="w-8"></div>
                 <h3 className="font-bold text-gray-900 dark:text-white">
                    {allVideos.find(v => v.id === openCommentId)?.comments.length} Comments
                 </h3>
                 <button onClick={() => setOpenCommentId(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <X size={18} className="text-gray-600 dark:text-gray-300"/>
                 </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {allVideos.find(v => v.id === openCommentId)?.comments.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">Be the first to comment!</div>
                 ) : (
                    allVideos.find(v => v.id === openCommentId)?.comments.map(comment => (
                       <div key={comment.id} className="flex gap-3 animate-fade-in">
                          <img 
                            src={comment.userAvatar || `https://ui-avatars.com/api/?name=${comment.username}&background=random`} 
                            className="w-8 h-8 rounded-full flex-shrink-0"
                            alt={comment.username} 
                          />
                          <div>
                             <div className="flex items-baseline gap-2">
                                <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.username}</span>
                                <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                             </div>
                             <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                          </div>
                       </div>
                    ))
                 )}
              </div>

              {/* Input */}
              {currentUser ? (
                <form onSubmit={handleSubmitComment} className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2 items-center bg-gray-50 dark:bg-black/20">
                   <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="Me" />
                   <input 
                      className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                   />
                   <button 
                      type="submit" 
                      disabled={!newComment.trim()}
                      className="p-2 bg-primary text-white rounded-full disabled:opacity-50 hover:bg-red-700 transition-colors"
                   >
                      <Send size={18} />
                   </button>
                </form>
              ) : (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-center">
                   <button onClick={() => { setOpenCommentId(null); setIsAuthModalOpen(true); }} className="text-primary font-bold hover:underline flex items-center justify-center w-full">
                      <LogIn size={16} className="mr-2"/> Log in to comment
                   </button>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
};

export default Videos;