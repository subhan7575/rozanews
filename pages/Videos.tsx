import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { VideoPost, Comment, UserProfile } from '../types';
import SEO from '../components/SEO';
import AuthModal from '../components/AuthModal';
import Logo from '../components/Logo';
import { 
  Share2, Heart, MessageCircle, Play, Search, 
  X, Send, Music2, LogIn, ArrowLeft, Volume2, VolumeX 
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
  
  // Mute State (Crucial for Autoplay policy)
  const [isMuted, setIsMuted] = useState(true);

  // Refs for auto-play observer
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loaded = StorageService.getVideos();
    setAllVideos(loaded);
    setDisplayVideos(loaded);
    
    // Check Auth
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    
    // Check if we navigated here with a specific video ID (from Article Card)
    if (location.state && location.state.videoId) {
        // We need to wait for render then scroll
        setTimeout(() => {
           const element = document.getElementById(`video-container-${location.state.videoId}`);
           if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              // Attempt to play if muted (most browsers allow)
              const vid = videoRefs.current[location.state.videoId];
              if (vid) {
                 vid.muted = true; // Ensure muted for autoplay
                 vid.play().catch(e => console.log("Autoplay failed", e));
                 setIsMuted(true);
              }
           }
        }, 500);
    }

    // Setup Intersection Observer for auto-play
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const videoId = entry.target.getAttribute('data-video-id');
          if (videoId && videoRefs.current[videoId]) {
            if (entry.isIntersecting) {
              // Play video when visible
              videoRefs.current[videoId]?.play().catch(e => {
                console.log(`Auto-play prevented for video ${videoId}:`, e);
              });
            } else {
              // Pause video when not visible
              videoRefs.current[videoId]?.pause();
            }
          }
        });
      },
      { threshold: 0.5 } // When 50% of video is visible
    );

    // Observe all video containers
    const videoContainers = document.querySelectorAll('[data-video-id]');
    videoContainers.forEach(container => {
      observer.observe(container);
    });

    return () => {
      videoContainers.forEach(container => {
        observer.unobserve(container);
      });
      observer.disconnect();
    };
  }, [location.state]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    // Reload videos to update like status for new user
    const updatedVideos = StorageService.getVideos();
    setAllVideos(updatedVideos);
    setDisplayVideos(updatedVideos);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setDisplayVideos(allVideos);
    } else {
      const filtered = allVideos.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query) ||
        video.tags?.some(tag => tag.toLowerCase().includes(query))
      );
      setDisplayVideos(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDisplayVideos(allVideos);
  };

  const handleToggleLike = async (videoId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const result = StorageService.toggleLikeVideo(videoId);
    if (result.success && result.video) {
      // Update local state
      const updatedVideos = allVideos.map(video => 
        video.id === videoId ? result.video! : video
      );
      setAllVideos(updatedVideos);
      setDisplayVideos(displayVideos.map(video => 
        video.id === videoId ? result.video! : video
      ));
    }
  };

  const handleAddComment = (videoId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!newComment.trim()) return;

    const result = StorageService.addCommentToVideo(videoId, newComment);
    if (result.success && result.video) {
      // Update local state
      const updatedVideos = allVideos.map(video => 
        video.id === videoId ? result.video! : video
      );
      setAllVideos(updatedVideos);
      setDisplayVideos(displayVideos.map(video => 
        video.id === videoId ? result.video! : video
      ));
      
      setNewComment('');
      if (openCommentId !== videoId) {
        setOpenCommentId(videoId);
      }
    }
  };

  const handleShareVideo = (video: VideoPost) => {
    const shareUrl = `${window.location.origin}/videos/${video.id}`;
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description || 'Check out this video on Roza News',
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleVideoPlay = (videoId: string) => {
    setActiveVideoId(videoId);
    // Pause all other videos
    Object.keys(videoRefs.current).forEach(key => {
      if (key !== videoId && videoRefs.current[key]) {
        videoRefs.current[key]?.pause();
      }
    });
  };

  const handleVideoPause = (videoId: string) => {
    if (activeVideoId === videoId) {
      setActiveVideoId(null);
    }
  };

  const toggleMuteAll = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Apply to all videos
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = newMutedState;
      }
    });
  };

  const formatLikesCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-black text-white" ref={containerRef}>
      <SEO 
        title="Roza Videos" 
        description="Watch trending news videos and short documentaries"
        keywords="news videos, documentaries, trending, current affairs"
      />
      
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <Logo size="sm" />
              <h1 className="text-xl font-bold hidden md:block">Roza Videos</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative max-w-md w-full">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search videos..."
                    className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-full focus:outline-none focus:border-blue-500 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 text-gray-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Mute/Unmute Toggle */}
              <button
                onClick={toggleMuteAll}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                title={isMuted ? "Unmute all videos" : "Mute all videos"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              {/* Login/User Avatar */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar || '/default-avatar.png'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border-2 border-blue-500"
                  />
                  <span className="hidden md:inline text-sm">{currentUser.name}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition-colors"
                >
                  <LogIn size={16} />
                  <span className="hidden md:inline">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Videos Grid */}
        <div className="space-y-6 max-w-2xl mx-auto">
          {displayVideos.length === 0 ? (
            <div className="text-center py-20">
              <Music2 size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">No videos found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try a different search term' : 'No videos uploaded yet'}
              </p>
            </div>
          ) : (
            displayVideos.map(video => (
              <div
                key={video.id}
                id={`video-container-${video.id}`}
                data-video-id={video.id}
                className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800"
              >
                {/* Video Container */}
                <div className="relative aspect-[9/16] md:aspect-[16/9] bg-black">
                  <video
                    ref={el => videoRefs.current[video.id] = el}
                    src={video.videoUrl}
                    poster={video.thumbnailUrl}
                    className="w-full h-full object-contain"
                    muted={isMuted}
                    loop
                    playsInline
                    onClick={(e) => {
                      const vid = e.currentTarget;
                      if (vid.paused) {
                        vid.play();
                        handleVideoPlay(video.id);
                      } else {
                        vid.pause();
                        handleVideoPause(video.id);
                      }
                    }}
                    onPlay={() => handleVideoPlay(video.id)}
                    onPause={() => handleVideoPause(video.id)}
                  />
                  
                  {/* Play Overlay */}
                  {activeVideoId !== video.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <button 
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        onClick={() => {
                          const vid = videoRefs.current[video.id];
                          if (vid) {
                            vid.play();
                            handleVideoPlay(video.id);
                          }
                        }}
                      >
                        <Play size={32} fill="white" />
                      </button>
                    </div>
                  )}
                  
                  {/* Video Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatDate(video.createdAt || video.publishedAt || new Date().toISOString())}
                      </span>
                      <span className="text-xs text-gray-400">{video.duration || '--:--'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Like Button */}
                      <button
                        onClick={() => handleToggleLike(video.id)}
                        className="flex flex-col items-center group"
                      >
                        <div className={`p-2 rounded-full transition-colors ${
                          currentUser && video.likedBy?.includes(currentUser.id)
                            ? 'bg-red-500/20'
                            : 'hover:bg-gray-800'
                        }`}>
                          <Heart
                            size={24}
                            className={`transition-colors ${
                              currentUser && video.likedBy?.includes(currentUser.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400 group-hover:text-red-400'
                            }`}
                          />
                        </div>
                        <span className="text-xs mt-1 text-gray-400">
                          {formatLikesCount(video.likes || 0)}
                        </span>
                      </button>

                      {/* Comment Button */}
                      <button
                        onClick={() => setOpenCommentId(openCommentId === video.id ? null : video.id)}
                        className="flex flex-col items-center group"
                      >
                        <div className={`p-2 rounded-full transition-colors ${
                          openCommentId === video.id
                            ? 'bg-blue-500/20'
                            : 'hover:bg-gray-800'
                        }`}>
                          <MessageCircle
                            size={24}
                            className={`transition-colors ${
                              openCommentId === video.id
                                ? 'text-blue-500'
                                : 'text-gray-400 group-hover:text-blue-400'
                            }`}
                          />
                        </div>
                        <span className="text-xs mt-1 text-gray-400">
                          {video.comments?.length || 0}
                        </span>
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShareVideo(video)}
                        className="flex flex-col items-center group"
                      >
                        <div className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                          <Share2
                            size={24}
                            className="text-gray-400 group-hover:text-green-400 transition-colors"
                          />
                        </div>
                        <span className="text-xs mt-1 text-gray-400">Share</span>
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="hidden md:flex items-center gap-2">
                      {video.tags?.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Comments Section */}
                  {openCommentId === video.id && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="mb-4">
                        <h4 className="font-bold mb-2">Comments ({video.comments?.length || 0})</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {video.comments && video.comments.length > 0 ? (
                            video.comments.map(comment => (
                              <div key={comment.id} className="flex gap-3">
                                <img
                                  src={comment.userAvatar || '/default-avatar.png'}
                                  alt={comment.username}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{comment.username}</span>
                                    <span className="text-xs text-gray-400">
                                      {formatDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-1">{comment.text}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-400 text-center py-4">No comments yet. Be the first!</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Add Comment Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:border-blue-500 text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(video.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(video.id)}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Send size={16} />
                          <span>Post</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Videos;
