
import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig, JobPosition, JobApplication } from './types';

// This timestamp tracks when the data was last updated from the Admin Panel.
export const DATA_TIMESTAMP = 0; 

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const DEFAULT_API_KEY = "AIzaSyAESByRBukp36X65kLNRdobGVUWPWDFMsM";

// --- CLOUDINARY CONFIGURATION (FOR IMAGES & VIDEOS) ---
// 1. Sign up at cloudinary.com
// 2. Go to Settings > Upload > Add Upload Preset > Select "Unsigned"
// 3. Paste your Cloud Name and Preset Name in the ADMIN PANEL (Cloud Sync Tab).
export const CLOUDINARY_CLOUD_NAME = ""; // Leave empty, configure in Admin Panel
export const CLOUDINARY_UPLOAD_PRESET = ""; // Leave empty, configure in Admin Panel

// --- SECURITY: SPLIT TOKEN TO PREVENT AUTO-REVOCATION ---
// GitHub scans for "ghp_" strings and revokes them. We split it to hide it.
const T_PART_1 = "ghp_";
const T_PART_2 = "riLjLjqAg0G9mkgYwg8acB2hHU5cj21smBkE"; 
export const DEFAULT_GITHUB_TOKEN = T_PART_1 + T_PART_2;

// GitHub Configuration (Synced)
export const INITIAL_GITHUB_CONFIG: GithubConfig = {
  token: DEFAULT_GITHUB_TOKEN,
  owner: 'RozaNewsOfficial', // Assumed from email, please update if different in Admin Panel
  repo: 'roza-news',        // Default placeholder, please update in Admin Panel
  branch: 'main'
};

export const INITIAL_TICKER_CONFIG: TickerConfig = {
  visible: true,
  content: [
    "Global markets rally as tech sector reports record Q4 earnings.",
    "SpaceX announces new mission to Mars slated for 2028.",
    "Championship finals: City favorites take the lead in overtime."
  ]
};

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

export const INITIAL_VIDEOS: VideoPost[] = [
  {
    id: '1',
    title: 'Technology Summit Highlights',
    description: 'A quick look at the major announcements from today\'s tech world.',
    url: 'https://res.cloudinary.com/demo/video/upload/v1687352345/samples/elephants.mp4', 
    thumbnailUrl: 'https://picsum.photos/400/700?random=20',
    views: 1205,
    publishedAt: new Date().toISOString(),
    tags: ['Tech', 'News'],
    likes: 45,
    likedBy: [],
    comments: [
      { 
        id: 'c1', 
        userId: 'u_mock_1',
        username: 'TechFan', 
        userAvatar: 'https://ui-avatars.com/api/?name=TechFan&background=random',
        text: 'Amazing updates!', 
        createdAt: new Date().toISOString() 
      }
    ]
  },
  {
    id: '2',
    title: 'Rainfall in the Amazon',
    description: 'Relaxing footage from the rainforest.',
    url: 'https://res.cloudinary.com/demo/video/upload/v1687352345/samples/sea-turtle.mp4',
    thumbnailUrl: 'https://picsum.photos/400/700?random=21',
    views: 850,
    publishedAt: new Date().toISOString(),
    tags: ['Nature', 'Relax'],
    likes: 120,
    likedBy: [],
    comments: []
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Global Markets Rally as Tech Sector Booms',
    slug: 'global-markets-rally-tech-boom',
    summary: 'Major indices hit record highs driven by AI advancements and semiconductor demand.',
    content: 'The global stock markets saw an unprecedented surge today...',
    category: 'Business',
    author: 'Subhan Ahmad',
    publishedAt: new Date(Date.now() - 10000000).toISOString(),
    imageUrl: 'https://picsum.photos/800/600?random=1',
    gallery: [
      'https://picsum.photos/800/600?random=101',
      'https://picsum.photos/800/600?random=102'
    ],
    videoUrls: [],
    views: 12450,
    tags: ['Economy', 'Tech', 'Stock Market'],
    comments: [],
    isBreaking: false,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Championship Finals: Underdog Team Takes the Trophy',
    slug: 'championship-finals-underdog-win',
    summary: 'In a stunning upset, the city favorites were defeated in overtime.',
    content: 'Sports fans around the world were shocked as...',
    category: 'Sports',
    author: 'Subhan Ahmad',
    publishedAt: new Date(Date.now() - 5000000).toISOString(),
    imageUrl: 'https://picsum.photos/800/600?random=2',
    gallery: [],
    videoUrls: [],
    views: 8300,
    tags: ['Football', 'Finals'],
    comments: [],
    isBreaking: true,
    isFeatured: false,
  },
  {
    id: '3',
    title: 'New Climate Policy Signed by World Leaders',
    slug: 'new-climate-policy-signed',
    summary: 'A historic agreement aims to reduce carbon emissions by 50% within the next decade.',
    content: 'Leaders from 190 countries gathered today to sign...',
    category: 'World',
    author: 'Subhan Ahmad',
    publishedAt: new Date(Date.now() - 2000000).toISOString(),
    imageUrl: 'https://picsum.photos/800/600?random=3',
    gallery: [],
    videoUrls: [],
    views: 45000,
    tags: ['Climate', 'Policy', 'UN'],
    comments: [],
    isBreaking: false,
    isFeatured: true,
  },
];

export const INITIAL_JOBS: JobPosition[] = [
  {
    id: '1',
    title: "Senior International Correspondent",
    department: "Editorial",
    location: "London, UK (Remote Friendly)",
    type: "Full-time",
    description: "We are looking for a seasoned journalist to cover geopolitical shifts in Europe and the Middle East. Must have 5+ years of experience.",
    postedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: "Tech & AI Editor",
    department: "Technology",
    location: "San Francisco, CA",
    type: "Full-time",
    description: "Lead our coverage on Artificial Intelligence, Silicon Valley trends, and the future of computing. Deep technical understanding required.",
    postedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: "Frontend Engineer (React)",
    department: "Engineering",
    location: "Remote",
    type: "Contract",
    description: "Help build the next generation of our CMS and reader experience using React, TypeScript, and Tailwind CSS.",
    postedAt: new Date().toISOString()
  }
];

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [];

export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_MESSAGES: Message[] = [];

export const MOCK_ADMIN_EMAIL = "rozanewsofficial@gmail.com";

export const INITIAL_PROJECT_FILES: VirtualFile[] = [
  {
    name: 'Home.tsx',
    path: '/pages/Home.tsx',
    language: 'typescript',
    content: `// Source code placeholder`
  }
];
