import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Article from './pages/Article';
import Weather from './pages/Weather';
import Contact from './pages/Contact';
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(StorageService.isAuthenticated());
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Home />
          </Layout>
        } />
        
        <Route path="/article/:slug" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Article />
          </Layout>
        } />
        
        <Route path="/videos" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Videos />
          </Layout>
        } />
        
        <Route path="/weather" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Weather />
          </Layout>
        } />
        
        <Route path="/contact" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Contact />
          </Layout>
        } />
        
        <Route path="/about" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <About />
          </Layout>
        } />
        
        <Route path="/careers" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Careers />
          </Layout>
        } />
        
        <Route path="/privacy" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <PrivacyPolicy />
          </Layout>
        } />
        
        <Route path="/terms" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <TermsOfService />
          </Layout>
        } />
        
        <Route path="/sitemap" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Sitemap />
          </Layout>
        } />
        
        <Route path="/category/:cat" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Home />
          </Layout>
        } />
        
        <Route path="/search" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Home />
          </Layout>
        } />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/profile" element={
          <Layout isDark={isDark} toggleTheme={toggleTheme}>
            <Profile />
          </Layout>
        } />
        
        {/* Admin Route - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
