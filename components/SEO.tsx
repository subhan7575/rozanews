
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
  videoUrl?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = [], 
  image, 
  type = 'website',
  publishedAt,
  author = 'Subhan Ahmad',
  category,
  videoUrl
}) => {
  const location = useLocation();
  const globalConfig = StorageService.getSEOConfig();
  
  const siteName = globalConfig.siteName;
  const baseUrl = "https://rozanews.online";
  const canonicalUrl = `${baseUrl}${location.pathname === '/' ? '' : '/#' + location.pathname}`;

  useEffect(() => {
    // 1. Meta Tags Update
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

    const updateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    updateMeta('description', description || globalConfig.description);
    updateMeta('keywords', combinedKeywords.join(', '));
    updateMeta('author', author);
    updateLink('canonical', canonicalUrl);
    
    if (globalConfig.googleVerification) {
       updateMeta('google-site-verification', globalConfig.googleVerification);
    }

    // Open Graph
    updateMeta('og:title', fullTitle, 'property');
    updateMeta('og:description', description || globalConfig.description, 'property');
    updateMeta('og:image', image || globalConfig.ogImage, 'property');
    updateMeta('og:url', canonicalUrl, 'property');
    updateMeta('og:type', type === 'video' ? 'video.other' : type, 'property');
    updateMeta('og:site_name', siteName, 'property');

    // 2. Google AdSense Injection with improved safety
    if (globalConfig.adsenseCode) {
      const scriptId = 'roza-adsense-global';
      let existingScript = document.getElementById(scriptId);
      const codeHash = btoa(globalConfig.adsenseCode.substring(0, 100)); // Sample hash
      
      if (!existingScript || existingScript.getAttribute('data-code-hash') !== codeHash) {
         if (existingScript) existingScript.remove();
         
         const tempDiv = document.createElement('div');
         tempDiv.innerHTML = globalConfig.adsenseCode.trim();
         const scriptTag = tempDiv.querySelector('script');
         
         if (scriptTag) {
            const newScript = document.createElement('script');
            Array.from(scriptTag.attributes).forEach(attr => {
               newScript.setAttribute(attr.name, attr.value);
            });
            newScript.id = scriptId;
            newScript.setAttribute('data-code-hash', codeHash);
            if (scriptTag.innerHTML) newScript.innerHTML = scriptTag.innerHTML;
            document.head.appendChild(newScript);
         }
      }
    }

    // 3. Schema JSON-LD
    let schemas: any[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteName,
        "url": baseUrl
      }
    ];

    if (type === 'article') {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": title,
        "image": [image || globalConfig.ogImage],
        "datePublished": publishedAt,
        "author": [{ "@type": "Person", "name": author }]
      });
    }

    let script = document.querySelector('#schema-json-ld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'schema-json-ld';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemas);

  }, [title, description, keywords, image, type, publishedAt, author, category, canonicalUrl, globalConfig, location.pathname]);

  return null;
};

export default SEO;
