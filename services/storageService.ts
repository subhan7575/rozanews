import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, Comment, UserProfile, NotificationPayload, Message, TickerConfig } from '../types';
import { INITIAL_ARTICLES, INITIAL_ADS, INITIAL_PROJECT_FILES, DEFAULT_API_KEY, INITIAL_VIDEOS, DATA_TIMESTAMP, INITIAL_GITHUB_CONFIG, DEFAULT_GITHUB_TOKEN, INITIAL_USERS, INITIAL_MESSAGES, INITIAL_TICKER_CONFIG } from '../constants';
import { GithubService } from './githubService';

const KEYS = {
  ARTICLES: 'roza_articles',
  ADS: 'roza_ads',
  AUTH: 'roza_auth', // Legacy Admin Auth
  FILES: 'roza_project_files',
  API_KEY: 'roza_gemini_api_key',
  VIDEOS: 'roza_videos',
  GITHUB: 'roza_github_config',
  TIMESTAMP: 'roza_data_version_ts',
  USER_ID: 'roza_user_identity',
  USERS_DB: 'roza_users_db', // Stores all registered users
  MESSAGES: 'roza_messages_db', // Stores messages
  CURRENT_USER: 'roza_current_user_session', // Stores currently logged in user
  LATEST_NOTIFICATION: 'roza_latest_broadcast', // For real-time triggers
  SUBSCRIBERS: 'roza_subscribers', // Newsletter subscribers
  TICKER: 'roza_ticker_config' // Breaking News Ticker
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

       // Push in background
       const content = GithubService.generateFileContent(apiKey, articles, videos, ads, files, users, messages, ticker, config);
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

    // Standard Initialization
    if (!localStorage.getItem(KEYS.ARTICLES)) localStorage.setItem(KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
    if (!localStorage.getItem(KEYS.ADS)) localStorage.setItem(KEYS.ADS, JSON.stringify(INITIAL_ADS));
    if (!localStorage.getItem(KEYS.FILES)) localStorage.setItem(KEYS.FILES, JSON.stringify(INITIAL_PROJECT_FILES));
    if (!localStorage.getItem(KEYS.VIDEOS)) localStorage.setItem(KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
    if (!localStorage.getItem(KEYS.USERS_DB)) localStorage.setItem(KEYS.USERS_DB, JSON.stringify(INITIAL_USERS));
    if (!localStorage.getItem(KEYS.MESSAGES)) localStorage.setItem(KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    if (!localStorage.getItem(KEYS.SUBSCRIBERS)) localStorage.setItem(KEYS.SUBSCRIBERS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.TICKER)) localStorage.setItem(KEYS.TICKER, JSON.stringify(INITIAL_TICKER_CONFIG));

    // Initialize Github Config
    const existingGithubStr = localStorage.getItem(KEYS.GITHUB);
    let currentGithubConfig = existingGithubStr ? JSON.parse(existingGithubStr) : {};
    if (!currentGithubConfig.token && DEFAULT_GITHUB_TOKEN) {
       currentGithubConfig = { ...currentGithubConfig, token: DEFAULT_GITHUB_TOKEN };
       localStorage.setItem(KEYS.GITHUB, JSON.stringify(currentGithubConfig));
    }
    if (!existingGithubStr && INITIAL_GITHUB_CONFIG) {
       localStorage.setItem(KEYS.GITHUB, JSON.stringify(INITIAL_GITHUB_CONFIG));
    }

    // Cloud Update Logic
    if (serverTimestamp > localTimestamp) {
      const localArticles = JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]');
      const localVideos = JSON.parse(localStorage.getItem(KEYS.VIDEOS) || '[]');
      const localAds = JSON.parse(localStorage.getItem(KEYS.ADS) || '[]');
      const localFiles = JSON.parse(localStorage.getItem(KEYS.FILES) || '[]');
      const localUsers = JSON.parse(localStorage.getItem(KEYS.USERS_DB) || '[]');
      const localMessages = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');

      const mergedArticles = mergeData(localArticles, INITIAL_ARTICLES, 'id');
      const mergedVideos = mergeData(localVideos, INITIAL_VIDEOS, 'id');
      const mergedAds = mergeData(localAds, INITIAL_ADS, 'id');
      const mergedFiles = mergeData(localFiles, INITIAL_PROJECT_FILES, 'path');
      const mergedUsers = mergeData(localUsers, INITIAL_USERS, 'id');
      const mergedMessages = mergeData(localMessages, INITIAL_MESSAGES, 'id');

      if (INITIAL_GITHUB_CONFIG) {
         const newConfig = {
            token: currentGithubConfig.token || INITIAL_GITHUB_CONFIG.token || DEFAULT_GITHUB_TOKEN,
            owner: INITIAL_GITHUB_CONFIG.owner || currentGithubConfig.owner,
            repo: INITIAL_GITHUB_CONFIG.repo || currentGithubConfig.repo,
            branch: INITIAL_GITHUB_CONFIG.branch || 'main'
         };
         localStorage.setItem(KEYS.GITHUB, JSON.stringify(newConfig));
      }

      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(mergedArticles));
      localStorage.setItem(KEYS.VIDEOS, JSON.stringify(mergedVideos));
      localStorage.setItem(KEYS.ADS, JSON.stringify(mergedAds));
      localStorage.setItem(KEYS.FILES, JSON.stringify(mergedFiles));
      localStorage.setItem(KEYS.USERS_DB, JSON.stringify(mergedUsers));
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify(mergedMessages));
      // Ticker is simple object, simple overwrite for sync
      localStorage.setItem(KEYS.TICKER, JSON.stringify(INITIAL_TICKER_CONFIG));
      
      localStorage.setItem(KEYS.TIMESTAMP, serverTimestamp.toString());
    }
  } catch (e) {
    console.error("Storage Initialization Error:", e);
  }
};

