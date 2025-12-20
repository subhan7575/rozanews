
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, Comment, UserProfile, NotificationPayload, Message, TickerConfig, CloudinaryConfig, JobPosition, JobApplication, GlobalSEOConfig } from '../types';
import { INITIAL_ARTICLES, INITIAL_ADS, INITIAL_PROJECT_FILES, DEFAULT_API_KEY, INITIAL_VIDEOS, DATA_TIMESTAMP, INITIAL_GITHUB_CONFIG, DEFAULT_GITHUB_TOKEN, INITIAL_USERS, INITIAL_MESSAGES, INITIAL_TICKER_CONFIG, INITIAL_JOBS, INITIAL_JOB_APPLICATIONS, INITIAL_SEO_CONFIG } from '../constants';

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
  USERS_DB: 'roza_users_db',
  MESSAGES: 'roza_messages_db',
  CURRENT_USER: 'roza_current_user_session',
  LATEST_NOTIFICATION: 'roza_latest_broadcast',
  SUBSCRIBERS: 'roza_subscribers',
  TICKER: 'roza_ticker_config',
  BOOKMARKS: 'roza_user_bookmarks',
  JOBS: 'roza_jobs_listings',
  JOB_APPLICATIONS: 'roza_job_applications',
  SEO: 'roza_seo_config'
};

const ADMIN_EMAILS = ['rozanewsofficial@gmail.com', 'saifujafar895@gmail.com'];

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    console.error("Storage Error:", e);
  }
};

