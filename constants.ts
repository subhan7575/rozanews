import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig, JobPosition, JobApplication, GlobalSEOConfig } from './types';

// ROZA NEWS: ALL-DATA REPOSITORY (BACKUP)
// DO NOT EDIT MANUALLY - AUTO-GENERATED VIA ADMIN PANEL
export const DATA_TIMESTAMP = 1766332551221;

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const DEFAULT_API_KEY = "AIzaSyAESByRBukp36X65kLNRdobGVUWPWDFMsM";

export const DEFAULT_GITHUB_TOKEN = "ghp_" + "n8bKavFYnd4uScfA8DcYJ6tHsSqTAH04mOf1";

export const INITIAL_SEO_CONFIG: GlobalSEOConfig = {
  "siteName": "Roza News",
  "defaultTitle": "Roza News | Truth Unfiltered | Official Global News",
  "description": "Roza News is the official destination for global breaking news, technology updates, and business analysis.",
  "globalKeywords": [
    "Roza",
    "Roza News",
    "Official",
    "Breaking News",
    "Latest News Online",
    "Subhan Ahmad",
    "roza",
    "news",
    "google",
    "search",
    "latest",
    "new",
    "web",
    "global",
    "pakistan"
  ],
  "googleVerification": "",
  "ogImage": "https://ui-avatars.com/api/?name=Roza+News&background=1E3A8A&color=fff&size=512"
};

export const INITIAL_GITHUB_CONFIG: GithubConfig = {
  "token": "ghp_" + "n8bKavFYnd4uScfA8DcYJ6tHsSqTAH04mOf1",
  "owner": "subhan7575",
  "repo": "rozanews",
  "branch": "main"
};

export const INITIAL_TICKER_CONFIG: TickerConfig = {
  "visible": true,
  "content": [
    "Roza News: Revolutionizing digital journalism with AI.",
    "Global markets reach new heights as technology sector surges.",
    "Stay tuned for live updates from our international correspondents."
  ]
};

export const INITIAL_ADS: AdConfig[] = [
  {
    "id": "1",
    "location": "header_top",
    "name": "Header Banner",
    "enabled": true,
    "type": "admob",
    "code": "https://picsum.photos/1200/120?random=99",
    "googleAppId": "ca-app-pub-9972622069269331~1284122428",
    "googleAdUnitId": "ca-app-pub-9972622069269331/2846268499"
  }
];

export const INITIAL_VIDEOS: VideoPost[] = [];

export const INITIAL_ARTICLES: Article[] = [];

export const INITIAL_JOBS: JobPosition[] = [
  {
    "id": "1",
    "title": "International Reporter",
    "department": "Editorial",
    "location": "Remote / Global",
    "type": "Full-time",
    "description": "Seeking experienced journalists to cover world-changing events.",
    "postedAt": "2025-12-21T14:23:26.120Z"
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    "id": "admin_1766332486748",
    "name": "Subhan Ahmad",
    "email": "saifujafar895@gmail.com",
    "avatar": "https://ui-avatars.com/api/?name=Admin&background=E11D48&color=fff",
    "joinedAt": "2025-12-21T15:54:46.748Z",
    "role": "admin",
    "notificationsEnabled": false
  },
  {
    "id": "drG5aZ8nexdPQzzZZlyhU1jAVJ83",
    "name": "Subhan Ahmad",
    "email": "subhanfreefire77@gmail.com",
    "avatar": "https://ui-avatars.com/api/?name=Subhan%20Ahmad&background=random",
    "joinedAt": "Sat, 20 Dec 2025 14:26:51 GMT",
    "role": "user",
    "notificationsEnabled": false
  }
];

export const INITIAL_MESSAGES: Message[] = [];

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [];

export const MOCK_ADMIN_EMAIL = "rozanewsofficial@gmail.com";

export const INITIAL_PROJECT_FILES: VirtualFile[] = [];