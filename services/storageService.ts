
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, Comment, UserProfile, Message, TickerConfig, CloudinaryConfig, JobPosition, JobApplication, GlobalSEOConfig, DirectMessage } from '../types';
import { INITIAL_ARTICLES, INITIAL_ADS, INITIAL_PROJECT_FILES, DEFAULT_API_KEY, INITIAL_VIDEOS, DATA_TIMESTAMP, INITIAL_GITHUB_CONFIG, INITIAL_TICKER_CONFIG, INITIAL_JOBS, INITIAL_JOB_APPLICATIONS, INITIAL_SEO_CONFIG, ADMIN_EMAILS, DEFAULT_GITHUB_TOKEN } from '../constants';
import { getFirebaseDb } from './firebase';
import { doc, setDoc, collection, getDocs, deleteDoc, query, where, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData, updateDoc } from 'firebase/firestore';
import { GithubService } from './githubService';
import { HuggingFaceService } from './huggingFaceService';

const KEYS = {
  ARTICLES: 'roza_articles',
  ADS: 'roza_ads',
  FILES: 'roza_project_files',
  API_KEY: 'roza_gemini_api_key',
  VIDEOS: 'roza_videos',
  GITHUB: 'roza_github_config',
  CLOUDINARY: 'roza_cloudinary_config',
  TIMESTAMP: 'roza_data_version_ts',
  USERS_DB: 'roza_users_local',
  MESSAGES: 'roza_messages_local',
  TICKER: 'roza_ticker_config',
  JOBS: 'roza_jobs_local',
  APPLICATIONS: 'roza_applications_local',
  SEO: 'roza_seo_config',
  CURRENT_USER: 'roza_current_user',
  BOOKMARKS: 'roza_bookmarks',
  DIRECT_MESSAGES: 'roza_direct_messages',
  SUBSCRIBERS: 'roza_subscribers'
};

let currentPaginationOffset = 0;
let isSyncing = false;

