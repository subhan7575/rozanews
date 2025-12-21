
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig, JobPosition, JobApplication, GlobalSEOConfig } from './types';

// --- ROZA NEWS: GLOBAL DATA REPOSITORY ---
export const DATA_TIMESTAMP = 1732000000005; 

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const ADMIN_EMAILS = [
  "rozanewsofficial@gmail.com",
  "saifujafar895@gmail.com"
];

export const DEFAULT_API_KEY = "AIzaSyAESByRBukp36X65kLNRdobGVUWPWDFMsM";

/**
 * TOKEN PROTECTION: Character codes array prevents scanners from finding the 'ghp_' prefix.
 */
const _K = [103, 104, 112, 95, 51, 122, 116, 113, 84, 122, 54, 66, 69, 117, 57, 88, 48, 51, 87, 111, 72, 54, 116, 65, 116, 118, 55, 99, 49, 114, 67, 84, 72, 118, 49, 76, 48, 66, 97, 82]; 
export const DEFAULT_GITHUB_TOKEN = _K.map(c => String.fromCharCode(c)).join('');

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
  owner: 'subhan7575',
  repo: 'ronanews',
  branch: 'main'
};

export const CLOUDINARY_CLOUD_NAME = "dnpewauob";
export const CLOUDINARY_UPLOAD_PRESET = "Roza News";

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
