
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, Comment, UserProfile, Message, TickerConfig, CloudinaryConfig, JobPosition, JobApplication, GlobalSEOConfig, DirectMessage } from '../types';
import { INITIAL_ARTICLES, INITIAL_ADS, INITIAL_PROJECT_FILES, DEFAULT_API_KEY, INITIAL_VIDEOS, DATA_TIMESTAMP, INITIAL_GITHUB_CONFIG, INITIAL_TICKER_CONFIG, INITIAL_JOBS, INITIAL_JOB_APPLICATIONS, INITIAL_SEO_CONFIG, ADMIN_EMAILS } from '../constants';
import { getFirebaseDb } from './firebase';
import { doc, setDoc, collection, getDocs, deleteDoc, query, where, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData, updateDoc } from 'firebase/firestore';
import { GithubService } from './githubService';

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
  BOOKMARKS: 'roza_bookmarks'
};

let lastArticleDoc: QueryDocumentSnapshot<DocumentData> | null = null;
let isSyncing = false;

export const StorageService = {
  init: () => {
    if (!localStorage.getItem(KEYS.TIMESTAMP)) {
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
      localStorage.setItem(KEYS.ADS, JSON.stringify(INITIAL_ADS));
      localStorage.setItem(KEYS.FILES, JSON.stringify(INITIAL_PROJECT_FILES));
      localStorage.setItem(KEYS.API_KEY, DEFAULT_API_KEY);
      localStorage.setItem(KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
      localStorage.setItem(KEYS.GITHUB, JSON.stringify(INITIAL_GITHUB_CONFIG));
      localStorage.setItem(KEYS.TICKER, JSON.stringify(INITIAL_TICKER_CONFIG));
      localStorage.setItem(KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
      localStorage.setItem(KEYS.SEO, JSON.stringify(INITIAL_SEO_CONFIG));
      localStorage.setItem(KEYS.TIMESTAMP, DATA_TIMESTAMP.toString());
    }
    StorageService.pullFromCloud();
  },

  getArticlesPaginated: async (pageSize: number, atBeginning: boolean): Promise<Article[]> => {
    try {
      const db = getFirebaseDb();
      if (atBeginning) lastArticleDoc = null;

      let q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(pageSize));
      if (lastArticleDoc && !atBeginning) {
        q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), startAfter(lastArticleDoc), limit(pageSize));
      }

      const snap = await getDocs(q);
      if (snap.empty) return atBeginning ? StorageService.getArticles().slice(0, pageSize) : [];
      
      lastArticleDoc = snap.docs[snap.docs.length - 1];
      const articles = snap.docs.map(d => d.data() as Article);
      
      if (atBeginning) localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
      return articles;
    } catch (e) {
      return StorageService.getArticles().slice(0, pageSize);
    }
  },

  pullFromCloud: async () => {
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(20)));
      if (!snap.empty) {
        const cloudArticles = snap.docs.map(d => d.data());
        localStorage.setItem(KEYS.ARTICLES, JSON.stringify(cloudArticles));
        window.dispatchEvent(new Event('roza_data_updated'));
      }
    } catch (e) {}
  },

  triggerSync: async () => {
    if (isSyncing) return;
    isSyncing = true;

    const config = StorageService.getGithubConfig();
    if (!config.token || !config.owner || !config.repo) {
      isSyncing = false;
      return;
    }

    window.dispatchEvent(new CustomEvent('roza_sync_status', { detail: { state: 'syncing', time: 'Updating Cloud...' } }));

    try {
      const db = getFirebaseDb();
      const articles = StorageService.getArticles();
      for (const art of articles.slice(0, 5)) {
         await setDoc(doc(db, "articles", art.id), art, { merge: true });
      }

      const content = GithubService.generateFileContent(
        StorageService.getApiKey(),
        articles,
        StorageService.getVideos(),
        StorageService.getAds(),
        StorageService.getFiles(),
        StorageService.getAllUsers(),
        StorageService.getMessages(),
        StorageService.getTickerConfig(),
        config,
        StorageService.getJobApplications(),
        StorageService.getJobs(),
        StorageService.getSEOConfig()
      );

      const result = await GithubService.pushToGithub(config, content);
      window.dispatchEvent(new CustomEvent('roza_sync_status', { 
          detail: { state: result.success ? 'success' : 'error', time: new Date().toLocaleTimeString() } 
      }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('roza_sync_status', { detail: { state: 'error', time: 'Retry Later' } }));
    } finally {
      isSyncing = false;
    }
  },

  saveArticle: async (article: Article) => {
    const articles = StorageService.getArticles();
    const index = articles.findIndex(a => a.id === article.id);
    if (index >= 0) articles[index] = article; else articles.unshift(article);
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
    StorageService.triggerSync();
  },

  saveVideo: (video: VideoPost) => {
    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => v.id === video.id);
    if (index >= 0) videos[index] = video; else videos.unshift(video);
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
    StorageService.triggerSync();
  },

  saveAds: (ads: AdConfig[]) => {
    localStorage.setItem(KEYS.ADS, JSON.stringify(ads));
    StorageService.triggerSync();
  },

  saveSEOConfig: (config: GlobalSEOConfig) => {
    localStorage.setItem(KEYS.SEO, JSON.stringify(config));
    StorageService.triggerSync();
  },

  getArticles: (): Article[] => JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]'),
  getAds: (): AdConfig[] => JSON.parse(localStorage.getItem(KEYS.ADS) || '[]'),
  getVideos: (): VideoPost[] => JSON.parse(localStorage.getItem(KEYS.VIDEOS) || '[]'),
  getApiKey: (): string => localStorage.getItem(KEYS.API_KEY) || DEFAULT_API_KEY,
  getGithubConfig: (): GithubConfig => JSON.parse(localStorage.getItem(KEYS.GITHUB) || JSON.stringify(INITIAL_GITHUB_CONFIG)),
  getCloudinaryConfig: (): CloudinaryConfig => JSON.parse(localStorage.getItem(KEYS.CLOUDINARY) || '{}'),
  getTickerConfig: (): TickerConfig => JSON.parse(localStorage.getItem(KEYS.TICKER) || JSON.stringify(INITIAL_TICKER_CONFIG)),
  getJobs: (): JobPosition[] => JSON.parse(localStorage.getItem(KEYS.JOBS) || '[]'),
  getJobApplications: (): JobApplication[] => JSON.parse(localStorage.getItem(KEYS.APPLICATIONS) || '[]'),
  getSEOConfig: (): GlobalSEOConfig => JSON.parse(localStorage.getItem(KEYS.SEO) || JSON.stringify(INITIAL_SEO_CONFIG)),
  getFiles: (): VirtualFile[] => JSON.parse(localStorage.getItem(KEYS.FILES) || '[]'),
  getCurrentUser: (): UserProfile | null => {
    const user = localStorage.getItem(KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
  getAllUsers: (): UserProfile[] => JSON.parse(localStorage.getItem(KEYS.USERS_DB) || '[]'),
  getMessages: (): Message[] => JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]'),
  getBookmarkedIds: (): string[] => JSON.parse(localStorage.getItem(KEYS.BOOKMARKS) || '[]'),

  isAuthenticated: (): boolean => !!localStorage.getItem(KEYS.CURRENT_USER),
  isBookmarked: (id: string): boolean => StorageService.getBookmarkedIds().includes(id),

  saveTickerConfig: (config: TickerConfig) => {
    localStorage.setItem(KEYS.TICKER, JSON.stringify(config));
    StorageService.triggerSync();
  },
  saveGithubConfig: (config: GithubConfig) => {
    localStorage.setItem(KEYS.GITHUB, JSON.stringify(config));
    StorageService.triggerSync();
  },
  saveCloudinaryConfig: (config: CloudinaryConfig) => {
    localStorage.setItem(KEYS.CLOUDINARY, JSON.stringify(config));
  },
  saveApiKey: (key: string) => {
    localStorage.setItem(KEYS.API_KEY, key);
  },
  saveMessage: async (msg: Message) => {
    try { const db = getFirebaseDb(); await setDoc(doc(db, "messages", msg.id), msg); } catch (e) {}
    const msgs = StorageService.getMessages();
    msgs.unshift(msg);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(msgs));
  },
  saveJob: (job: JobPosition) => {
    const jobs = StorageService.getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index >= 0) jobs[index] = job; else jobs.unshift(job);
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
    StorageService.triggerSync();
  },
  saveJobApplication: async (app: JobApplication) => {
    try { const db = getFirebaseDb(); await setDoc(doc(db, "applications", app.id), app); } catch (e) {}
    const apps = StorageService.getJobApplications();
    apps.unshift(app);
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  },
  saveFile: (file: VirtualFile) => {
    const files = StorageService.getFiles();
    const index = files.findIndex(f => f.path === file.path);
    if (index >= 0) files[index] = file; else files.push(file);
    localStorage.setItem(KEYS.FILES, JSON.stringify(files));
    StorageService.triggerSync();
  },
  saveSubscriber: (email: string): boolean => {
    const subscribers = JSON.parse(localStorage.getItem('roza_subscribers') || '[]');
    if (subscribers.includes(email)) return false;
    subscribers.push(email);
    localStorage.setItem('roza_subscribers', JSON.stringify(subscribers));
    return true;
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
  deleteJob: (id: string) => {
    const jobs = StorageService.getJobs().filter(j => j.id !== id);
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
    StorageService.triggerSync();
  },
  deleteJobApplication: async (id: string) => {
    try { const db = getFirebaseDb(); await deleteDoc(doc(db, "applications", id)); } catch (e) {}
    const apps = StorageService.getJobApplications().filter(a => a.id !== id);
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  },
  deleteUser: async (id: string) => {
    try { const db = getFirebaseDb(); await deleteDoc(doc(db, "users", id)); } catch (e) {}
    const users = StorageService.getAllUsers().filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS_DB, JSON.stringify(users));
  },
  deleteMessage: async (id: string) => {
    try { const db = getFirebaseDb(); await deleteDoc(doc(db, "messages", id)); } catch (e) {}
    const msgs = StorageService.getMessages().filter(m => m.id !== id);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(msgs));
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
  addCommentToArticle: async (id: string, text: string) => {
    const articles = StorageService.getArticles();
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) return { success: false };
    const user = StorageService.getCurrentUser();
    const comment: Comment = { id: 'c_' + Date.now(), userId: user?.id || 'anon', username: user?.name || 'Anonymous', userAvatar: user?.avatar, text, createdAt: new Date().toISOString() };
    articles[index].comments = [...(articles[index].comments || []), comment];
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
    StorageService.triggerSync();
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
    StorageService.triggerSync();
    return { success: true, video: videos[index] };
  },
  toggleLikeVideo: async (id: string) => {
    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => v.id === id);
    if (index === -1) return { success: false };
    const user = StorageService.getCurrentUser();
    if (!user) return { success: false };
    const likedIndex = videos[index].likedBy.indexOf(user.id);
    if (likedIndex >= 0) { videos[index].likedBy.splice(likedIndex, 1); videos[index].likes--; }
    else { videos[index].likedBy.push(user.id); videos[index].likes++; }
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
    StorageService.triggerSync();
    return { success: true, video: videos[index] };
  },
  externalLogin: (user: UserProfile) => {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    const users = StorageService.getAllUsers();
    if (!users.find(u => u.id === user.id)) { users.push(user); localStorage.setItem(KEYS.USERS_DB, JSON.stringify(users)); }
  },
  logout: () => { localStorage.removeItem(KEYS.CURRENT_USER); },
  updateUserProfile: (user: UserProfile) => {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    const users = StorageService.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) { users[idx] = user; localStorage.setItem(KEYS.USERS_DB, JSON.stringify(users)); }
  },
  updateJobApplicationStatus: async (id: string, status: JobApplication['status']) => {
    try { const db = getFirebaseDb(); await updateDoc(doc(db, "applications", id), { status }); } catch (e) {}
    const apps = StorageService.getJobApplications();
    const idx = apps.findIndex(a => a.id === id);
    if (idx >= 0) { apps[idx].status = status; localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps)); }
  },
  getUserApplications: (userId: string): JobApplication[] => {
    return StorageService.getJobApplications().filter(a => a.applicantId === userId);
  },
  sendDirectMessage: async (dm: DirectMessage) => {
    try { const db = getFirebaseDb(); await setDoc(doc(db, "direct_messages", dm.id), dm); } catch (e) {}
  },
  getUserMessages: async (userId: string): Promise<DirectMessage[]> => {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "direct_messages"), where("receiverId", "==", userId), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as DirectMessage);
    } catch (e) { return []; }
  },
  getArticleBySlugLive: async (slug: string): Promise<Article | undefined> => {
    try {
       const db = getFirebaseDb();
       const q = query(collection(db, "articles"), where("slug", "==", slug), limit(1));
       const snap = await getDocs(q);
       if(!snap.empty) return snap.docs[0].data() as Article;
       return StorageService.getArticles().find(a => a.slug === slug);
    } catch(e) { return StorageService.getArticles().find(a => a.slug === slug); }
  },
  factoryReset: () => { localStorage.clear(); window.location.reload(); }
};
