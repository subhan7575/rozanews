
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, Comment, UserProfile, NotificationPayload, Message, TickerConfig, CloudinaryConfig, JobPosition, JobApplication } from '../types';
import { INITIAL_ARTICLES, INITIAL_ADS, INITIAL_PROJECT_FILES, DEFAULT_API_KEY, INITIAL_VIDEOS, DATA_TIMESTAMP, INITIAL_GITHUB_CONFIG, DEFAULT_GITHUB_TOKEN, INITIAL_USERS, INITIAL_MESSAGES, INITIAL_TICKER_CONFIG, INITIAL_JOBS, INITIAL_JOB_APPLICATIONS } from '../constants';
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
  USER_ID: 'roza_user_identity',
  USERS_DB: 'roza_users_db', // Stores all registered users
  MESSAGES: 'roza_messages_db', // Stores messages
  CURRENT_USER: 'roza_current_user_session', // Stores currently logged in user
  LATEST_NOTIFICATION: 'roza_latest_broadcast', // For real-time triggers
  SUBSCRIBERS: 'roza_subscribers', // Newsletter subscribers
  TICKER: 'roza_ticker_config', // Breaking News Ticker
  BOOKMARKS: 'roza_user_bookmarks', // Saved Articles
  JOBS: 'roza_jobs_listings', // Career Jobs
  JOB_APPLICATIONS: 'roza_job_applications' // Job Applications
};

// --- SECURITY CONFIGURATION ---
// Added the hidden admin email as requested
const ADMIN_EMAILS = ['rozanewsofficial@gmail.com', 'saifujafar895@gmail.com'];

// --- SAFE STORAGE WRAPPER (Prevents Crashing) ---
const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      alert("Storage Full! Please configure Cloudinary in Admin Panel for images/videos. Local storage cannot hold more data.");
      console.error("LocalStorage Quota Exceeded. Data not saved.");
    } else {
      console.error("Storage Save Error:", e);
    }
  }
};

// --- ROBUST JSON PARSER ---
// Prevents app crash if localStorage has invalid JSON
const safeParse = <T>(data: string | null, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.warn("Storage Corrupted, resetting key to default:", e);
    return fallback;
  }
};

// --- AUTO SYNC LOGIC ---
let syncTimer: any = null;
const SYNC_DELAY = 10000; // 10 seconds debounce

const triggerAutoSync = () => {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    const config = StorageService.getGithubConfig();
    if (config.token && config.owner && config.repo) {
       console.log("Triggering Auto-Sync to GitHub...");
       const apiKey = StorageService.getApiKey();
       const articles = StorageService.getArticles();
       const videos = StorageService.getVideos();
       const ads = StorageService.getAds();
       const files = StorageService.getFiles();
       const users = StorageService.getAllUsers();
       const messages = StorageService.getMessages();
       const ticker = StorageService.getTickerConfig();
       const applications = StorageService.getJobApplications();
       const jobs = StorageService.getJobs();

       // Push in background
       const content = GithubService.generateFileContent(
         apiKey, 
         articles, 
         videos, 
         ads, 
         files, 
         users, 
         messages, 
         ticker, 
         config, 
         applications,
         jobs
       );
       await GithubService.pushToGithub(config, content);
    }
  }, SYNC_DELAY);
};

// --- SMART MERGE HELPER ---
const mergeData = <T extends { id?: string; path?: string }>(localList: T[], serverList: T[], idKey: keyof T = 'id' as keyof T): T[] => {
  const mergedMap = new Map();
  localList.forEach(item => {
    const key = String(item[idKey]);
    mergedMap.set(key, item);
  });
  serverList.forEach(item => {
    const key = String(item[idKey]);
    mergedMap.set(key, item);
  });
  return Array.from(mergedMap.values());
};

