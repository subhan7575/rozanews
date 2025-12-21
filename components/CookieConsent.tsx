import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('roza_cookie_consent');
    if (!consent) {
      // Delay prompt slightly for better UX
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('roza_cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('roza_cookie_consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:bottom-8 md:max-w-sm bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[100] animate-slide-up">
      <div className="flex items-start justify-between mb-4">
         <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full text-blue-600 dark:text-blue-400">
            <Cookie size={24} />
         </div>
         <button onClick={handleDecline} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
         </button>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">We respect your privacy</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
         We use cookies to improve your experience and deliver personalized content. By continuing, you agree to our <a href="#/privacy" className="text-primary hover:underline">Privacy Policy</a>.
      </p>
      <div className="flex gap-3">
         <button 
            onClick={handleDecline}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-bold text-sm transition-colors"
         >
            Decline
         </button>
         <button 
            onClick={handleAccept}
            className="flex-1 px-4 py-2 bg-primary hover:bg-rose-700 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/20"
         >
            Accept
         </button>
      </div>
    </div>
  );
};

export default CookieConsent;