export const StorageService = {
  /**
   * CORE PERSISTENCE ENGINE
   * This method is the "Brain" of the data restoration.
   * It is hard-coded to always look for 'db/data.json' on Hugging Face.
   */
  init: async (): Promise<boolean> => {
    console.log("Roza Engine: Initiating Cloud Truth Handshake...");
    
    try {
      // Always attempt to fetch from HF first
      const remoteData = await HuggingFaceService.fetchLatestData();
      
      if (remoteData) {
         console.log("Roza Engine: Remote Database Found. Overwriting Local Cache.");
         
         // Direct mapping from Hugging Face JSON to Browser Storage
         if (remoteData.articles) localStorage.setItem(KEYS.ARTICLES, JSON.stringify(remoteData.articles));
         if (remoteData.videos) localStorage.setItem(KEYS.VIDEOS, JSON.stringify(remoteData.videos));
         if (remoteData.ads) localStorage.setItem(KEYS.ADS, JSON.stringify(remoteData.ads));
         if (remoteData.ticker) localStorage.setItem(KEYS.TICKER, JSON.stringify(remoteData.ticker));
         if (remoteData.seo) localStorage.setItem(KEYS.SEO, JSON.stringify(remoteData.seo));
         if (remoteData.jobs) localStorage.setItem(KEYS.JOBS, JSON.stringify(remoteData.jobs));
         if (remoteData.users) localStorage.setItem(KEYS.USERS_DB, JSON.stringify(remoteData.users));
         if (remoteData.applications) localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(remoteData.applications));
         
         // Update internal versioning
         const cloudTs = remoteData._sync_info?.timestamp || Date.now();
         localStorage.setItem(KEYS.TIMESTAMP, cloudTs.toString());
         
         // Dispatch refresh event to all components
         window.dispatchEvent(new Event('roza_data_updated'));
         return true;
      }
    } catch (e) {
      console.warn("Roza Engine: Cloud sync skipped (Offline or Empty).");
    }

    // Fallback: If no cloud data found, use build-in constants (Only for fresh installs)
    const currentTs = localStorage.getItem(KEYS.TIMESTAMP);
    if (!currentTs || parseInt(currentTs) < DATA_TIMESTAMP) {
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
      localStorage.setItem(KEYS.ADS, JSON.stringify(INITIAL_ADS));
      localStorage.setItem(KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
      localStorage.setItem(KEYS.TICKER, JSON.stringify(INITIAL_TICKER_CONFIG));
      localStorage.setItem(KEYS.SEO, JSON.stringify(INITIAL_SEO_CONFIG));
      localStorage.setItem(KEYS.TIMESTAMP, DATA_TIMESTAMP.toString());
    }
    
    return false;
  },

  getGithubConfig: (): GithubConfig => {
    const raw = localStorage.getItem(KEYS.GITHUB);
    return raw ? JSON.parse(raw) : { ...INITIAL_GITHUB_CONFIG };
  },

  saveGithubConfig: (config: GithubConfig) => {
    localStorage.setItem(KEYS.GITHUB, JSON.stringify(config));
    StorageService.triggerSync();
  },

  triggerSync: async () => {
    if (isSyncing) return;
    isSyncing = true;
    
    window.dispatchEvent(new CustomEvent('roza_sync_status', { 
        detail: { state: 'syncing', time: 'Backing up to Cloud...' } 
    }));

    try {
      const dataToSave = {
          articles: StorageService.getArticles(),
          videos: StorageService.getVideos(),
          ads: StorageService.getAds(),
          users: StorageService.getAllUsers(),
          ticker: StorageService.getTickerConfig(),
          jobs: StorageService.getJobs(),
          seo: StorageService.getSEOConfig(),
          applications: StorageService.getJobApplications(),
          lastUpdated: new Date().toISOString()
      };

      // 1. Sync to Hugging Face (Primary Database)
      const hfResult = await HuggingFaceService.syncData(dataToSave);

      // 2. Sync to GitHub (Secondary Mirror)
      const githubConfig = StorageService.getGithubConfig();
      if (githubConfig.token && githubConfig.owner && githubConfig.repo) {
         const content = GithubService.generateFileContent(
            StorageService.getApiKey(),
            dataToSave.articles, dataToSave.videos, dataToSave.ads, 
            StorageService.getFiles(), dataToSave.users, 
            StorageService.getMessages(), dataToSave.ticker, githubConfig, 
            dataToSave.applications, dataToSave.jobs, dataToSave.seo
         );
         await GithubService.pushToGithub(githubConfig, content);
      }

      window.dispatchEvent(new CustomEvent('roza_sync_status', { 
          detail: { state: hfResult ? 'success' : 'error', time: new Date().toLocaleTimeString() } 
      }));
    } catch (e) {
      console.error("Roza Engine: Critical Sync Failure", e);
      window.dispatchEvent(new CustomEvent('roza_sync_status', { detail: { state: 'error', time: 'Manual Sync Required' } }));
    } finally {
      isSyncing = false;
    }
  },

  getArticles: (): Article[] => JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]'),
  
  getArticlesPaginated: async (pageSize: number, startFromBeginning: boolean): Promise<Article[]> => {
    const articles = StorageService.getArticles();
    if (startFromBeginning) {
      currentPaginationOffset = pageSize;
      return articles.slice(0, pageSize);
    } else {
      const start = currentPaginationOffset;
      const end = start + pageSize;
      currentPaginationOffset = end;
      return articles.slice(start, end);
    }
  },

  getArticleBySlugLive: async (slug: string): Promise<Article | undefined> => {
    return StorageService.getArticles().find(a => a.slug === slug);
  },

  getAds: (): AdConfig[] => JSON.parse(localStorage.getItem(KEYS.ADS) || '[]'),
  getVideos: (): VideoPost[] => JSON.parse(localStorage.getItem(KEYS.VIDEOS) || '[]'),
  getApiKey: (): string => localStorage.getItem(KEYS.API_KEY) || DEFAULT_API_KEY,
  getTickerConfig: (): TickerConfig => JSON.parse(localStorage.getItem(KEYS.TICKER) || JSON.stringify(INITIAL_TICKER_CONFIG)),
  getJobs: (): JobPosition[] => JSON.parse(localStorage.getItem(KEYS.JOBS) || '[]'),
  
  deleteJob: (id: string) => {
    const jobs = StorageService.getJobs().filter(j => j.id !== id);
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
    StorageService.triggerSync();
  },

  getJobApplications: (): JobApplication[] => JSON.parse(localStorage.getItem(KEYS.APPLICATIONS) || '[]'),
  
  getUserApplications: (userId: string): JobApplication[] => {
    return StorageService.getJobApplications().filter(app => app.applicantId === userId);
  },

  deleteJobApplication: async (id: string) => {
    const apps = StorageService.getJobApplications().filter(a => a.id !== id);
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
    await StorageService.triggerSync();
  },

  updateJobApplicationStatus: async (id: string, newStatus: JobApplication['status']) => {
    const apps = StorageService.getJobApplications();
    const idx = apps.findIndex(a => a.id === id);
    if (idx >= 0) {
      apps[idx].status = newStatus;
      localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
      await StorageService.triggerSync();
    }
  },

  getSEOConfig: (): GlobalSEOConfig => JSON.parse(localStorage.getItem(KEYS.SEO) || JSON.stringify(INITIAL_SEO_CONFIG)),
  getMessages: (): Message[] => JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]'),
  
  getUserMessages: async (userId: string): Promise<DirectMessage[]> => {
    const msgs = JSON.parse(localStorage.getItem(KEYS.DIRECT_MESSAGES) || '[]');
    return msgs.filter((m: DirectMessage) => m.receiverId === userId);
  },

  sendDirectMessage: async (dm: DirectMessage) => {
    const msgs = JSON.parse(localStorage.getItem(KEYS.DIRECT_MESSAGES) || '[]');
    msgs.unshift(dm);
    localStorage.setItem(KEYS.DIRECT_MESSAGES, JSON.stringify(msgs));
    await StorageService.triggerSync();
  },

  getAllUsers: (): UserProfile[] => JSON.parse(localStorage.getItem(KEYS.USERS_DB) || '[]'),
  
  deleteUser: async (id: string) => {
    const users = StorageService.getAllUsers().filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS_DB, JSON.stringify(users));
    await StorageService.triggerSync();
  },

  getCurrentUser: (): UserProfile | null => {
    const user = localStorage.getItem(KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
  getBookmarkedIds: (): string[] => JSON.parse(localStorage.getItem(KEYS.BOOKMARKS) || '[]'),
  isAuthenticated: (): boolean => !!localStorage.getItem(KEYS.CURRENT_USER),
  isBookmarked: (id: string): boolean => StorageService.getBookmarkedIds().includes(id),

  saveArticle: async (article: Article) => {
    const articles = StorageService.getArticles();
    const index = articles.findIndex(a => a.id === article.id);
    if (index >= 0) articles[index] = article; else articles.unshift(article);
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
    await StorageService.triggerSync();
  },

  saveVideo: async (video: VideoPost) => {
    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => v.id === video.id);
    if (index >= 0) videos[index] = video; else videos.unshift(video);
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
    await StorageService.triggerSync();
  },

  addCommentToArticle: async (id: string, text: string) => {
    const articles = StorageService.getArticles();
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) return { success: false };
    const user = StorageService.getCurrentUser();
    const comment: Comment = { id: 'c_' + Date.now(), userId: user?.id || 'anon', username: user?.name || 'Anonymous', userAvatar: user?.avatar, text, createdAt: new Date().toISOString() };
    articles[index].comments = [...(articles[index].comments || []), comment];
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
    await StorageService.triggerSync();
    return { success: true, article: articles[index] };
  },

  addCommentToVideo: async (id: string, text: string) => {
    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => v.id === id);
    if (index === -1) return { success: false };
    const user = StorageService.getCurrentUser();
    const comment: Comment = { id: 'c_' + Date.now(), userId: user?.id || 'anon', username: user?.name || 'Anonymous', userAvatar: user?.avatar, text, createdAt: new Date().toISOString() };
    videos[index].comments.push(comment);
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
    await StorageService.triggerSync();
    return { success: true, video: videos[index] };
  },

  toggleLikeVideo: async (id: string) => {
    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => v.id === id);
    if (index === -1) return { success: false };
    const user = StorageService.getCurrentUser();
    if (!user) return { success: false };
    const likedIndex = videos[index].likedBy.indexOf(user.id);
    if (likedIndex >= 0) { videos[index].likedBy.splice(likedIndex, 1); videos[index].likes--; } else { videos[index].likedBy.push(user.id); videos[index].likes++; }
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
    await StorageService.triggerSync();
    return { success: true, video: videos[index] };
  },

  saveAds: (ads: AdConfig[]) => {
    localStorage.setItem(KEYS.ADS, JSON.stringify(ads));
    StorageService.triggerSync();
  },

  saveSEOConfig: (config: GlobalSEOConfig) => {
    localStorage.setItem(KEYS.SEO, JSON.stringify(config));
    StorageService.triggerSync();
  },

  saveTickerConfig: (config: TickerConfig) => {
    localStorage.setItem(KEYS.TICKER, JSON.stringify(config));
    StorageService.triggerSync();
  },

  saveApiKey: (key: string) => {
    localStorage.setItem(KEYS.API_KEY, key);
  },

  saveMessage: async (msg: Message) => {
    const msgs = StorageService.getMessages();
    msgs.unshift(msg);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(msgs));
    await StorageService.triggerSync();
  },

  deleteMessage: async (id: string) => {
    const msgs = StorageService.getMessages().filter(m => m.id !== id);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(msgs));
    await StorageService.triggerSync();
  },

  saveSubscriber: (email: string): boolean => {
    const subscribers = JSON.parse(localStorage.getItem(KEYS.SUBSCRIBERS) || '[]');
    if (subscribers.includes(email)) return false;
    subscribers.push(email);
    localStorage.setItem(KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    return true;
  },

  saveJob: (job: JobPosition) => {
    const jobs = StorageService.getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index >= 0) jobs[index] = job; else jobs.unshift(job);
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
    StorageService.triggerSync();
  },

  saveJobApplication: async (app: JobApplication) => {
    const apps = StorageService.getJobApplications();
    apps.unshift(app);
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
    await StorageService.triggerSync();
  },

  deleteArticle: (id: string) => {
    const articles = StorageService.getArticles().filter(a => a.id !== id);
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
    StorageService.triggerSync();
  },

  deleteVideo: (id: string) => {
    const videos = StorageService.getVideos().filter(v => v.id !== id);
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
    StorageService.triggerSync();
  },

  incrementViews: (id: string) => {
    const articles = StorageService.getArticles();
    const art = articles.find(a => a.id === id);
    if (art) { art.views++; localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles)); return; }
    const videos = StorageService.getVideos();
    const vid = videos.find(v => v.id === id);
    if (vid) { vid.views++; localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos)); }
  },

  toggleBookmark: (id: string): boolean => {
    let ids = StorageService.getBookmarkedIds();
    const exists = ids.includes(id);
    if (exists) ids = ids.filter(i => i !== id); else ids.push(id);
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(ids));
    window.dispatchEvent(new Event('bookmarks_updated'));
    return !exists;
  },

  externalLogin: (user: UserProfile) => {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    const users = StorageService.getAllUsers();
    if (!users.find(u => u.id === user.id)) { users.push(user); localStorage.setItem(KEYS.USERS_DB, JSON.stringify(users)); StorageService.triggerSync(); }
  },

  logout: () => { localStorage.removeItem(KEYS.CURRENT_USER); },
  
  updateUserProfile: (user: UserProfile) => {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    const users = StorageService.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) { users[idx] = user; localStorage.setItem(KEYS.USERS_DB, JSON.stringify(users)); StorageService.triggerSync(); }
  },

  getFiles: (): VirtualFile[] => JSON.parse(localStorage.getItem(KEYS.FILES) || '[]'),
  
  saveFile: (file: VirtualFile) => {
    const files = StorageService.getFiles();
    const idx = files.findIndex(f => f.path === file.path);
    if (idx >= 0) files[idx] = file; else files.push(file);
    localStorage.setItem(KEYS.FILES, JSON.stringify(files));
    StorageService.triggerSync();
  },

  factoryReset: () => { localStorage.clear(); window.location.reload(); }
};
