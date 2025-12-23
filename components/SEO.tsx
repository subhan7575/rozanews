
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { StorageService } from '../services/storageService';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'video';
  publishedAt?: string;
  author?: string;
  category?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = [], 
  image, 
  type = 'website',
  publishedAt,
  author = 'Subhan Ahmad',
  category
}) => {
  const location = useLocation();
  const globalConfig = StorageService.getSEOConfig();
  
  const siteName = globalConfig.siteName;
  const baseUrl = "https://rozanews.online";
  const canonicalUrl = `${baseUrl}${location.pathname === '/' ? '' : '/#' + location.pathname}`;

  useEffect(() => {
    const combinedKeywords = [...new Set([...globalConfig.globalKeywords, ...keywords])];
    const fullTitle = location.pathname === '/' 
      ? globalConfig.defaultTitle 
      : `${title} - ${siteName}`;
    
    document.title = fullTitle;

    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description || globalConfig.description);
    updateMeta('keywords', combinedKeywords.join(', '));
    updateMeta('author', author);

    // AdSense Global Injection
    if (globalConfig.adsenseCode) {
      const scriptId = 'roza-adsense-script';
      if (!document.getElementById(scriptId)) {
        const temp = document.createElement('div');
        temp.innerHTML = globalConfig.adsenseCode;
        const scriptTag = temp.querySelector('script');
        if (scriptTag) {
          const newScript = document.createElement('script');
          Array.from(scriptTag.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.id = scriptId;
          document.head.appendChild(newScript);
        }
      }
    }

    // Open Graph
    updateMeta('og:title', fullTitle, 'property');
    updateMeta('og:description', description || globalConfig.description, 'property');
    updateMeta('og:image', image || globalConfig.ogImage, 'property');
    updateMeta('og:url', canonicalUrl, 'property');
    updateMeta('og:type', type === 'article' ? 'article' : 'website', 'property');

  }, [title, description, keywords, image, type, publishedAt, author, category, canonicalUrl, globalConfig, location.pathname]);

  return null;
};

export default SEO;
