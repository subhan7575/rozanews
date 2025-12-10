import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon, CloudRain, Youtube, Facebook, Linkedin, Twitter, PlayCircle } from 'lucide-react';
import { CATEGORIES } from '../constants';
import AdUnit from './AdUnit';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  toggleTheme: () => void;
  isDark: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, toggleTheme, isDark }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdUnit location="header_top" />

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <Logo className="w-10 h-10 md:w-12 md:h-12 mr-2 group-hover:scale-105 transition-transform duration-300" withText={true} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="font-bold hover:text-primary dark:text-gray-200">Home</Link>
              <Link to="/videos" className="flex items-center hover:text-primary dark:text-gray-300">
                <PlayCircle size={16} className="mr-1" /> Videos
              </Link>
              {CATEGORIES.slice(0, 4).map(cat => (
                <Link key={cat} to={`/category/${cat}`} className="hover:text-primary dark:text-gray-300 transition-colors">
                  {cat}
                </Link>
              ))}
              <Link to="/weather" className="flex items-center hover:text-primary dark:text-gray-300">
                <CloudRain size={16} className="mr-1" /> Weather
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="hidden lg:flex relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  className="pl-3 pr-8 py-1 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm focus:outline-none focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1.5 text-gray-500 hover:text-primary">
                  <Search size={16} />
                </button>
              </form>

              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
              </button>

              <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 absolute w-full left-0 shadow-lg z-50">
            <div className="flex flex-col p-4 space-y-4">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full p-2 border rounded dark:bg-gray-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <Link to="/" className="font-bold">Home</Link>
              <Link to="/videos">Videos</Link>
              {CATEGORIES.map(cat => (
                <Link key={cat} to={`/category/${cat}`} className="border-b border-gray-100 dark:border-gray-800 pb-2">
                  {cat}
                </Link>
              ))}
              <Link to="/weather">Weather</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
        )}
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-primary text-white text-sm py-2 overflow-hidden relative whitespace-nowrap">
        <div className="inline-block animate-[marquee_20s_linear_infinite] px-4">
          <span className="mx-4 font-bold">BREAKING:</span> Global economy shows signs of strong recovery.
          <span className="mx-4">|</span>
          <span className="mx-4 font-bold">SPORTS:</span> World Cup finals location announced.
          <span className="mx-4">|</span>
          <span className="mx-4 font-bold">TECH:</span> New AI models revolutionizing journalism.
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-dark text-gray-300 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
               {/* lightText={true} ensures "ROZA" is visible against bg-dark */}
               <Logo className="w-16 h-16 text-white" withText={true} lightText={true} />
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Reliable, fast, and unbiased news from around the globe. Your trusted source for information.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Categories</h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.slice(0,5).map(c => (
                <li key={c}><Link to={`/category/${c}`} className="hover:text-primary transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Connect</h4>
            <div className="flex space-x-4 mb-4">
              {/* Social Icons */}
              <a href="#" className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-[#1877F2] transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-black transition-colors" aria-label="X (Twitter)">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-[#0A66C2] transition-colors" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a 
                href="https://www.youtube.com/channel/UCdr-XZaOGxCiBW6tY4A5b5w" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-[#FF0000] transition-colors" 
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>
        <div 
          className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500 cursor-default select-none"
          onDoubleClick={() => navigate('/login')}
          title=" "
        >
          &copy; {new Date().getFullYear()} Roza News. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;