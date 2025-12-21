
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon, CloudRain, Youtube, Facebook, Linkedin, Twitter, PlayCircle, Globe, ChevronRight, Zap, User, LogIn, CheckCircle, AlertTriangle, ArrowUp, Settings } from 'lucide-react';
import { CATEGORIES, INITIAL_TICKER_CONFIG } from '../constants';
import AdUnit from './AdUnit';
import Logo from './Logo';
import { StorageService } from '../services/storageService';
import { UserProfile, NotificationPayload, TickerConfig } from '../types';
import AuthModal from './AuthModal';
import CookieConsent from './CookieConsent';

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
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'already' | 'error'>('idle');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const isVideoPage = location.pathname === '/videos';

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    setTickerConfig(StorageService.getTickerConfig());
    
    const handleScroll = () => {
       setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
       window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isVideoPage ? 'bg-black' : 'bg-gray-50 dark:bg-dark-deep'}`}>
      
      <CookieConsent />
      
      <button 
         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
         className={`fixed bottom-8 right-8 z-[90] p-3 rounded-full bg-primary text-white shadow-lg hover:bg-rose-700 transition-all duration-300 transform ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
      >
         <ArrowUp size={24} />
      </button>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
      
      {!isVideoPage && tickerConfig.visible && (
        <div className="bg-dark text-white text-[10px] md:text-xs py-2 overflow-hidden relative z-50 border-b border-white/5">
          <div className="container mx-auto flex items-center px-4">
             <span className="flex items-center text-primary font-black px-2 py-0.5 rounded uppercase tracking-widest mr-4 shrink-0 animate-pulse">
               <span className="w-2 h-2 rounded-full bg-primary mr-2"></span> Live Updates
             </span>
             <div className="overflow-hidden relative w-full mask-linear-fade">
               <div className="inline-block animate-[marquee_40s_linear_infinite] whitespace-nowrap">
                 {tickerConfig.content.map((item, index) => (
                   <React.Fragment key={index}>
                     <span className="mx-6 font-medium text-gray-200 hover:text-white transition-colors cursor-pointer">{item}</span>
                     <span className="mx-2 text-primary">•</span>
                   </React.Fragment>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}

      {!isVideoPage && (
        <div className="w-full px-4 mb-4 relative z-40">
          <header className="mx-auto max-w-7xl rounded-2xl bg-white dark:bg-dark-lighter shadow-md border border-gray-100 dark:border-white/5 py-3 px-6 mt-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center group">
                <Logo className="w-8 h-8 md:w-10 md:h-10 mr-3 group-hover:rotate-12 transition-transform duration-500" withText={true} />
              </Link>

              <nav className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-black/20 rounded-full p-1 border border-gray-200 dark:border-white/5">
                <Link to="/" className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${location.pathname === '/' ? 'bg-white dark:bg-primary text-black dark:text-white shadow-sm' : 'text-gray-700 dark:text-gray-400 hover:text-primary'}`}>Home</Link>
                {CATEGORIES.slice(0, 4).map(cat => (
                  <Link key={cat} to={`/category/${cat}`} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${location.pathname.includes(cat) ? 'bg-white dark:bg-primary text-black dark:text-white shadow-sm' : 'text-gray-700 dark:text-gray-400 hover:text-primary'}`}>
                    {cat}
                  </Link>
                ))}
                <Link to="/weather" className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${location.pathname === '/weather' ? 'bg-white dark:bg-primary text-black dark:text-white shadow-sm' : 'text-gray-700 dark:text-gray-400 hover:text-primary'} flex items-center`}>
                   <CloudRain size={14} className="mr-1.5"/> Weather
                </Link>
              </nav>

              <div className="flex items-center space-x-2 md:space-x-4">
                <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all">
                  {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                </button>

                {currentUser ? (
                  <div onClick={() => navigate('/profile')} className="hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                     <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover" />
                  </div>
                ) : (
                  <button onClick={() => setIsAuthOpen(true)} className="hidden md:flex items-center bg-primary hover:bg-rose-700 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg transition-all transform active:scale-95 border-0">
                     Sign In
                  </button>
                )}

                <button className="lg:hidden p-2 text-slate-950 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </header>
        </div>
      )}

      {/* --- Optimized Mobile Drawer --- */}
      {!isVideoPage && (
        <div className={`fixed inset-0 bg-white dark:bg-dark-deep z-[60] transition-all duration-500 lg:hidden flex flex-col ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <div className="p-5 flex justify-between items-center border-b border-gray-100 dark:border-white/5 shrink-0">
             <Logo className="w-8 h-8" withText={true} />
             <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-gray-100 dark:bg-white/10">
                <X size={24} className="text-slate-950 dark:text-white"/>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide flex flex-col">
              <form onSubmit={handleSearch} className="relative w-full mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search stories..."
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-white/5 rounded-2xl outline-none text-lg font-bold text-slate-950 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Main Pages</h4>
              <nav className="flex flex-col space-y-2 mb-8">
                 <Link to="/" onClick={() => setIsMenuOpen(false)} className={`flex items-center justify-between p-4 rounded-2xl text-xl font-black ${location.pathname === '/' ? 'bg-primary text-white' : 'text-slate-900 dark:text-white bg-gray-50 dark:bg-white/5'}`}>
                    Home <ChevronRight size={18} />
                 </Link>
                 <Link to="/videos" onClick={() => setIsMenuOpen(false)} className={`flex items-center justify-between p-4 rounded-2xl text-xl font-black ${location.pathname === '/videos' ? 'bg-primary text-white' : 'text-slate-900 dark:text-white bg-gray-50 dark:bg-white/5'}`}>
                    Videos <PlayCircle size={18} className="text-primary" />
                 </Link>
                 <Link to="/weather" onClick={() => setIsMenuOpen(false)} className={`flex items-center justify-between p-4 rounded-2xl text-xl font-black ${location.pathname === '/weather' ? 'bg-primary text-white' : 'text-slate-900 dark:text-white bg-gray-50 dark:bg-white/5'}`}>
                    Weather <CloudRain size={18} className="text-blue-500" />
                 </Link>
              </nav>

              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Categories</h4>
              <div className="grid grid-cols-2 gap-3 mb-10">
                 {CATEGORIES.map(cat => (
                   <Link key={cat} to={`/category/${cat}`} onClick={() => setIsMenuOpen(false)} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white border border-transparent hover:border-primary transition-colors text-center capitalize">
                      {cat}
                   </Link>
                 ))}
              </div>

              {/* Login Section - Fixed at Bottom of Menu Scroll */}
              <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5 pb-10">
                {currentUser ? (
                  <div onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 active:scale-95 transition-transform">
                    <img src={currentUser.avatar} className="w-14 h-14 rounded-full border-2 border-primary shadow-lg object-cover" alt="User" />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-lg text-slate-950 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter truncate">{currentUser.email || currentUser.phoneNumber}</p>
                    </div>
                    <Settings size={20} className="text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-3">
                     <button 
                        onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} 
                        className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                     >
                        <LogIn size={24} /> Sign In to Roza
                     </button>
                     <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Access premium stories and alerts</p>
                  </div>
                )}
              </div>
          </div>
        </div>
      )}
      
      <main className={`flex-grow ${isVideoPage ? 'w-full h-screen p-0 m-0 overflow-hidden' : 'container mx-auto px-4 py-4 md:py-8'}`}>
        {children}
      </main>

      {!isVideoPage && (
        <footer className="bg-[#020617] text-white pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-600 opacity-50"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
              <div className="lg:col-span-4 space-y-8">
                <Logo className="w-16 h-16 text-white" withText={true} lightText={true} />
                <p className="text-lg text-slate-300 leading-relaxed font-medium">
                  Roza News is the definitive voice for the modern generation. We blend cutting-edge technology with fearless journalism to bring you the truth, unfiltered.
                </p>
                <div className="flex gap-4">
                   {socialLinks.map((item, i) => (
                      <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 hover:bg-primary hover:scale-110 flex items-center justify-center transition-all duration-300 border border-white/5">
                        <item.icon size={20} className="text-white hover:text-white"/>
                      </a>
                   ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                <h4 className="text-white font-black text-lg mb-8 uppercase tracking-widest text-primary">Discover</h4>
                <ul className="space-y-4">
                  {CATEGORIES.slice(0, 5).map(c => (
                    <li key={c}><Link to={`/category/${c}`} className="text-slate-400 hover:text-white transition-colors flex items-center group font-bold"><ChevronRight size={12} className="mr-2 opacity-0 group-hover:opacity-100 transition-all"/>{c}</Link></li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-2">
                <h4 className="text-white font-black text-lg mb-8 uppercase tracking-widest text-blue-500">Company</h4>
                <ul className="space-y-4">
                  {footerLinks.map(link => (
                    <li key={link.label}><Link to={link.path} className="text-slate-400 hover:text-white transition-colors flex items-center group font-bold"><ChevronRight size={12} className="mr-2 opacity-0 group-hover:opacity-100 transition-all"/>{link.label}</Link></li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-4">
                <h4 className="text-white font-black text-lg mb-8 uppercase tracking-widest text-emerald-500">Newsletter</h4>
                <p className="text-slate-300 mb-6 leading-relaxed font-medium">Top stories delivered to your inbox every morning. Stay ahead of the curve.</p>
                <form className="relative" onSubmit={handleNewsletterSubmit}>
                   <input 
                      type="email" 
                      placeholder="Email address..." 
                      className="w-full bg-white/10 border border-white/10 rounded-xl p-4 pr-32 text-white focus:ring-2 focus:ring-primary outline-none transition-all placeholder-slate-500 font-bold" 
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                   />
                   <button type="submit" className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-rose-700 text-white font-black px-6 rounded-lg transition-all active:scale-95 shadow-lg border-0">Join</button>
                </form>
                {newsletterStatus === 'success' && <div className="text-green-400 text-sm mt-3 font-bold flex items-center gap-2"><CheckCircle size={14}/> Subscribed successfully!</div>}
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
               <p>&copy; {new Date().getFullYear()} Roza News. Digital Journalism Reimagined. Designed by <span onDoubleClick={() => navigate('/login')} className="text-slate-500 hover:text-primary transition-colors cursor-pointer" title="System Authority">Subhan Ahmad</span>.</p>
               <div className="flex gap-8 mt-6 md:mt-0">
                  <Link to="/privacy" className="hover:text-white transition-colors font-bold">Privacy</Link>
                  <Link to="/terms" className="hover:text-white transition-colors font-bold">Terms</Link>
               </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
