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

export interface AdConfig {
  id: string;
  location: 'header_top' | 'home_middle' | 'article_sidebar' | 'article_bottom' | 'footer_top';
  name: string;
  enabled: boolean;
  code: string; // HTML code or Image URL
  type: 'image' | 'script';
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{ day: string; temp: number }>;
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