import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon, CloudRain, Youtube, Facebook, Linkedin, Twitter, PlayCircle, Globe, ChevronRight, Zap, User, LogIn, CheckCircle, AlertTriangle } from 'lucide-react';
import { CATEGORIES, INITIAL_TICKER_CONFIG } from '../constants';
import AdUnit from './AdUnit';
import Logo from './Logo';
import { StorageService } from '../services/storageService';
import { UserProfile, NotificationPayload, TickerConfig } from '../types';
import AuthModal from './AuthModal';
// ProfileModal import removed as we now use a dedicated page

interface LayoutProps {
  children: React.ReactNode;
  toggleTheme: () => void;
  isDark: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, toggleTheme, isDark }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [tickerConfig, setTickerConfig] = useState<TickerConfig>(INITIAL_TICKER_CONFIG);
  
  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'already' | 'error'>('idle');

  // Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we are on the video feed page
  const isVideoPage = location.pathname === '/videos';

  useEffect(() => {
    // Check Auth State on mount
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    
    // Load Ticker Config
    setTickerConfig(StorageService.getTickerConfig());
    
    // --- REAL-TIME NOTIFICATION LISTENER ---
    const handleStorageEvent = (e: StorageEvent) => {
       if (e.key === 'roza_latest_broadcast' && e.newValue) {
          try {
            const payload: NotificationPayload = JSON.parse(e.newValue);
            
            // Check if current user has notifications enabled
            const freshUser = StorageService.getCurrentUser();
            if (freshUser && freshUser.notificationsEnabled) {
               
               if ('Notification' in window && Notification.permission === 'granted') {
                  // Play Sound for realism
                  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Gentle notification sound
                  audio.play().catch(err => console.log('Audio autoplay prevented', err));

                  const n = new Notification(payload.title, {
                     body: payload.body,
                     icon: '/logo.png', // Assumes a logo is available
                     silent: true // We play our own sound
                  });
                  n.onclick = () => {
                     window.focus();
                     navigate(payload.url);
                  };
               }
            }
          } catch (err) {
            console.error("Notification Error:", err);
          }
       }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [navigate]);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
     setCurrentUser(user);
     setIsAuthOpen(false);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
       const saved = StorageService.saveSubscriber(newsletterEmail);
       setNewsletterStatus(saved ? 'success' : 'already');
       setNewsletterEmail('');
       
       // Clear message after 4 seconds
       setTimeout(() => setNewsletterStatus('idle'), 4000);
    } else {
       setNewsletterStatus('error');
       setTimeout(() => setNewsletterStatus('idle'), 3000);
    }
  };

  const footerLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com" },
    { icon: Twitter, href: "https://twitter.com" },
    { icon: Linkedin, href: "https://linkedin.com" },
    { icon: Youtube, href: "https://www.youtube.com/@RozaNews.online" }
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isVideoPage ? 'bg-black' : 'bg-gray-50 dark:bg-dark'}`}>
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
      
      {/* Top Ticker - Hide on Video Page & if disabled */}
      {!isVideoPage && tickerConfig.visible && (
        <div className="bg-dark-lighter text-white text-[10px] md:text-xs py-2 overflow-hidden relative z-50 border-b border-white/5">
          <div className="container mx-auto flex items-center px-4">
             <span className="flex items-center text-primary font-black px-2 py-0.5 rounded uppercase tracking-widest mr-4 shrink-0 animate-pulse">
               <span className="w-2 h-2 rounded-full bg-primary mr-2"></span> Live Updates
             </span>
             <div className="overflow-hidden relative w-full mask-linear-fade">
               <div className="inline-block animate-[marquee_40s_linear_infinite] whitespace-nowrap">
                 {tickerConfig.content.map((item, index) => (
                   <React.Fragment key={index}>
                     <span className="mx-6 font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">{item}</span>
                     <span className="mx-2 text-primary">•</span>
                   </React.Fragment>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}

      {!isVideoPage && <AdUnit location="header_top" className="hidden md:flex bg-transparent py-4" />}

      {/* Navbar - Hide on Video Page */}
      {!isVideoPage && (
        <div className="w-full px-4 mb-8 relative z-40">
          <header 
            className="mx-auto max-w-7xl rounded-full bg-white dark:bg-dark-lighter shadow-lg border border-gray-100 dark:border-white/5 py-3 px-6"
          >
            <div className="flex justify-between items-center">
              
              {/* Logo */}
              <Link to="/" className="flex items-center group">
                <Logo className="w-8 h-8 md:w-10 md:h-10 mr-3 group-hover:rotate-12 transition-transform duration-500" withText={true} />
              </Link>

              {/* Desktop Nav - Centered Pills */}
              <nav className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-full p-1.5 border border-gray-200 dark:border-white/5">
                <Link to="/" className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${location.pathname === '/' ? 'bg-white dark:bg-primary text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}>Home</Link>
                {CATEGORIES.slice(0, 4).map(cat => (
                  <Link key={cat} to={`/category/${cat}`} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${location.pathname.includes(cat) ? 'bg-white dark:bg-primary text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}>
                    {cat}
                  </Link>
                ))}
                {/* Weather Link Added Here */}
                <Link to="/weather" className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${location.pathname === '/weather' ? 'bg-white dark:bg-primary text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'} flex items-center`}>
                   <CloudRain size={14} className="mr-1.5"/> Weather
                </Link>
              </nav>

              {/* Right Actions */}
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link to="/videos" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors" title="Videos">
                  <PlayCircle size={20} />
                </Link>
                
                <button 
                  onClick={toggleTheme} 
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all active:scale-95"
                >
                  {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                </button>

                <div className="hidden md:block relative group">
                   <button className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white shadow-lg shadow-primary/30 hover:bg-rose-700 transition-all">
                      <Search size={18} />
                   </button>
                   <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-72 transform origin-top-right z-50">
                      <form onSubmit={handleSearch} className="bg-white dark:bg-dark-lighter p-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 flex">
                         <input 
                           type="text" 
                           className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                           placeholder="Search stories..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                         />
                      </form>
                   </div>
                </div>

                {/* User Actions */}
                {currentUser ? (
                  <div 
                    onClick={() => navigate('/profile')}
                    className="hidden md:flex items-center gap-2 cursor-pointer group relative hover:opacity-80 transition-opacity"
                    title="View Profile"
                  >
                     <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover" />
                  </div>
                ) : (
                  <button 
                     onClick={() => setIsAuthOpen(true)}
                     className="hidden md:flex items-center bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                     Sign In
                  </button>
                )}

                <button className="lg:hidden p-2 text-gray-900 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </header>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {!isVideoPage && (
        <div 
          className={`fixed inset-0 bg-white/95 dark:bg-dark/95 backdrop-blur-xl z-50 transition-all duration-500 lg:hidden flex flex-col ${
            isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        >
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-white/10">
             <X size={24} className="text-gray-900 dark:text-white"/>
          </button>

          <div className="flex-1 flex flex-col justify-center px-8 space-y-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Type to search..."
                  className="w-full py-4 bg-transparent border-b-2 border-gray-200 dark:border-gray-800 outline-none text-3xl font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-0 top-4 text-gray-400" size={32}/>
              </form>
              
              <nav className="flex flex-col space-y-4">
                 <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 hover:pl-4 transition-all duration-300">Home</Link>
                 {CATEGORIES.map(cat => (
                   <Link key={cat} to={`/category/${cat}`} onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 hover:pl-4 transition-all duration-300">
                     {cat}
                   </Link>
                 ))}
                 <Link to="/weather" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300 hover:pl-4 transition-all duration-300 flex items-center">Weather <CloudRain size={32} className="ml-4"/></Link>
                 <Link to="/videos" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-primary hover:pl-4 transition-all duration-300 flex items-center">Videos <PlayCircle size={32} className="ml-4"/></Link>
              </nav>

              {currentUser ? (
                 <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                    <div className="flex items-center gap-4 mb-4" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
                       <img src={currentUser.avatar} alt="User" className="w-12 h-12 rounded-full object-cover" />
                       <div>
                          <p className="font-bold text-lg dark:text-white">{currentUser.name}</p>
                          <p className="text-sm text-gray-500">{currentUser.email || currentUser.phoneNumber}</p>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                    <button onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-xl flex items-center justify-center shadow-lg">
                       <LogIn className="mr-3" /> Sign In / Sign Up
                    </button>
                 </div>
              )}
          </div>
        </div>
      )}
      
      <main className={`flex-grow ${isVideoPage ? 'w-full h-screen p-0 m-0 overflow-hidden' : 'container mx-auto px-4 py-4'}`}>
        {children}
      </main>

      {/* Massive Premium Footer - Hide on Video Page */}
      {!isVideoPage && (
        <footer className="bg-dark text-white pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
          {/* Decorative Gradients */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[150px] opacity-10"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
              
              {/* Brand Column */}
              <div className="lg:col-span-4 space-y-8">
                <Logo className="w-20 h-20 text-white" withText={true} lightText={true} />
                <p className="text-lg text-gray-400 leading-relaxed font-light">
                  Roza News is the definitive voice for the modern generation. We blend cutting-edge technology with fearless journalism to bring you the truth, unfiltered.
                </p>
                <div className="flex gap-4">
                   {socialLinks.map((item, i) => (
                      <a 
                        key={i} 
                        href={item.href} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-12 h-12 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-all duration-300 group"
                      >
                        <item.icon size={20} className="text-gray-400 group-hover:text-white transition-colors"/>
                      </a>
                   ))}
                </div>
              </div>

              {/* Links Columns */}
              <div className="lg:col-span-2">
                <h4 className="text-white font-bold text-lg mb-8">Discover</h4>
                <ul className="space-y-4">
                  {CATEGORIES.slice(0, 5).map(c => (
                    <li key={c}>
                      <Link to={`/category/${c}`} className="text-gray-400 hover:text-primary transition-colors flex items-center group">
                        <ChevronRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"/> {c}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to="/weather" className="text-gray-400 hover:text-primary transition-colors flex items-center group">
                      <ChevronRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"/> Weather
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-2">
                <h4 className="text-white font-bold text-lg mb-8">Company</h4>
                <ul className="space-y-4">
                  {footerLinks.map(link => (
                    <li key={link.label}>
                      <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="lg:col-span-4">
                <h4 className="text-white font-bold text-lg mb-8">The Daily Briefing</h4>
                <p className="text-gray-400 mb-6">Get the top stories delivered to your inbox every morning. No spam, strictly news.</p>
                <form className="relative" onSubmit={handleNewsletterSubmit}>
                   <input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-32 text-white focus:ring-2 focus:ring-primary outline-none transition-all" 
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                   />
                   <button type="submit" className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-rose-700 text-white font-bold px-6 rounded-lg transition-colors">
                     Join
                   </button>
                </form>
                
                {/* Status Messages */}
                {newsletterStatus === 'success' && (
                   <div className="flex items-center gap-2 mt-3 text-green-400 font-bold text-sm animate-fade-in">
                      <CheckCircle size={16} /> Subscription successful!
                   </div>
                )}
                {newsletterStatus === 'already' && (
                   <div className="flex items-center gap-2 mt-3 text-yellow-400 font-bold text-sm animate-fade-in">
                      <AlertTriangle size={16} /> You are already subscribed.
                   </div>
                )}
                {newsletterStatus === 'error' && (
                   <div className="flex items-center gap-2 mt-3 text-red-400 font-bold text-sm animate-fade-in">
                      <AlertTriangle size={16} /> Please enter a valid email.
                   </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
               <p>&copy; {new Date().getFullYear()} Roza News Media Group. Designed by <span onDoubleClick={() => navigate('/login')} className="hover:text-gray-400 transition-colors cursor-pointer select-none" title="Admin Access">Subhan Ahmad</span>.</p>
               <div className="flex gap-8 mt-4 md:mt-0">
                  <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                  <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                  <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
               </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;