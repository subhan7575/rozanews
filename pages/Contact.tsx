import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle, WifiOff, LogIn, User } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { UserProfile, Message } from '../types';
import AuthModal from '../components/AuthModal';

const Contact: React.FC = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(StorageService.getCurrentUser());
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        setIsAuthOpen(true);
        return;
    }

    setStatus('sending');
    setErrorMessage('');

    // 1. Save locally and trigger GitHub Sync
    const newMessage: Message = {
      id: 'msg_' + Date.now(),
      name: currentUser.name,
      email: currentUser.email,
      content: message,
      timestamp: new Date().toISOString(),
      read: false
    };
    StorageService.saveMessage(newMessage);

    // 2. REAL SECURE SENDING via FormSubmit API to jobsofficial786@gmail.com
    try {
      const response = await fetch("https://formsubmit.co/ajax/jobsofficial786@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: currentUser.name, // Auto-detected
          email: currentUser.email, // Auto-detected (Sets Reply-To)
          message: message,
          _subject: `New Message from ${currentUser.name} (Roza News)`,
          _template: "table",
          _captcha: "false"
        })
      });

      if (response.ok) {
        setStatus('success');
        setMessage('');
      } else {
        throw new Error("Service returned an error.");
      }
    } catch (error) {
      console.error("Email send failed:", error);
      setStatus('error');
      setErrorMessage("Could not connect to the server. Please check your internet connection.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary mb-4">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Roza News</h2>
          <p className="text-gray-500 mt-2">Direct line to our editorial and support team.</p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-8 rounded-xl text-center animate-fade-in">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-2xl mb-2">Message Sent!</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              We have received your message and will get back to you at <strong>{currentUser?.email}</strong> shortly.
            </p>
            <button 
              onClick={() => setStatus('idle')} 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            {!currentUser ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                 <User size={48} className="mx-auto text-gray-400 mb-4" />
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h3>
                 <p className="text-gray-500 mb-6 px-4">To prevent spam and ensure quality support, please sign in to send us a message.</p>
                 <button 
                   onClick={() => setIsAuthOpen(true)}
                   className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg flex items-center justify-center mx-auto"
                 >
                    <LogIn size={20} className="mr-2"/> Sign In to Contact
                 </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg flex items-center">
                    <WifiOff size={20} className="mr-2" />
                    {errorMessage}
                  </div>
                )}

                {/* Logged in indicator */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                   <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-blue-200" />
                   <div>
                      <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase">Sending as</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{currentUser.name} <span className="font-normal opacity-70">({currentUser.email})</span></p>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Your Message</label>
                  <textarea 
                    required
                    rows={6}
                    placeholder="Type your message here..."
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white resize-none text-base"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'sending' || !message.trim()}
                  className="w-full bg-primary hover:bg-red-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg flex justify-center items-center text-lg"
                >
                  {status === 'sending' ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                      Sending Securely...
                    </span>
                  ) : (
                      <>
                        <Send size={20} className="mr-2" /> Send Message
                      </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;