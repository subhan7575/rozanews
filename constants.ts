import { Article, AdConfig, VirtualFile } from './types';

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const INITIAL_ADS: AdConfig[] = [
  {
    id: '1',
    location: 'header_top',
    name: 'Header Banner',
    enabled: true,
    type: 'image',
    code: 'https://picsum.photos/1200/120?random=99',
  },
  {
    id: '2',
    location: 'article_sidebar',
    name: 'Sidebar Square',
    enabled: true,
    type: 'image',
    code: 'https://picsum.photos/300/250?random=98',
  },
  {
    id: '3',
    location: 'home_middle',
    name: 'Home Middle Banner',
    enabled: true,
    type: 'image',
    code: 'https://picsum.photos/800/200?random=97',
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
    isBreaking: false,
    isFeatured: true,
  },
];

export const MOCK_ADMIN_EMAIL = "jobsofficial786@gmail.com";

export const INITIAL_PROJECT_FILES: VirtualFile[] = [
  {
    name: 'Home.tsx',
    path: '/pages/Home.tsx',
    language: 'typescript',
    content: `import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import AdUnit from '../components/AdUnit';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const navigate = useNavigate();
  // ... (Full content of Home.tsx would be here)
  return <div>Home Page Content</div>;
};
export default Home;`
  },
  {
    name: 'Layout.tsx',
    path: '/components/Layout.tsx',
    language: 'typescript',
    content: `import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <header>Roza News Header</header>
      <main>{children}</main>
    </div>
  );
};
export default Layout;`
  },
  {
    name: 'global.css',
    path: '/styles/global.css',
    language: 'css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #f9fafb;
}`
  },
  {
    name: 'App.tsx',
    path: '/App.tsx',
    language: 'typescript',
    content: `import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// ... imports

function App() {
  return (
    <Router>
       <Routes>
         <Route path="/" element={<Home />} />
       </Routes>
    </Router>
  );
}
export default App;`
  }
];