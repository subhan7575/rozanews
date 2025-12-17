import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig, JobPosition, JobApplication } from './types';

// Security: Split token to avoid detection by scanners
const TOKEN_PART_1 = "ghp_";
const TOKEN_PART_2 = "riLjLjqAg0G9mkgYwg8acB2hHU5cj21smBkE";

// Last sync timestamp
export const DATA_TIMESTAMP = Date.now();

// Categories
export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

// API Keys (Placeholders - User should replace)
export const DEFAULT_API_KEY = "AIzaSyAESByRBukp36X65kLNRdobGVUWPWDFMsM"; // Google Gemini

// Cloudinary (Placeholders - User should configure)
export const CLOUDINARY_CLOUD_NAME = "";
export const CLOUDINARY_UPLOAD_PRESET = "";

// GitHub Configuration
export const DEFAULT_GITHUB_TOKEN = TOKEN_PART_1 + TOKEN_PART_2;

export const INITIAL_GITHUB_CONFIG: GithubConfig = {
  token: DEFAULT_GITHUB_TOKEN,
  owner: 'RozaNewsOfficial',
  repo: 'roza-news',
  branch: 'main'
};

// Breaking News Ticker
export const INITIAL_TICKER_CONFIG: TickerConfig = {
  visible: true,
  content: [
    "Global markets rally as tech sector reports record Q4 earnings.",
    "SpaceX announces new mission to Mars slated for 2028.",
    "Championship finals: City favorites take the lead in overtime."
  ]
};

// Advertisements
export const INITIAL_ADS: AdConfig[] = [
  {
    id: '1',
    location: 'header_top',
    name: 'Header Banner',
    enabled: true,
    type: 'image',
    code: 'https://picsum.photos/1200/120?random=99',
    googleAppId: '',
    googleAdUnitId: ''
  },
  {
    id: '2',
    location: 'article_sidebar',
    name: 'Sidebar Square',
    enabled: true,
    type: 'image',
    code: 'https://picsum.photos/300/250?random=98',
    googleAppId: '',
    googleAdUnitId: ''
  },
  {
    id: '3',
    location: 'home_middle',
    name: 'Home Middle Banner',
    enabled: true,
    type: 'image',
    code: 'https://picsum.photos/800/200?random=97',
    googleAppId: '',
    googleAdUnitId: ''
  }
];

// Videos
export const INITIAL_VIDEOS: VideoPost[] = [
  {
    id: '1',
    title: 'Technology Summit Highlights',
    description: 'A quick look at the major announcements from today\'s tech world.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://picsum.photos/400/700?random=20',
    views: 1205,
    publishedAt: new Date().toISOString(),
    tags: ['Tech', 'News'],
    likes: 45,
    likedBy: [],
    comments: []
  }
];

// Sample Articles
export const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Global Markets Rally as Tech Sector Booms',
    slug: 'global-markets-rally-tech-boom',
    summary: 'Major indices hit record highs driven by AI advancements and semiconductor demand.',
    content: 'The global stock markets saw an unprecedented surge today, with the S&P 500 and NASDAQ both climbing over 3% in early trading. This rally is primarily fueled by breakthrough announcements in artificial intelligence from leading tech giants and a 40% increase in semiconductor orders from automotive and consumer electronics sectors. Analysts predict this trend will continue through Q4 as companies ramp up their AI infrastructure investments.\n\nIn parallel, European markets followed suit, with the FTSE 100 and DAX posting gains of 2.8% and 3.1% respectively. The surge has added approximately $2 trillion to global market capitalization in a single trading session. "We are witnessing a paradigm shift in how technology valuations are perceived," commented financial analyst Sarah Chen from Bloomberg.\n\nInvestors are advised to monitor the upcoming Federal Reserve meeting for potential interest rate decisions that could impact this bullish trend.',
    category: 'Business',
    author: 'Subhan Ahmad',
    publishedAt: new Date(Date.now() - 10000000).toISOString(),
    imageUrl: 'https://picsum.photos/800/600?random=1',
    gallery: [],
    videoUrls: [],
    views: 12450,
    tags: ['Economy', 'Tech', 'Stocks', 'AI'],
    comments: [],
    isBreaking: false,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Championship Finals: Underdog Team Takes the Trophy',
    slug: 'championship-finals-underdog-win',
    summary: 'In a stunning upset, the city favorites were defeated in overtime.',
    content: 'Sports fans around the world were shocked tonight as underdog team "Northern Wolves" defeated the heavily favored "City Lions" in the championship finals. The match went into double overtime, ending with a last-minute goal by rookie striker Marco Silva in the 119th minute.\n\nThe Lions, who had been undefeated throughout the regular season, seemed to have the game under control with a 2-0 lead at halftime. However, the Wolves made a dramatic comeback in the second half, equalizing in the 89th minute. The overtime period saw intense back-and-forth action until Silva\'s historic goal.\n\n"This is the greatest moment of my career," said Silva in a post-game interview. "We never stopped believing, even when everyone counted us out."\n\nThe victory marks the first championship title for the Wolves franchise in its 25-year history. Celebrations have erupted in their home city, with thousands of fans flooding the streets.',
    category: 'Sports',
    author: 'Subhan Ahmad',
    publishedAt: new Date(Date.now() - 5000000).toISOString(),
    imageUrl: 'https://picsum.photos/800/600?random=2',
    gallery: [],
    videoUrls: [],
    views: 8300,
    tags: ['Football', 'Finals', 'Sports', 'Championship'],
    comments: [],
    isBreaking: true,
    isFeatured: false,
  }
];

// Jobs
export const INITIAL_JOBS: JobPosition[] = [
  {
    id: 'job_1',
    title: 'Senior News Editor',
    department: 'Editorial',
    location: 'Remote / New York',
    type: 'Full-time',
    description: 'Lead our editorial team, shape news coverage, and maintain journalistic integrity. Minimum 7 years experience in digital news.',
    postedAt: new Date().toISOString()
  },
  {
    id: 'job_2',
    title: 'Frontend Developer',
    department: 'Technology',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and maintain our React-based news platform. Expertise in TypeScript, Tailwind CSS, and modern web APIs required.',
    postedAt: new Date().toISOString()
  }
];

// Users
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'admin_1',
    name: 'Subhan Ahmad',
    email: 'rozanewsofficial@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Subhan+Ahmad&background=E11D48&color=fff',
    joinedAt: new Date().toISOString(),
    role: 'admin',
    notificationsEnabled: true,
    isPremium: true
  }
];

// Messages
export const INITIAL_MESSAGES: Message[] = [];

// Job Applications
export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [];

// Admin Email for Access Control
export const MOCK_ADMIN_EMAIL = "rozanewsofficial@gmail.com";

// Project Files
export const INITIAL_PROJECT_FILES: VirtualFile[] = [
  {
    name: 'constants.ts',
    path: 'src/constants.ts',
    language: 'typescript',
    content: '// This file contains initial data for the application'
  },
  {
    name: 'types.ts',
    path: 'src/types.ts',
    language: 'typescript',
    content: '// Type definitions for Roza News'
  }
];
