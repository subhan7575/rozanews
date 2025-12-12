import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig } from './types';

// UPDATED VIA ADMIN PANEL SYNC - DO NOT EDIT MANUALLY
export const DATA_TIMESTAMP = 1765556285477;

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const DEFAULT_API_KEY = "AIzaSyAESByRBukp36X65kLNRdobGVUWPWDFMsM";

export const DEFAULT_GITHUB_TOKEN = "ghp_" + "riLjLjqAg0G9mkgYwg8acB2hHU5cj21smBkE";

// GitHub Settings (Synced via Cloud)
export const INITIAL_GITHUB_CONFIG: GithubConfig = {
  "token": "ghp_" + "riLjLjqAg0G9mkgYwg8acB2hHU5cj21smBkE",
  "owner": "subhan7575",
  "repo": "rozanews",
  "branch": "main"
};

export const INITIAL_TICKER_CONFIG: TickerConfig = {
  "visible": false,
  "content": [
    "Global markets rally as tech sector reports record Q4 earnings.",
    "SpaceX announces new mission to Mars slated for 2028.",
    "Championship finals: City favorites take the lead in overtime."
  ]
};

export const INITIAL_ADS: AdConfig[] = [
  {
    "id": "1",
    "location": "header_top",
    "name": "Header Banner",
    "enabled": false,
    "type": "image",
    "code": "https://picsum.photos/1200/120?random=99",
    "googleAppId": "",
    "googleAdUnitId": ""
  },
  {
    "id": "2",
    "location": "article_sidebar",
    "name": "Sidebar Square",
    "enabled": false,
    "type": "image",
    "code": "https://picsum.photos/300/250?random=98",
    "googleAppId": "",
    "googleAdUnitId": ""
  },
  {
    "id": "3",
    "location": "home_middle",
    "name": "Home Middle Banner",
    "enabled": false,
    "type": "image",
    "code": "https://picsum.photos/800/200?random=97",
    "googleAppId": "",
    "googleAdUnitId": ""
  }
];

export const INITIAL_VIDEOS: VideoPost[] = [];

export const INITIAL_ARTICLES: Article[] = [];

export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_MESSAGES: Message[] = [];

export const MOCK_ADMIN_EMAIL = "jobsofficial786@gmail.com";

export const INITIAL_PROJECT_FILES: VirtualFile[] = [
  {
    "name": "Home.tsx",
    "path": "/pages/Home.tsx",
    "language": "typescript",
    "content": "// Source code placeholder"
  }
];