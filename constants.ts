import { Article, AdConfig, VirtualFile, VideoPost } from './types';

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const DEFAULT_API_KEY = "AIzaSyAESByRBukp36X65kLNRdobGVUWPWDFMsM";

export const INITIAL_ADS: AdConfig[] = [
  {
    "id": "1",
    "location": "header_top",
    "name": "Header Banner",
    "enabled": true,
    "type": "image",
    "code": "https://picsum.photos/1200/120?random=99",
    "googleAppId": "",
    "googleAdUnitId": ""
  },
  {
    "id": "2",
    "location": "article_sidebar",
    "name": "Sidebar Square",
    "enabled": true,
    "type": "image",
    "code": "https://picsum.photos/300/250?random=98",
    "googleAppId": "",
    "googleAdUnitId": ""
  },
  {
    "id": "3",
    "location": "home_middle",
    "name": "Home Middle Banner",
    "enabled": true,
    "type": "image",
    "code": "https://picsum.photos/800/200?random=97",
    "googleAppId": "",
    "googleAdUnitId": ""
  }
];

export const INITIAL_VIDEOS: VideoPost[] = [
  {
    "id": "1",
    "title": "Technology Summit Highlights",
    "description": "A quick look at the major announcements from today's tech world.",
    "url": "https://www.w3schools.com/html/mov_bbb.mp4",
    "thumbnailUrl": "https://picsum.photos/400/700?random=20",
    "views": 1205,
    "publishedAt": "2025-12-11T10:45:37.208Z",
    "tags": [
      "Tech",
      "News"
    ]
  },
  {
    "id": "2",
    "title": "Rainfall in the Amazon",
    "description": "Relaxing footage from the rainforest.",
    "url": "https://www.w3schools.com/html/movie.mp4",
    "thumbnailUrl": "https://picsum.photos/400/700?random=21",
    "views": 850,
    "publishedAt": "2025-12-11T10:45:37.208Z",
    "tags": [
      "Nature",
      "Relax"
    ]
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    "id": "1",
    "title": "Global Markets Rally as Tech Sector Booms",
    "slug": "global-markets-rally-tech-boom",
    "summary": "Major indices hit record highs driven by AI advancements and semiconductor demand.",
    "content": "The global stock markets saw an unprecedented surge today...",
    "category": "Business",
    "author": "Subhan Ahmad",
    "publishedAt": "2025-12-11T07:58:57.208Z",
    "imageUrl": "https://picsum.photos/800/600?random=1",
    "gallery": [
      "https://picsum.photos/800/600?random=101",
      "https://picsum.photos/800/600?random=102"
    ],
    "videoUrls": [],
    "views": 12450,
    "tags": [
      "Economy",
      "Tech",
      "Stock Market"
    ],
    "isBreaking": false,
    "isFeatured": true
  },
  {
    "id": "2",
    "title": "Championship Finals: Underdog Team Takes the Trophy",
    "slug": "championship-finals-underdog-win",
    "summary": "In a stunning upset, the city favorites were defeated in overtime.",
    "content": "Sports fans around the world were shocked as...",
    "category": "Sports",
    "author": "Subhan Ahmad",
    "publishedAt": "2025-12-11T09:22:17.208Z",
    "imageUrl": "https://picsum.photos/800/600?random=2",
    "gallery": [],
    "videoUrls": [],
    "views": 8300,
    "tags": [
      "Football",
      "Finals"
    ],
    "isBreaking": true,
    "isFeatured": false
  },
  {
    "id": "3",
    "title": "New Climate Policy Signed by World Leaders",
    "slug": "new-climate-policy-signed",
    "summary": "A historic agreement aims to reduce carbon emissions by 50% within the next decade.",
    "content": "Leaders from 190 countries gathered today to sign...",
    "category": "World",
    "author": "Subhan Ahmad",
    "publishedAt": "2025-12-11T10:12:17.208Z",
    "imageUrl": "https://picsum.photos/800/600?random=3",
    "gallery": [],
    "videoUrls": [],
    "views": 45000,
    "tags": [
      "Climate",
      "Policy",
      "UN"
    ],
    "isBreaking": false,
    "isFeatured": true
  }
];

export const MOCK_ADMIN_EMAIL = "jobsofficial786@gmail.com";

export const INITIAL_PROJECT_FILES: VirtualFile[] = [
  {
    name: 'Home.tsx',
    path: '/pages/Home.tsx',
    language: 'typescript',
    content: `// Source code placeholder`
  }
];