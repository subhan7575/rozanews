export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Markdown supported
  category: string;
  author: string;
  publishedAt: string;
  
  // Media
  imageUrl: string; // Main Featured Image
  gallery?: string[]; // Array of image URLs/Base64
  videoUrls?: string[]; // Array of video URLs (YouTube/Vimeo or Base64)
  
  views: number;
  tags: string[];
  isBreaking: boolean;
  isFeatured: boolean;
}

export interface VideoPost {
  id: string;
  title: string;
  description: string;
  url: string; // Base64 (Uploaded) or External URL
  thumbnailUrl: string;
  views: number;
  publishedAt: string;
  tags: string[];
}

export interface AdConfig {
  id: string;
  location: 'header_top' | 'home_middle' | 'article_sidebar' | 'article_bottom' | 'footer_top';
  name: string;
  enabled: boolean;
  code: string; // HTML code or Image URL
  type: 'image' | 'script';
  
  // Google Ad Specifics
  googleAppId?: string;    // e.g. ca-app-pub-xxx~xxx
  googleAdUnitId?: string; // e.g. ca-app-pub-xxx/xxx
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

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface VirtualFile {
  name: string;
  path: string;
  language: 'typescript' | 'javascript' | 'css' | 'json';
  content: string;
}

export type Theme = 'light' | 'dark';

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  USER = 'USER'
}