const safeParse = <T>(data: string | null, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

const mergeData = <T extends { id?: string; path?: string }>(localList: T[], serverList: T[], idKey: keyof T = 'id' as keyof T): T[] => {
  const mergedMap = new Map();
  serverList.forEach(item => {
    const key = String(item[idKey]);
    mergedMap.set(key, item);
  });
  localList.forEach(item => {
    const key = String(item[idKey]);
    if (!mergedMap.has(key)) {
        mergedMap.set(key, item);
    }
  });
  return Array.from(mergedMap.values());
};

const init = () => {
  try {
    const localTimestampStr = localStorage.getItem(KEYS.TIMESTAMP);
    const localTimestamp = localTimestampStr ? parseInt(localTimestampStr) : 0;
    const serverTimestamp = DATA_TIMESTAMP || 0;

    if (!localStorage.getItem(KEYS.ARTICLES)) safeSetItem(KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
    if (!localStorage.getItem(KEYS.ADS)) safeSetItem(KEYS.ADS, JSON.stringify(INITIAL_ADS));
    if (!localStorage.getItem(KEYS.FILES)) safeSetItem(KEYS.FILES, JSON.stringify(INITIAL_PROJECT_FILES));
    if (!localStorage.getItem(KEYS.VIDEOS)) safeSetItem(KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
    if (!localStorage.getItem(KEYS.USERS_DB)) safeSetItem(KEYS.USERS_DB, JSON.stringify(INITIAL_USERS));
    if (!localStorage.getItem(KEYS.MESSAGES)) safeSetItem(KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    if (!localStorage.getItem(KEYS.TICKER)) safeSetItem(KEYS.TICKER, JSON.stringify(INITIAL_TICKER_CONFIG));
    if (!localStorage.getItem(KEYS.JOBS)) safeSetItem(KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    if (!localStorage.getItem(KEYS.JOB_APPLICATIONS)) safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(INITIAL_JOB_APPLICATIONS));
    if (!localStorage.getItem(KEYS.SEO)) safeSetItem(KEYS.SEO, JSON.stringify(INITIAL_SEO_CONFIG));

    if (serverTimestamp > localTimestamp) {
      const localArticles = safeParse(localStorage.getItem(KEYS.ARTICLES), []);
      const localUsers = safeParse(localStorage.getItem(KEYS.USERS_DB), []);
      const localJobs = safeParse(localStorage.getItem(KEYS.JOBS), []);
      const localApps = safeParse(localStorage.getItem(KEYS.JOB_APPLICATIONS), []);

      safeSetItem(KEYS.ARTICLES, JSON.stringify(mergeData(localArticles, INITIAL_ARTICLES)));
      safeSetItem(KEYS.USERS_DB, JSON.stringify(mergeData(localUsers, INITIAL_USERS)));
      safeSetItem(KEYS.JOBS, JSON.stringify(mergeData(localJobs, INITIAL_JOBS)));
      safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(mergeData(localApps, INITIAL_JOB_APPLICATIONS)));
      
      // Update SEO if server version is newer
      safeSetItem(KEYS.SEO, JSON.stringify(INITIAL_SEO_CONFIG));
      
      safeSetItem(KEYS.TIMESTAMP, serverTimestamp.toString());
    }
  } catch (e) {
    console.error("Storage Initialization Error:", e);
  }
};

init();

export const StorageService = {
  getSEOConfig: (): GlobalSEOConfig => safeParse(localStorage.getItem(KEYS.SEO), INITIAL_SEO_CONFIG),
  saveSEOConfig: (config: GlobalSEOConfig) => safeSetItem(KEYS.SEO, JSON.stringify(config)),

  getJobs: (): JobPosition[] => safeParse(localStorage.getItem(KEYS.JOBS), []),
  saveJob: (job: JobPosition) => {
    const jobs = StorageService.getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index >= 0) jobs[index] = job; else jobs.unshift(job);
    safeSetItem(KEYS.JOBS, JSON.stringify(jobs));
  },
  deleteJob: (id: string) => {
    const updated = StorageService.getJobs().filter(j => j.id !== id);
    safeSetItem(KEYS.JOBS, JSON.stringify(updated));
  },

  getJobApplications: (): JobApplication[] => safeParse(localStorage.getItem(KEYS.JOB_APPLICATIONS), []),
  getUserApplications: (userId: string): JobApplication[] => StorageService.getJobApplications().filter(a => a.applicantId === userId),
  saveJobApplication: (app: JobApplication) => {
    const apps = StorageService.getJobApplications();
    apps.unshift(app);
    safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(apps));
  },
  updateJobApplicationStatus: (id: string, status: JobApplication['status']) => {
    const apps = StorageService.getJobApplications();
    const index = apps.findIndex(a => a.id === id);
    if (index >= 0) { apps[index].status = status; safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(apps)); }
  },
  deleteJobApplication: (id: string) => {
    const updated = StorageService.getJobApplications().filter(a => a.id !== id);
    safeSetItem(KEYS.JOB_APPLICATIONS, JSON.stringify(updated));
  },

  getArticles: (): Article[] => safeParse(localStorage.getItem(KEYS.ARTICLES), []),
  saveArticle: (article: Article) => {
    const articles = StorageService.getArticles();
    const index = articles.findIndex(a => a.id === article.id);
    if (index >= 0) articles[index] = article; else articles.unshift(article);
    safeSetItem(KEYS.ARTICLES, JSON.stringify(articles));
  },
  deleteArticle: (id: string) => {
    const updated = StorageService.getArticles().filter(a => a.id !== id);
    safeSetItem(KEYS.ARTICLES, JSON.stringify(updated));
  },
  getArticleBySlug: (slug: string) => StorageService.getArticles().find(a => a.slug === slug),
  incrementViews: (id: string) => {
    const articles = StorageService.getArticles();
    const article = articles.find(a => a.id === id);
    if (article) { article.views++; safeSetItem(KEYS.ARTICLES, JSON.stringify(articles)); }
  },
  
  addCommentToArticle: (articleId: string, text: string) => {
    const user = StorageService.getCurrentUser();
    if (!user) return { success: false };
    const articles = StorageService.getArticles();
    const index = articles.findIndex(a => a.id === articleId);
    if (index === -1) return { success: false };
    const newComment: Comment = {
      id: 'c_' + Date.now(),
      userId: user.id,
      username: user.name,
      userAvatar: user.avatar,
      text: text,
      createdAt: new Date().toISOString()
    };
    if (!articles[index].comments) articles[index].comments = [];
    articles[index].comments!.unshift(newComment);
    safeSetItem(KEYS.ARTICLES, JSON.stringify(articles));
    return { success: true, article: articles[index] };
  },

  getVideos: (): VideoPost[] => safeParse(localStorage.getItem(KEYS.VIDEOS), []),
  saveVideo: (video: VideoPost) => {
    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => v.id === video.id);
    if (index >= 0) videos[index] = video; else videos.unshift(video);
    safeSetItem(KEYS.VIDEOS, JSON.stringify(videos));
  },
  deleteVideo: (id: string) => {
    const updated = StorageService.getVideos().filter(v => v.id !== id);
    safeSetItem(KEYS.VIDEOS, JSON.stringify(updated));
  },
  
  toggleLikeVideo: (videoId: string) => {
    const user = StorageService.getCurrentUser();
    if (!user) return { success: false };
    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => v.id === videoId);
    if (index === -1) return { success: false };
    const video = videos[index];
    const likedIndex = video.likedBy.indexOf(user.id);
    if (likedIndex >= 0) {
      video.likedBy.splice(likedIndex, 1);
      video.likes--;
    } else {
      video.likedBy.push(user.id);
      video.likes++;
    }
    safeSetItem(KEYS.VIDEOS, JSON.stringify(videos));
    return { success: true, video: video };
  },

  addCommentToVideo: (videoId: string, text: string) => {
    const user = StorageService.getCurrentUser();
    if (!user) return { success: false };
    const videos = StorageService.getVideos();
    const index = videos.findIndex(v => v.id === videoId);
    if (index === -1) return { success: false };
    const newComment: Comment = {
      id: 'vc_' + Date.now(),
      userId: user.id,
      username: user.name,
      userAvatar: user.avatar,
      text: text,
      createdAt: new Date().toISOString()
    };
    videos[index].comments.unshift(newComment);
    safeSetItem(KEYS.VIDEOS, JSON.stringify(videos));
    return { success: true, video: videos[index] };
  },

  getMessages: (): Message[] => safeParse(localStorage.getItem(KEYS.MESSAGES), []),
  saveMessage: (msg: Message) => {
    const msgs = StorageService.getMessages();
    msgs.unshift(msg);
    safeSetItem(KEYS.MESSAGES, JSON.stringify(msgs));
  },

  getTickerConfig: (): TickerConfig => safeParse(localStorage.getItem(KEYS.TICKER), INITIAL_TICKER_CONFIG),
  saveTickerConfig: (config: TickerConfig) => safeSetItem(KEYS.TICKER, JSON.stringify(config)),

  getAds: (): AdConfig[] => safeParse(localStorage.getItem(KEYS.ADS), []),
  saveAds: (ads: AdConfig[]) => safeSetItem(KEYS.ADS, JSON.stringify(ads)),

  getApiKey: () => localStorage.getItem(KEYS.API_KEY) || DEFAULT_API_KEY,
  saveApiKey: (key: string) => safeSetItem(KEYS.API_KEY, key),
  getGithubConfig: (): GithubConfig => safeParse(localStorage.getItem(KEYS.GITHUB), INITIAL_GITHUB_CONFIG),
  saveGithubConfig: (config: GithubConfig) => safeSetItem(KEYS.GITHUB, JSON.stringify(config)),
  getCloudinaryConfig: (): CloudinaryConfig => safeParse(localStorage.getItem(KEYS.CLOUDINARY), { cloudName: '', uploadPreset: '' }),
  saveCloudinaryConfig: (config: CloudinaryConfig) => safeSetItem(KEYS.CLOUDINARY, JSON.stringify(config)),
  getFiles: (): VirtualFile[] => safeParse(localStorage.getItem(KEYS.FILES), []),
  saveFile: (file: VirtualFile) => {
    const files = StorageService.getFiles();
    const index = files.findIndex(f => f.path === file.path);
    if (index >= 0) files[index] = file; else files.push(file);
    safeSetItem(KEYS.FILES, JSON.stringify(files));
  },

  getAllUsers: (): UserProfile[] => safeParse(localStorage.getItem(KEYS.USERS_DB), []),
  getCurrentUser: (): UserProfile | null => safeParse(localStorage.getItem(KEYS.CURRENT_USER), null),
  externalLogin: (user: UserProfile) => {
    safeSetItem(KEYS.CURRENT_USER, JSON.stringify(user));
    const users = StorageService.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id || (u.email && u.email === user.email));
    if (idx >= 0) { users[idx] = { ...users[idx], ...user }; } else { users.push(user); }
    safeSetItem(KEYS.USERS_DB, JSON.stringify(users));
  },
  updateUserProfile: (user: UserProfile) => {
    safeSetItem(KEYS.CURRENT_USER, JSON.stringify(user));
    const users = StorageService.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) { users[idx] = user; safeSetItem(KEYS.USERS_DB, JSON.stringify(users)); }
  },
  deleteUser: (id: string) => {
    const updated = StorageService.getAllUsers().filter(u => u.id !== id);
    safeSetItem(KEYS.USERS_DB, JSON.stringify(updated));
  },
  logoutUser: () => localStorage.removeItem(KEYS.CURRENT_USER),
  isAuthenticated: () => {
    const user = StorageService.getCurrentUser();
    return !!(user && user.email && ADMIN_EMAILS.includes(user.email));
  },
  logout: () => localStorage.removeItem(KEYS.CURRENT_USER),
  factoryReset: () => { localStorage.clear(); window.location.reload(); },

  updateUserNotifications: (enabled: boolean) => {
    const user = StorageService.getCurrentUser();
    if (user) { user.notificationsEnabled = enabled; StorageService.externalLogin(user); }
  },
  broadcastNotification: (payload: NotificationPayload) => {
    safeSetItem(KEYS.LATEST_NOTIFICATION, JSON.stringify(payload));
  },

  getBookmarkedIds: (): string[] => safeParse(localStorage.getItem(KEYS.BOOKMARKS), []),
  toggleBookmark: (id: string) => {
    const ids = StorageService.getBookmarkedIds();
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1); else ids.push(id);
    safeSetItem(KEYS.BOOKMARKS, JSON.stringify(ids));
    window.dispatchEvent(new Event('bookmarks_updated'));
    return idx === -1;
  },
  isBookmarked: (id: string) => StorageService.getBookmarkedIds().includes(id),
  
  saveSubscriber: (email: string): boolean => {
    const subscribers = safeParse<string[]>(localStorage.getItem(KEYS.SUBSCRIBERS), []);
    if (subscribers.includes(email)) return false;
    subscribers.push(email);
    safeSetItem(KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    return true;
  },
};