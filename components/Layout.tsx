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
      <AdUnit location="header_top" className="hidden md:flex" />

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group z-50 relative">
              <Logo className="w-8 h-8 md:w-10 md:h-10 mr-2 group-hover:scale-105 transition-transform duration-300" withText={true} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link to="/" className="font-bold hover:text-primary dark:text-gray-200">Home</Link>
              <Link to="/videos" className="flex items-center hover:text-primary dark:text-gray-300 font-bold">
                <PlayCircle size={16} className="mr-1 text-red-600" /> Videos
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
            <div className="flex items-center space-x-2 md:space-x-4">
              <form onSubmit={handleSearch} className="hidden md:flex relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-3 pr-8 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm focus:outline-none focus:border-primary w-32 focus:w-48 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-2 text-gray-500 hover:text-primary">
                  <Search size={16} />
                </button>
              </form>

              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
              </button>

              <button className="lg:hidden p-2 z-50 relative" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-white dark:bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out lg:hidden pt-20 px-6 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col space-y-6 text-lg">
             <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-3.5 text-gray-400"><Search size={20}/></button>
              </form>
              
              <Link to="/" className="font-bold border-b dark:border-gray-800 pb-2">Home</Link>
              <Link to="/videos" className="flex items-center border-b dark:border-gray-800 pb-2"><PlayCircle size={20} className="mr-2 text-red-500"/> Videos</Link>
              
              <div className="space-y-4 pl-2">
                <span className="text-xs uppercase text-gray-500 font-bold">Categories</span>
                {CATEGORIES.map(cat => (
                  <Link key={cat} to={`/category/${cat}`} className="block hover:text-primary">
                    {cat}
                  </Link>
                ))}
              </div>
              
              <Link to="/weather" className="flex items-center"><CloudRain size={20} className="mr-2"/> Weather</Link>
              <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </header>

      {/* Responsive Breaking News Ticker */}
      <div className="bg-primary text-white text-xs md:text-sm py-2 overflow-hidden relative whitespace-nowrap">
        <div className="inline-block animate-[marquee_20s_linear_infinite] px-4">
          <span className="mx-2 md:mx-4 font-bold">BREAKING:</span> Global economy shows signs of strong recovery.
          <span className="mx-2 md:mx-4 opacity-50">|</span>
          <span className="mx-2 md:mx-4 font-bold">SPORTS:</span> World Cup finals location announced.
          <span className="mx-2 md:mx-4 opacity-50">|</span>
          <span className="mx-2 md:mx-4 font-bold">TECH:</span> New AI models revolutionizing journalism.
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-4 md:py-8">
        {children}
      </main>

      <footer className="bg-dark text-gray-300 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="mb-4">
               <Logo className="w-16 h-16 text-white" withText={true} lightText={true} />
            </div>
            <p className="text-sm text-gray-400 mt-4 leading-relaxed">
              Reliable, fast, and unbiased news from around the globe. Your trusted source for information.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Categories</h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.slice(0,5).map(c => (
                <li key={c}><Link to={`/category/${c}`} className="hover:text-primary transition-colors block py-1">{c}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary transition-colors block py-1">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors block py-1">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors block py-1">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors block py-1">Terms of Service</Link></li>
              <li><Link to="/sitemap" className="hover:text-primary transition-colors block py-1">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center hover:bg-[#1877F2] transition-colors" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center hover:bg-black transition-colors" aria-label="X"><Twitter size={20} /></a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center hover:bg-[#0A66C2] transition-colors" aria-label="LinkedIn"><Linkedin size={20} /></a>
              <a href="https://www.youtube.com/channel/UCdr-XZaOGxCiBW6tY4A5b5w" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center hover:bg-[#FF0000] transition-colors" aria-label="YouTube"><Youtube size={20} /></a>
            </div>
          </div>
        </div>
        <div 
          className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500 cursor-default select-none"
          onDoubleClick={() => navigate('/login')}
        >
          &copy; {new Date().getFullYear()} Roza News. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;