init();

export const StorageService = {
  // --- NOTIFICATIONS ---
  updateUserNotifications: (enabled: boolean) => {
    const user = StorageService.getCurrentUser();
    if (user) {
      user.notificationsEnabled = enabled;
      StorageService.externalLogin(user); // Save to storage
    }
  },

  broadcastNotification: (payload: NotificationPayload) => {
    localStorage.setItem(KEYS.LATEST_NOTIFICATION, JSON.stringify(payload));
    window.dispatchEvent(new StorageEvent('storage', {
      key: KEYS.LATEST_NOTIFICATION,
      newValue: JSON.stringify(payload)
    }));
  },

  // --- TICKER ---
  getTickerConfig: (): TickerConfig => {
    const data = localStorage.getItem(KEYS.TICKER);
    return data ? JSON.parse(data) : INITIAL_TICKER_CONFIG;
  },

  saveTickerConfig: (config: TickerConfig) => {
    localStorage.setItem(KEYS.TICKER, JSON.stringify(config));
    triggerAutoSync(); // SYNC
  },

  // --- SUBSCRIBERS ---
  getSubscribers: (): string[] => {
    const data = localStorage.getItem(KEYS.SUBSCRIBERS);
    return data ? JSON.parse(data) : [];
  },

  saveSubscriber: (email: string): boolean => {
    const list = StorageService.getSubscribers();
    if (list.includes(email)) return false; // Already subscribed
    list.push(email);
    localStorage.setItem(KEYS.SUBSCRIBERS, JSON.stringify(list));
    return true;
  },

  // --- MESSAGES ---
  getMessages: (): Message[] => {
    const data = localStorage.getItem(KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  saveMessage: (msg: Message) => {
    const msgs = StorageService.getMessages();
    msgs.unshift(msg);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(msgs));
    triggerAutoSync(); // SYNC
  },

  // --- AUTHENTICATION ---
  getCurrentUser: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  getAllUsers: (): UserProfile[] => {
    const data = localStorage.getItem(KEYS.USERS_DB);
    return data ? JSON.parse(data) : [];
  },

  externalLogin: (user: UserProfile) => {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    
    const users: UserProfile[] = JSON.parse(localStorage.getItem(KEYS.USERS_DB) || '[]');
    const existingIndex = users.findIndex(u => u.id === user.id || u.email === user.email);
    
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS_DB, JSON.stringify(users));
    triggerAutoSync(); // SYNC USER DATA
  },

  deleteUser: (userId: string) => {
    const users: UserProfile[] = JSON.parse(localStorage.getItem(KEYS.USERS_DB) || '[]');
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(KEYS.USERS_DB, JSON.stringify(updatedUsers));
    triggerAutoSync(); // SYNC
  },

  // 2. Register / Sign Up (Legacy Local)
  registerUser: (name: string, email: string): { success: boolean; message: string; otp?: string } => {
    const users: UserProfile[] = JSON.parse(localStorage.getItem(KEYS.USERS_DB) || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, message: "Email already exists." };
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`otp_${email}`, otp);
    sessionStorage.setItem(`temp_user_${email}`, JSON.stringify({ name, email }));
    return { success: true, message: "Verification code sent!", otp };
  },

  verifyAndCreateUser: (email: string, inputOtp: string): { success: boolean; user?: UserProfile } => {
    const storedOtp = sessionStorage.getItem(`otp_${email}`);
    const tempUserStr = sessionStorage.getItem(`temp_user_${email}`);

    if (storedOtp === inputOtp && tempUserStr) {
      const tempUser = JSON.parse(tempUserStr);
      const newUser: UserProfile = {
        id: 'u_' + Date.now(),
        name: tempUser.name,
        email: tempUser.email,
        joinedAt: new Date().toISOString(),
        role: 'user',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(tempUser.name)}&background=E11D48&color=fff`,
        notificationsEnabled: false
      };
      StorageService.externalLogin(newUser);
      sessionStorage.removeItem(`otp_${email}`);
      sessionStorage.removeItem(`temp_user_${email}`);
      return { success: true, user: newUser };
    }
    return { success: false };
  },

  loginUser: (email: string): { success: boolean; message: string; otp?: string } => {
    const users: UserProfile[] = JSON.parse(localStorage.getItem(KEYS.USERS_DB) || '[]');
    const user = users.find(u => u.email === email);
    if (!user) {
      return { success: false, message: "User not found. Please sign up." };
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`login_otp_${email}`, otp);
    return { success: true, message: "OTP Sent", otp };
  },

  verifyLogin: (email: string, inputOtp: string): { success: boolean; user?: UserProfile } => {
    const storedOtp = sessionStorage.getItem(`login_otp_${email}`);
    if (storedOtp === inputOtp) {
      const users: UserProfile[] = JSON.parse(localStorage.getItem(KEYS.USERS_DB) || '[]');
      const user = users.find(u => u.email === email);
      if (user) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
        sessionStorage.removeItem(`login_otp_${email}`);
        return { success: true, user };
      }
    }
    return { success: false };
  },

  socialLogin: (provider: 'google'): UserProfile => {
    const mockUser: UserProfile = {
      id: 'u_google_' + Date.now(),
      name: 'Google User',
      email: `user${Date.now()}@gmail.com`,
      joinedAt: new Date().toISOString(),
      role: 'user',
      avatar: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'
    };
    StorageService.externalLogin(mockUser);
    return mockUser;
  },

  logoutUser: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  // --- ARTICLES ---
  getArticles: (): Article[] => {
    const data = localStorage.getItem(KEYS.ARTICLES);
    const articles = data ? JSON.parse(data) : [];
    return articles.map((a: any) => ({
      ...a,
      comments: a.comments || []
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
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));

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
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(updatedArticles));
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

  incrementViews: (id: string) => {
    const viewedKey = `viewed_${id}`;
    if (sessionStorage.getItem(viewedKey)) return;

    const articles = StorageService.getArticles();
    const article = articles.find((a) => String(a.id) === String(id));
    if (article) {
      article.views += 1;
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
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
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
      triggerAutoSync(); // SYNC
      return { success: true, article };
    }
    return { success: false };
  },

  // --- VIDEOS ---
  getVideos: (): VideoPost[] => {
    const data = localStorage.getItem(KEYS.VIDEOS);
    let videos = data ? JSON.parse(data) : [];
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
    
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));

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
      localStorage.setItem(KEYS.VIDEOS, JSON.stringify(updated));
      triggerAutoSync(); // SYNC
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- VIDEO INTERACTIONS ---
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
      localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
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
      localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
      triggerAutoSync(); // SYNC COMMENTS
      return { success: true, video };
    }
    return { success: false };
  },

  // --- ADS & CONFIG ---
  getAds: (): AdConfig[] => {
    const data = localStorage.getItem(KEYS.ADS);
    return data ? JSON.parse(data) : [];
  },

  saveAds: (ads: AdConfig[]) => {
    localStorage.setItem(KEYS.ADS, JSON.stringify(ads));
    triggerAutoSync(); // SYNC
  },

  getApiKey: (): string => {
    return localStorage.getItem(KEYS.API_KEY) || DEFAULT_API_KEY;
  },

  saveApiKey: (key: string) => {
    localStorage.setItem(KEYS.API_KEY, key.trim());
    triggerAutoSync(); // SYNC
  },

  getGithubConfig: (): GithubConfig => {
    const data = localStorage.getItem(KEYS.GITHUB);
    const config = data ? JSON.parse(data) : { token: '', owner: '', repo: '', branch: 'main' };
    if (!config.token && DEFAULT_GITHUB_TOKEN) {
      config.token = DEFAULT_GITHUB_TOKEN;
    }
    // Infer from email if needed
    if (!config.owner) config.owner = "Jobsofficial786";
    if (!config.repo) config.repo = "roza-news";
    
    return config;
  },

  saveGithubConfig: (config: GithubConfig) => {
    localStorage.setItem(KEYS.GITHUB, JSON.stringify(config));
    // No trigger sync here to avoid infinite loop or pushing unstable config
  },

  getFiles: (): VirtualFile[] => {
    const data = localStorage.getItem(KEYS.FILES);
    return data ? JSON.parse(data) : [];
  },

  saveFile: (file: VirtualFile) => {
    const files = StorageService.getFiles();
    const index = files.findIndex(f => f.path === file.path);
    if (index >= 0) files[index] = file;
    else files.push(file);
    localStorage.setItem(KEYS.FILES, JSON.stringify(files));
    triggerAutoSync(); // SYNC CODE CHANGES
  },

  // ADMIN AUTH
  login: (pass: string): boolean => {
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
  },

  factoryReset: () => {
    localStorage.clear();
    window.location.reload();
  },

  getUserId: (): string => {
    const u = StorageService.getCurrentUser();
    return u ? u.id : '';
  }
};