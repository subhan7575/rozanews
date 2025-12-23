
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Article from './pages/Article';
import Weather from './pages/Weather';
import Contact from './pages/Contacts';
import About from './pages/About';
import Careers from './pages/Careers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Sitemap from './pages/Sitemap';
import Videos from './pages/Videos';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { StorageService } from './services/storageService';
import Logo from './components/Logo';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  if (!StorageService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('roza_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const startup = async () => {
       // Cloud-First Hydration: Fetching 'db/data.json' from Hugging Face
       // We use a Promise.race to ensure the splash screen doesn't stay too long
       const hydrationTask = StorageService.init();
       const timeoutTask = new Promise(resolve => setTimeout(resolve, 2500)); 
       
       await Promise.race([hydrationTask, timeoutTask]);
       setIsHydrated(true);
    };
    
    startup();

    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('roza_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('roza_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-deep flex flex-col items-center justify-center z-[9999]">
          <div className="relative flex flex-col items-center">
             {/* Main Animated Logo */}
             <div className="mb-8 transform scale-150 animate-pulse transition-all duration-1000">
                <Logo className="w-24 h-24" withText={false} />
             </div>
             
             {/* Sleek Minimalist Progress Bar */}
             <div className="w-48 h-[2px] bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-primary animate-[loading-slide_1.5s_infinite_ease-in-out]"></div>
             </div>
             
             {/* Subtle Verification Indicator */}
             <div className="mt-6 flex items-center gap-2 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-white">Establishing Core</span>
             </div>
          </div>
          
          <style>{`
            @keyframes loading-slide {
              0% { left: -100%; width: 50%; }
              50% { left: 25%; width: 75%; }
              100% { left: 100%; width: 50%; }
            }
          `}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Home /></Layout>} />
        <Route path="/article/:slug" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Article /></Layout>} />
        <Route path="/videos" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Videos /></Layout>} />
        <Route path="/weather" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Weather /></Layout>} />
        <Route path="/contact" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Contact /></Layout>} />
        <Route path="/about" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><About /></Layout>} />
        <Route path="/careers" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Careers /></Layout>} />
        <Route path="/privacy" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><PrivacyPolicy /></Layout>} />
        <Route path="/terms" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><TermsOfService /></Layout>} />
        <Route path="/sitemap" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Sitemap /></Layout>} />
        <Route path="/category/:cat" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Home /></Layout>} /> 
        <Route path="/search" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Home /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Layout isDark={isDark} toggleTheme={toggleTheme}><Profile /></Layout>} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
