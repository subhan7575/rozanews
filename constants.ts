
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig, JobPosition, JobApplication } from './types';

// --- ROZA NEWS: GLOBAL DATA REPOSITORY ---
// This file stores ALL website data. When you sync from Admin, this file is updated on GitHub.
// Replacing all files for an update will NOT delete data if this file is preserved or updated.

export const DATA_TIMESTAMP = 1732000000000; 

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const DEFAULT_API_KEY = "AIzaSyAESByRBukp36X65kLNRdobGVUWPWDFMsM";

export const DEFAULT_GITHUB_TOKEN = "ghp_" + "riLjLjqAg0G9mkgYwg8acB2hHU5cj21smBkE";

// Default Cloudinary configuration (can be overridden in Admin)
export const CLOUDINARY_CLOUD_NAME = "demo";
export const CLOUDINARY_UPLOAD_PRESET = "roza_preset";

// Settings
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
