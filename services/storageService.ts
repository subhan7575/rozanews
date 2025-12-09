import { Article, AdConfig, VirtualFile } from '../types';
import { INITIAL_ARTICLES, INITIAL_ADS, INITIAL_PROJECT_FILES } from '../constants';

const KEYS = {
  ARTICLES: 'roza_articles',
  ADS: 'roza_ads',
  AUTH: 'roza_auth',
  FILES: 'roza_project_files'
};

// Initialize DB
const init = () => {
  if (!localStorage.getItem(KEYS.ARTICLES)) {
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
  }
  if (!localStorage.getItem(KEYS.ADS)) {
    localStorage.setItem(KEYS.ADS, JSON.stringify(INITIAL_ADS));
  }
  if (!localStorage.getItem(KEYS.FILES)) {
    localStorage.setItem(KEYS.FILES, JSON.stringify(INITIAL_PROJECT_FILES));
  }
};

init();

export const StorageService = {
  getArticles: (): Article[] => {
    const data = localStorage.getItem(KEYS.ARTICLES);
    return data ? JSON.parse(data) : [];
  },

  saveArticle: (article: Article) => {
    const articles = StorageService.getArticles();
    // Convert ID to string to ensure consistency
    const safeArticle = { ...article, id: String(article.id) };
    
    const existingIndex = articles.findIndex((a) => String(a.id) === String(safeArticle.id));
    if (existingIndex >= 0) {
      articles[existingIndex] = safeArticle;
    } else {
      articles.unshift(safeArticle);
    }
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
  },

  deleteArticle: (id: string): boolean => {
    try {
      const articles = StorageService.getArticles();
      // Strict string comparison filter
      const updatedArticles = articles.filter((a) => String(a.id) !== String(id));
      
      // Save updated list to localStorage regardless of previous state
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(updatedArticles));
      return true;
    } catch (e) {
      console.error("Delete failed", e);
      return false;
    }
  },

  getArticleBySlug: (slug: string): Article | undefined => {
    return StorageService.getArticles().find((a) => a.slug === slug);
  },

  incrementViews: (id: string) => {
    const viewedKey = `viewed_${id}`;
    // Simple session-based view counting
    if (sessionStorage.getItem(viewedKey)) return;

    const articles = StorageService.getArticles();
    const article = articles.find((a) => String(a.id) === String(id));
    if (article) {
      article.views += 1;
      // Also randomize a bit of "real" traffic simulation
      if (Math.random() > 0.7) article.views += Math.floor(Math.random() * 3);
      
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
      sessionStorage.setItem(viewedKey, 'true');
    }
  },

  getAds: (): AdConfig[] => {
    const data = localStorage.getItem(KEYS.ADS);
    return data ? JSON.parse(data) : [];
  },

  saveAds: (ads: AdConfig[]) => {
    localStorage.setItem(KEYS.ADS, JSON.stringify(ads));
  },

  // --- Virtual File System for Website Editor ---
  getFiles: (): VirtualFile[] => {
    const data = localStorage.getItem(KEYS.FILES);
    return data ? JSON.parse(data) : [];
  },

  saveFile: (file: VirtualFile) => {
    const files = StorageService.getFiles();
    const index = files.findIndex(f => f.path === file.path);
    if (index >= 0) {
      files[index] = file;
    } else {
      files.push(file);
    }
    localStorage.setItem(KEYS.FILES, JSON.stringify(files));
  },

  // Simulated Auth
  login: (pass: string): boolean => {
    // In a real app, verify hash. 
    if (pass === 'subhan6565@') {
      localStorage.setItem(KEYS.AUTH, 'true');
      return true;
    }
    return false;
  },
  
  isAuthenticated: (): boolean => {
    return localStorage.getItem(KEYS.AUTH) === 'true';
  },
  
  logout: () => {
    localStorage.removeItem(KEYS.AUTH);
  }
};