const init = () => {
  try {
    const localTimestampStr = localStorage.getItem(KEYS.TIMESTAMP);
    const localTimestamp = localTimestampStr ? parseInt(localTimestampStr) : 0;
    const serverTimestamp = DATA_TIMESTAMP || 0;

    // Standard Initialization - checking if keys exist, if not setting default
    if (!localStorage.getItem(KEYS.ARTICLES)) safeSetItem(KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
    if (!localStorage.getItem(KEYS.ADS)) safeSetItem(KEYS.ADS, JSON.stringify(INITIAL_ADS));
    if (!localStorage.getItem(KEYS.FILES)) safeSetItem(KEYS.FILES, JSON.stringify(INITIAL_PROJECT_FILES));
    if (!localStorage.getItem(KEYS.VIDEOS)) safeSetItem(KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
    if (!localStorage.getItem(KEYS.USERS_DB)) safeSetItem(KEYS.USERS_DB, JSON.stringify(INITIAL_USERS));
    if (!localStorage.getItem(KEYS.MESSAGES)) safeSetItem(KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    if (!localStorage.getItem(KEYS.SUBSCRIBERS)) safeSetItem(KEYS.SUBSCRIBERS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.TICKER)) safeSetItem(KEYS.TICKER, JSON.stringify(INITIAL_TICKER_CONFIG));
    if (!localStorage.getItem(KEYS.BOOKMARKS)) safeSetItem(KEYS.BOOKMARKS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.JOBS)) safeSetItem(KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    if (!localStorage.getItem(KEYS.JOB_APPLICATIONS)) safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(INITIAL_JOB_APPLICATIONS));

    // Initialize Github Config
    const existingGithubStr = localStorage.getItem(KEYS.GITHUB);
    // Explicitly define type as Partial<GithubConfig> so properties like token, owner, repo are accessible
    let currentGithubConfig = safeParse<Partial<GithubConfig>>(existingGithubStr, {});
    
    if (!currentGithubConfig.token && DEFAULT_GITHUB_TOKEN) {
       currentGithubConfig = { ...currentGithubConfig, token: DEFAULT_GITHUB_TOKEN };
       safeSetItem(KEYS.GITHUB, JSON.stringify(currentGithubConfig));
    }
    if (!existingGithubStr && INITIAL_GITHUB_CONFIG) {
       safeSetItem(KEYS.GITHUB, JSON.stringify(INITIAL_GITHUB_CONFIG));
    }

    // Cloud Update Logic
    if (serverTimestamp > localTimestamp) {
      const localArticles = safeParse(localStorage.getItem(KEYS.ARTICLES), []);
      const localVideos = safeParse(localStorage.getItem(KEYS.VIDEOS), []);
      const localAds = safeParse(localStorage.getItem(KEYS.ADS), []);
      const localFiles = safeParse(localStorage.getItem(KEYS.FILES), []);
      const localUsers = safeParse(localStorage.getItem(KEYS.USERS_DB), []);
      const localMessages = safeParse(localStorage.getItem(KEYS.MESSAGES), []);
      const localApplications = safeParse(localStorage.getItem(KEYS.JOB_APPLICATIONS), []);
      const localJobs = safeParse(localStorage.getItem(KEYS.JOBS), []);

      const mergedArticles = mergeData(localArticles, INITIAL_ARTICLES, 'id');
      const mergedVideos = mergeData(localVideos, INITIAL_VIDEOS, 'id');
      const mergedAds = mergeData(localAds, INITIAL_ADS, 'id');
      const mergedFiles = mergeData(localFiles, INITIAL_PROJECT_FILES, 'path');
      const mergedUsers = mergeData(localUsers, INITIAL_USERS, 'id');
      const mergedMessages = mergeData(localMessages, INITIAL_MESSAGES, 'id');
      const mergedApplications = mergeData(localApplications, INITIAL_JOB_APPLICATIONS, 'id');
      const mergedJobs = mergeData(localJobs, INITIAL_JOBS, 'id');

      if (INITIAL_GITHUB_CONFIG) {
         const newConfig = {
            token: currentGithubConfig.token || INITIAL_GITHUB_CONFIG.token || DEFAULT_GITHUB_TOKEN,
            owner: INITIAL_GITHUB_CONFIG.owner || currentGithubConfig.owner,
            repo: INITIAL_GITHUB_CONFIG.repo || currentGithubConfig.repo,
            branch: INITIAL_GITHUB_CONFIG.branch || 'main'
         };
         safeSetItem(KEYS.GITHUB, JSON.stringify(newConfig));
      }

      safeSetItem(KEYS.ARTICLES, JSON.stringify(mergedArticles));
      safeSetItem(KEYS.VIDEOS, JSON.stringify(mergedVideos));
      safeSetItem(KEYS.ADS, JSON.stringify(mergedAds));
      safeSetItem(KEYS.FILES, JSON.stringify(mergedFiles));
      safeSetItem(KEYS.USERS_DB, JSON.stringify(mergedUsers));
      safeSetItem(KEYS.MESSAGES, JSON.stringify(mergedMessages));
      safeSetItem(KEYS.TICKER, JSON.stringify(INITIAL_TICKER_CONFIG));
      safeSetItem(KEYS.JOBS, JSON.stringify(mergedJobs));
      safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(mergedApplications));
      
      safeSetItem(KEYS.TIMESTAMP, serverTimestamp.toString());
    }
  } catch (e) {
    console.error("Storage Initialization Error:", e);
  }
};

