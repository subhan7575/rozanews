import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'video';
  publishedAt?: string;
  author?: string;
  category?: string;
  videoUrl?: string; // For video object
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = [], 
  image = 'https://picsum.photos/1200/630', // Default share image
  type = 'website',
  publishedAt,
  author = 'Subhan Ahmad',
  category,
  videoUrl
}) => {
  const location = useLocation();
  const siteName = "Roza News";
  // Canonical URL construction (using hash strategy for SPA consistency)
  const canonicalUrl = `https://rozanews.com${location.pathname === '/' ? '' : '/#' + location.pathname}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = `${title} | ${siteName}`;

    // 2. Helper to update Meta Tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update Link Tags (Canonical)
    const updateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // --- Standard SEO ---
    updateMeta('description', description);
    updateMeta('keywords', [...keywords, 'Roza News', 'News', 'World Updates', 'Subhan Ahmad', 'Breaking News'].join(', '));
    updateMeta('author', author);
    updateLink('canonical', canonicalUrl);

    // --- Google News Specific ---
    if (type === 'article') {
       updateMeta('news_keywords', [...keywords, category].join(', '));
    }
    
    // --- Open Graph (Facebook/WhatsApp) ---
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('og:url', canonicalUrl, 'property');
    updateMeta('og:type', type === 'video' ? 'video.other' : type, 'property');
    updateMeta('og:site_name', siteName, 'property');

    // --- Twitter Card ---
    updateMeta('twitter:card', type === 'video' ? 'player' : 'summary_large_image', 'name');
    updateMeta('twitter:title', title, 'name');
    updateMeta('twitter:description', description, 'name');
    updateMeta('twitter:image', image, 'name');
    if (type === 'video' && videoUrl) {
      updateMeta('twitter:player', videoUrl, 'name');
    }

    // 3. JSON-LD Structured Data (Advanced Schema for Google)
    let schemaData: any = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": "https://rozanews.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://rozanews.com/#/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    if (type === 'article') {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": title,
        "description": description,
        "image": [image],
        "datePublished": publishedAt,
        "dateModified": publishedAt, // Ideally this tracks edits
        "author": [{
            "@type": "Person",
            "name": author,
            "url": "https://rozanews.com/#/about"
        }],
        "publisher": {
          "@type": "Organization",
          "name": siteName,
          "logo": {
            "@type": "ImageObject",
            "url": "https://rozanews.com/logo.png", // Replace with actual logo URL
            "width": 600,
            "height": 60
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        "articleSection": category || "General News"
      };
    } 
    
    if (type === 'video') {
       schemaData = {
         "@context": "https://schema.org",
         "@type": "VideoObject",
         "name": title,
         "description": description,
         "thumbnailUrl": image,
         "uploadDate": publishedAt || new Date().toISOString(),
         "contentUrl": videoUrl,
         "embedUrl": videoUrl,
         "publisher": {
           "@type": "Organization",
           "name": siteName,
           "logo": { "@type": "ImageObject", "url": "https://rozanews.com/logo.png" }
         }
       };
    }

    // Inject Schema
    let script = document.querySelector('#schema-json-ld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'schema-json-ld';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData);

  }, [title, description, keywords, image, type, publishedAt, author, category, canonicalUrl, videoUrl]);

  return null;
};

export default SEO;