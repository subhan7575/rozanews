
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string; 
  avatar?: string;
  joinedAt: string;
  role: 'user' | 'admin';
  notificationsEnabled?: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface GlobalSEOConfig {
  siteName: string;
  defaultTitle: string;
  description: string;
  globalKeywords: string[];
  googleVerification?: string;
  adsenseCode?: string; 
  ogImage: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  gallery?: string[];
  videoUrls?: string[];
  views: number;
  tags: string[];
  comments?: Comment[];
  isBreaking: boolean;
  isFeatured: boolean;
  linkedVideoId?: string;
  isPremium?: boolean;
}

export interface VideoPost {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  views: number;
  publishedAt: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  postedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantAvatar?: string;
  education: string;
  skills: string;
  details: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'hired';
}

export interface AdConfig {
  id: string;
  location: 'header_top' | 'home_middle' | 'article_sidebar' | 'article_bottom' | 'footer_top';
  name: string;
  enabled: boolean;
  code: string;
  type: 'image' | 'script' | 'admob';
  googleAppId?: string;
  googleAdUnitId?: string;
}

export interface TickerConfig {
  visible: boolean;
  content: string[]; 
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  weatherCode: number;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  hourly: Array<{ time: string; temp: number; iconCode: number; isDay: boolean }>;
  forecast: Array<{ day: string; min: number; max: number; iconCode: number }>;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface VirtualFile {
  name: string;
  path: string;
  language: 'typescript' | 'javascript' | 'css' | 'json';
  content: string;
}

export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  url: string;
  timestamp: number;
  type: 'article' | 'video';
}
