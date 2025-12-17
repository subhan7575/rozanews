// User types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  joinedAt: string;
  role: 'user' | 'admin' | 'editor' | 'viewer';
  notificationsEnabled?: boolean;
  isPremium?: boolean;
  lastLogin?: string;
}

// Comment system
export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  replies?: Comment[];
  likes?: number;
}

// Articles
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
  isPremium?: boolean;
  linkedVideoId?: string;
  readTime?: number;
}

// Videos
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
  duration?: number;
}

// Jobs
export interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  description: string;
  postedAt: string;
  salary?: string;
  experience?: string;
}

// Job Applications
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
  status: 'pending' | 'reviewed' | 'rejected' | 'hired' | 'interview';
  resumeUrl?: string;
}

// Advertisements
export interface AdConfig {
  id: string;
  location: 'header_top' | 'home_middle' | 'article_sidebar' | 'article_bottom' | 'footer_top' | 'video_sidebar';
  name: string;
  enabled: boolean;
  code: string;
  type: 'image' | 'script' | 'admob' | 'custom';
  googleAppId?: string;
  googleAdUnitId?: string;
  width?: number;
  height?: number;
}

// Breaking news ticker
export interface TickerConfig {
  visible: boolean;
  content: string[];
  speed?: number;
  color?: string;
}

// Weather
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
  hourly: Array<{
    time: string;
    temp: number;
    iconCode: number;
    isDay: boolean;
    condition?: string;
  }>;
  forecast: Array<{
    day: string;
    min: number;
    max: number;
    iconCode: number;
    condition?: string;
  }>;
  lastUpdated?: string;
}

// Contact messages
export interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  timestamp: string;
  read: boolean;
  category?: 'general' | 'support' | 'advertising' | 'careers';
  phone?: string;
}

// File system (for code editor)
export interface VirtualFile {
  name: string;
  path: string;
  language: 'typescript' | 'javascript' | 'css' | 'json' | 'html' | 'markdown' | 'txt';
  content: string;
  size?: number;
  lastModified?: string;
}

// GitHub sync
export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  lastSync?: string;
}

// Cloudinary for media uploads
export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  apiSecret?: string;
}

// Push notifications
export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  url: string;
  timestamp: number;
  type: 'article' | 'video' | 'breaking' | 'weather' | 'system';
  image?: string;
  icon?: string;
}

// Analytics
export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'article_view' | 'video_view' | 'search' | 'click' | 'login' | 'signup';
  data: any;
  timestamp: string;
  userId?: string;
  userAgent?: string;
}

// Settings
export interface AppSettings {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  language: string;
  timezone: string;
  dateFormat: string;
  enableComments: boolean;
  enableRegistration: boolean;
  enableNotifications: boolean;
  maintenanceMode: boolean;
}

// Search results
export interface SearchResult {
  id: string;
  type: 'article' | 'video' | 'page' | 'category';
  title: string;
  description: string;
  url: string;
  image?: string;
  score: number;
}

// Newsletter
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  active: boolean;
  preferences?: string[];
}

// Any other missing types
export type AnyObject = Record<string, any>;
export type Optional<T> = T | undefined | null;
