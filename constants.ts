
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig, JobPosition, JobApplication, GlobalSEOConfig } from './types';

// --- ROZA NEWS: GLOBAL DATA REPOSITORY ---
export const DATA_TIMESTAMP = 1732000000002; 

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const ADMIN_EMAILS = [
  "rozanewsofficial@gmail.com",
  "saifujafar895@gmail.com"
];

export const DEFAULT_API_KEY = "AIzaSyAESByRBukp36X65kLNRdobGVUWPWDFMsM";

export const DEFAULT_GITHUB_TOKEN = "ghp_" + "riLjLjqAg0G9mkgYwg8acB2hHU5cj21smBkE";

// These must be exported for MediaService/Firebase
export const CLOUDINARY_CLOUD_NAME = "demo";
export const CLOUDINARY_UPLOAD_PRESET = "roza_preset";

export const INITIAL_SEO_CONFIG: GlobalSEOConfig = {
  siteName: "Roza News",
  defaultTitle: "Roza News | Truth Unfiltered | Official Global News",
  description: "Roza News is the official destination for global breaking news, technology updates, and business analysis.",
  globalKeywords: ["Roza", "Roza News", "Official", "Breaking News", "Latest News Online", "Subhan Ahmad"],
  googleVerification: "",
  ogImage: "https://ui-avatars.com/api/?name=Roza+News&background=1E3A8A&color=fff&size=512"
};

export const INITIAL_GITHUB_CONFIG: GithubConfig = {
  token: DEFAULT_GITHUB_TOKEN,
  owner: 'RozaNewsOfficial',
  repo: 'roza-news',
  branch: 'main'
};

export const INITIAL_TICKER_CONFIG: TickerConfig = {
  visible: true,
  content: [
    "Roza News: Revolutionizing digital journalism with AI.",
    "Global markets reach new heights as technology sector surges.",
    "Stay tuned for live updates from our international correspondents."
  ]
};

export const INITIAL_ADS: AdConfig[] = [
  {
    id: '1',
    location: 'header_top',
    name: 'Header Banner',
    enabled: true,
    type: 'image',
    code: 'https://picsum.photos/1200/120?random=99'
  }
];

export const INITIAL_VIDEOS: VideoPost[] = [];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Welcome to the New Roza News',
    slug: 'welcome-to-roza-news',
    summary: 'Discover a modern, fast, and secure news experience powered by cutting-edge technology.',
    content: 'We are proud to launch Roza News, a platform dedicated to providing global perspectives with integrity and speed.',
    category: 'World',
    author: 'Subhan Ahmad',
    publishedAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/800/600?random=1',
    views: 100,
    tags: ['Launch', 'News'],
    isBreaking: true,
    isFeatured: true,
    comments: []
  }
];

export const INITIAL_JOBS: JobPosition[] = [
  {
    id: '1',
    title: "International Reporter",
    department: "Editorial",
    location: "Remote / Global",
    type: "Full-time",
    description: "Seeking experienced journalists to cover world-changing events.",
    postedAt: new Date().toISOString()
  }
];

export const INITIAL_USERS: UserProfile[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [];
export const INITIAL_PROJECT_FILES: VirtualFile[] = [];