init();

export const StorageService = {
  // --- USER UPGRADE LOGIC ---
  upgradeToPremium: (userId: string) => {
    // 1. Update Session User
    const currentUser = StorageService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, isPremium: true };
      safeSetItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }

    // 2. Update Database User
    const users = StorageService.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index >= 0) {
      users[index].isPremium = true;
      safeSetItem(KEYS.USERS_DB, JSON.stringify(users));
      triggerAutoSync(); // SYNC
    }
  },

  // --- JOBS (CAREERS) ---
  getJobs: (): JobPosition[] => {
    return safeParse(localStorage.getItem(KEYS.JOBS), []);
  },

  saveJob: (job: JobPosition) => {
    const jobs = StorageService.getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index >= 0) {
      jobs[index] = job;
    } else {
      jobs.unshift(job);
    }
    safeSetItem(KEYS.JOBS, JSON.stringify(jobs));
    triggerAutoSync();
  },

  deleteJob: (id: string) => {
    const jobs = StorageService.getJobs();
    const updatedJobs = jobs.filter(j => j.id !== id);
    safeSetItem(KEYS.JOBS, JSON.stringify(updatedJobs));
    triggerAutoSync();
  },

  // --- JOB APPLICATIONS ---
  getJobApplications: (): JobApplication[] => {
    return safeParse(localStorage.getItem(KEYS.JOB_APPLICATIONS), []);
  },

  getUserApplications: (userId: string): JobApplication[] => {
    const allApps = StorageService.getJobApplications();
    return allApps.filter(app => app.applicantId === userId);
  },

  saveJobApplication: (application: JobApplication) => {
    const apps = StorageService.getJobApplications();
    apps.unshift(application);
    safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(apps));
    triggerAutoSync();
  },

  deleteJobApplication: (id: string) => {
    const apps = StorageService.getJobApplications();
    const updatedApps = apps.filter(a => a.id !== id);
    safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(updatedApps));
    triggerAutoSync();
  },

  updateJobApplicationStatus: (id: string, status: JobApplication['status']) => {
    const apps = StorageService.getJobApplications();
    const index = apps.findIndex(a => a.id === id);
    if (index >= 0) {
      apps[index].status = status;
      safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(apps));
      triggerAutoSync();
    }
  },

  // --- BOOKMARKS ---
  getBookmarkedIds: (): string[] => {
    return safeParse(localStorage.getItem(KEYS.BOOKMARKS), []);
  },

  toggleBookmark: (articleId: string): boolean => {
    const bookmarks = StorageService.getBookmarkedIds();
    const index = bookmarks.indexOf(articleId);
    let isBookmarked = false;

    if (index >= 0) {
      bookmarks.splice(index, 1); // Remove
      isBookmarked = false;
    } else {
      bookmarks.push(articleId); // Add
      isBookmarked = true;
    }
    
    safeSetItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    // Dispatch event for UI updates
    window.dispatchEvent(new Event('bookmarks_updated'));
    return isBookmarked;
  },

  isBookmarked: (articleId: string): boolean => {
    const bookmarks = StorageService.getBookmarkedIds();
    return bookmarks.includes(articleId);
  },

  // --- NOTIFICATIONS ---
  updateUserNotifications: (enabled: boolean) => {
    const user = StorageService.getCurrentUser();
    if (user) {
      user.notificationsEnabled = enabled;
      StorageService.externalLogin(user); // Save to storage
    }
  },

  broadcastNotification: (payload: NotificationPayload) => {
    safeSetItem(KEYS.LATEST_NOTIFICATION, JSON.stringify(payload));
    window.dispatchEvent(new StorageEvent('storage', {
      key: KEYS.LATEST_NOTIFICATION,
      newValue: JSON.stringify(payload)
    }));
  },

  // --- TICKER ---
  getTickerConfig: (): TickerConfig => {
    return safeParse(localStorage.getItem(KEYS.TICKER), INITIAL_TICKER_CONFIG);
  },

  saveTickerConfig: (config: TickerConfig) => {
    safeSetItem(KEYS.TICKER, JSON.stringify(config));
    triggerAutoSync(); // SYNC
  },

  // --- SUBSCRIBERS ---
  getSubscribers: (): string[] => {
    return safeParse(localStorage.getItem(KEYS.SUBSCRIBERS), []);
  },

  saveSubscriber: (email: string): boolean => {
    const list = StorageService.getSubscribers();
    if (list.includes(email)) return false; // Already subscribed
    list.push(email);
    safeSetItem(KEYS.SUBSCRIBERS, JSON.stringify(list));
    return true;
  },

  // --- MESSAGES ---
  getMessages: (): Message[] => {
    return safeParse(localStorage.getItem(KEYS.MESSAGES), []);
  },

  saveMessage: (msg: Message) => {
    const msgs = StorageService.getMessages();
    msgs.unshift(msg);
    safeSetItem(KEYS.MESSAGES, JSON.stringify(msgs));
    triggerAutoSync(); // SYNC
  },

  markMessageRead: (id: string) => {
    const msgs = StorageService.getMessages();
    const updated = msgs.map(m => m.id === id ? { ...m, read: true } : m);
    safeSetItem(KEYS.MESSAGES, JSON.stringify(updated));
    triggerAutoSync(); // SYNC
  },

  // --- AUTHENTICATION (SECURE) ---
  getCurrentUser: (): UserProfile | null => {
    return safeParse(localStorage.getItem(KEYS.CURRENT_USER), null);
  },

  getAllUsers: (): UserProfile[] => {
    return safeParse(localStorage.getItem(KEYS.USERS_DB), []);
  },

  // Handles Login from Firebase (Phone/Email/Google)
  externalLogin: (user: UserProfile) => {
    // 1. Set Session
    safeSetItem(KEYS.CURRENT_USER, JSON.stringify(user));
    
    // 2. Sync to "Database" of all users
    const users: UserProfile[] = safeParse(localStorage.getItem(KEYS.USERS_DB), []);
    const existingIndex = users.findIndex(u => u.id === user.id || (u.email && u.email === user.email));
    
    if (existingIndex >= 0) {
      // Merge existing data with new login data (keeps things like joinedAt)
      // PRESESERVE PREMIUM STATUS if exists in DB
      const dbUser = users[existingIndex];
      users[existingIndex] = { ...dbUser, ...user, isPremium: dbUser.isPremium || user.isPremium };
      
      // Update session with potentially merged premium status
      if (dbUser.isPremium) {
         safeSetItem(KEYS.CURRENT_USER, JSON.stringify(users[existingIndex]));
      }
    } else {
      // Add new user
      users.push(user);
    }
    safeSetItem(KEYS.USERS_DB, JSON.stringify(users));
    triggerAutoSync(); // SYNC USER DATA
  },

  // Dedicated Update for Profile Editing
  updateUserProfile: (updatedUser: UserProfile) => {
    // 1. Update Session
    safeSetItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser));

    // 2. Update Database
    const users: UserProfile[] = safeParse(localStorage.getItem(KEYS.USERS_DB), []);
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index >= 0) {
       users[index] = updatedUser;
       safeSetItem(KEYS.USERS_DB, JSON.stringify(users));
       triggerAutoSync();
    }
  },

  deleteUser: (userId: string) => {
    const users: UserProfile[] = safeParse(localStorage.getItem(KEYS.USERS_DB), []);
    const updatedUsers = users.filter(u => u.id !== userId);
    safeSetItem(KEYS.USERS_DB, JSON.stringify(updatedUsers));
    triggerAutoSync(); // SYNC
  },

  logoutUser: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  // --- ADMIN AUTH ---
  isAuthenticated: (): boolean => {
    const user = StorageService.getCurrentUser();
    // STRICT SECURITY: Only specific emails can access the admin panel
    return !!(user && user.email && ADMIN_EMAILS.includes(user.email));
  },
  
  logout: () => {
    // We reuse the standard logout because Admin is just a standard user with privilege
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  factoryReset: () => {
    localStorage.clear();
    window.location.reload();
  },

  // --- ARTICLES ---
  getArticles: (): Article[] => {
    const articles = safeParse(localStorage.getItem(KEYS.ARTICLES), []);
    // Ensure data structure integrity
    if (!Array.isArray(articles)) return [];
    return articles.map((a: any) => ({
      ...a,
      comments: a.comments || [],
      isPremium: a.isPremium || false, // Ensure defaults
      linkedVideoId: a.linkedVideoId || undefined // Load the video link field
    }));
  },

  saveArticle: (article: Article) => {
    const articles = StorageService.getArticles();
    const safeArticle = { ...article, id: String(article.id) };
    const existingIndex = articles.findIndex((a) => String(a.id) === String(safeArticle.id));
    
    const isNew = existingIndex === -1;
    
    if (existingIndex >= 0) {
      articles[existingIndex] = safeArticle;
    } else {
      articles.unshift(safeArticle);
    }
    safeSetItem(KEYS.ARTICLES, JSON.stringify(articles));

    if (isNew) {
      StorageService.broadcastNotification({
        id: `notif_${Date.now()}`,
        title: "New Article Published",
        body: safeArticle.title,
        url: `/article/${safeArticle.slug}`,
        timestamp: Date.now(),
        type: 'article'
      });
    }
    triggerAutoSync(); // SYNC
  },

  deleteArticle: (id: string): boolean => {
    try {
      const articles = StorageService.getArticles();
      const updatedArticles = articles.filter((a) => String(a.id) !== String(id));
      safeSetItem(KEYS.ARTICLES, JSON.stringify(updatedArticles));
      triggerAutoSync(); // SYNC
      return true;
    } catch (e) {
      console.error("Delete failed", e);
      return false;
    }
  },

  getArticleBySlug: (slug: string): Article | undefined => {
    return StorageService.getArticles().find((a) => a.slug === slug);
  },

  getArticleById: (id: string): Article | undefined => {
    return StorageService.getArticles().find((a) => String(a.id) === String(id));
  },

  incrementViews: (id: string) => {
    const viewedKey = `viewed_${id}`;
    if (sessionStorage.getItem(viewedKey)) return;

    const articles = StorageService.getArticles();
    const article = articles.find((a) => String(a.id) === String(id));
    if (article) {
      article.views += 1;
      safeSetItem(KEYS.ARTICLES, JSON.stringify(articles));
      sessionStorage.setItem(viewedKey, 'true');
      triggerAutoSync(); // SYNC VIEWS
    }
  },

  addCommentToArticle: (articleId: string, text: string): { success: boolean; article?: Article } => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return { success: false };

    const articles = StorageService.getArticles();
    const index = articles.findIndex(a => String(a.id) === String(articleId));
    
    if (index >= 0) {
      const article = articles[index];
      const newComment: Comment = {
        id: 'c_' + Date.now(),
        userId: currentUser.id,
        username: currentUser.name,
        userAvatar: currentUser.avatar,
        text,
        createdAt: new Date().toISOString()
      };
      
      article.comments = [newComment, ...(article.comments || [])];
      articles[index] = article;
      safeSetItem(KEYS.ARTICLES, JSON.stringify(articles));
      triggerAutoSync(); // SYNC
      return { success: true, article };
    }
    return { success: false };
  },

  // --- VIDEOS ---
  getVideos: (): VideoPost[] => {
    const videos = safeParse(localStorage.getItem(KEYS.VIDEOS), []);
    if (!Array.isArray(videos)) return [];
    return videos.map((v: any) => ({
       ...v,
       likes: v.likes || 0,
       likedBy: v.likedBy || [],
       comments: v.comments || []
    }));
  },

  saveVideo: (video: VideoPost) => {
    const videos = StorageService.getVideos();
    const safeVideo = { 
       ...video, 
       id: String(video.id),
       likes: video.likes || 0,
       likedBy: video.likedBy || [],
       comments: video.comments || []
    };
    const index = videos.findIndex(v => String(v.id) === String(safeVideo.id));
    const isNew = index === -1;

    if (index >= 0) videos[index] = safeVideo;
    else videos.unshift(safeVideo);
    
    safeSetItem(KEYS.VIDEOS, JSON.stringify(videos));

    if (isNew) {
      StorageService.broadcastNotification({
        id: `notif_${Date.now()}`,
        title: "New Video Uploaded",
        body: safeVideo.title,
        url: `/videos`,
        timestamp: Date.now(),
        type: 'video'
      });
    }
    triggerAutoSync(); // SYNC
  },

  deleteVideo: (id: string): boolean => {
    try {
      const videos = StorageService.getVideos();
      const updated = videos.filter(v => String(v.id) !== String(id));
      safeSetItem(KEYS.VIDEOS, JSON.stringify(updated));
      triggerAutoSync(); // SYNC
      return true;
    } catch (e) {
      return false;
    }
  },

  toggleLikeVideo: (videoId: string): { success: boolean; video?: VideoPost } => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return { success: false };

    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => String(v.id) === String(videoId));
    
    if (index >= 0) {
      const video = videos[index];
      const hasLiked = video.likedBy.includes(currentUser.id);
      
      if (hasLiked) {
        video.likedBy = video.likedBy.filter(id => id !== currentUser.id);
        video.likes = Math.max(0, video.likes - 1);
      } else {
        video.likedBy.push(currentUser.id);
        video.likes += 1;
      }
      
      videos[index] = video;
      safeSetItem(KEYS.VIDEOS, JSON.stringify(videos));
      triggerAutoSync(); // SYNC LIKES
      return { success: true, video };
    }
    return { success: false };
  },

  addCommentToVideo: (videoId: string, text: string): { success: boolean; video?: VideoPost } => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return { success: false };

    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => String(v.id) === String(videoId));
    
    if (index >= 0) {
      const video = videos[index];
      const newComment: Comment = {
        id: 'c_' + Date.now(),
        userId: currentUser.id,
        username: currentUser.name,
        userAvatar: currentUser.avatar,
        text,
        createdAt: new Date().toISOString()
      };
      
      video.comments.unshift(newComment);
      videos[index] = video;
      safeSetItem(KEYS.VIDEOS, JSON.stringify(videos));
      triggerAutoSync(); // SYNC COMMENTS
      return { success: true, video };
    }
    return { success: false };
  },

  // --- ADS & CONFIG ---
  getAds: (): AdConfig[] => {
    return safeParse(localStorage.getItem(KEYS.ADS), []);
  },

  saveAds: (ads: AdConfig[]) => {
    safeSetItem(KEYS.ADS, JSON.stringify(ads));
    triggerAutoSync(); // SYNC
  },

  getApiKey: (): string => {
    return localStorage.getItem(KEYS.API_KEY) || DEFAULT_API_KEY;
  },

  saveApiKey: (key: string) => {
    safeSetItem(KEYS.API_KEY, key.trim());
    triggerAutoSync(); // SYNC
  },

  // --- CLOUDINARY CONFIG ---
  getCloudinaryConfig: (): CloudinaryConfig => {
    return safeParse(localStorage.getItem(KEYS.CLOUDINARY), { cloudName: '', uploadPreset: '' });
  },

  saveCloudinaryConfig: (config: CloudinaryConfig) => {
    safeSetItem(KEYS.CLOUDINARY, JSON.stringify(config));
    triggerAutoSync(); // SYNC
  },

  getGithubConfig: (): GithubConfig => {
    const config = safeParse(localStorage.getItem(KEYS.GITHUB), { token: '', owner: '', repo: '', branch: 'main' });
    if (!config.token && DEFAULT_GITHUB_TOKEN) {
      config.token = DEFAULT_GITHUB_TOKEN;
    }
    return config;
  },

  saveGithubConfig: (config: GithubConfig) => {
    safeSetItem(KEYS.GITHUB, JSON.stringify(config));
  },

  getFiles: (): VirtualFile[] => {
    return safeParse(localStorage.getItem(KEYS.FILES), []);
  },

  saveFile: (file: VirtualFile) => {
    const files = StorageService.getFiles();
    const index = files.findIndex(f => f.path === file.path);
    if (index >= 0) files[index] = file;
    else files.push(file);
    safeSetItem(KEYS.FILES, JSON.stringify(files));
    triggerAutoSync(); // SYNC CODE CHANGES
  }
};
