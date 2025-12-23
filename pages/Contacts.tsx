
import React, { useState, useEffect } from 'react';
// Add missing Loader2 to the lucide-react imports
import { Mail, Send, CheckCircle, WifiOff, LogIn, User, AlertCircle, Loader2 } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { UserProfile, Message } from '../types';
import AuthModal from '../components/AuthModal';
import { getFirebaseDb } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const Contacts: React.FC = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
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

    if (message.trim().length < 10) {
        setErrorMessage("Message is too short. Please provide more detail.");
        setStatus('error');
        return;
    }

    setStatus('sending');
    setErrorMessage('');

    const newMessage = {
      name: currentUser.name,
      email: currentUser.email,
      content: message,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "messages"), newMessage);
      StorageService.saveMessage({ id: 'temp_' + Date.now(), ...newMessage });

      // Optional fallback to FormSubmit
      fetch("https://formsubmit.co/ajax/rozanewsofficial@gmail.com", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMessage, _subject: "New Message - Roza News" })
      }).catch(() => console.debug("Email fallback quiet fail."));

      setStatus('success');
      setMessage('');
    } catch (error: any) {
      console.error("Message Save Error:", error);
      setStatus('error');
      setErrorMessage("Service busy. Please try again or email us directly.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-fade-in">
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <Mail size={160} className="text-primary" />
        </div>

        <div className="text-center mb-10 relative z-10">
          <div className="inline-block p-4 rounded-3xl bg-red-50 dark:bg-red-900/20 text-primary mb-4 shadow-inner">
            <Mail size={40} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight">Get in Touch</h2>
          <p className="text-gray-500 mt-2 font-medium">Have a tip or an inquiry? Our editorial team is listening.</p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-10 rounded-3xl text-center animate-slide-up">
            <CheckCircle size={64} className="mx-auto mb-6 text-green-600 dark:text-green-400" />
            <h3 className="font-black text-3xl mb-3">Dispatched!</h3>
            <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg">
              We've received your message. An editor will review it and contact you at <strong>{currentUser?.email}</strong>.
            </p>
            <button 
              onClick={() => setStatus('idle')} 
              className="bg-green-600 hover:bg-green-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-green-500/20 active:scale-95"
            >
              Send Another
            </button>
          </div>
        ) : (
          <div className="animate-fade-in relative z-10">
            {!currentUser ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-black/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                 <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User size={40} className="text-gray-400" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign In Required</h3>
                 <p className="text-gray-500 mb-8 px-6">You must be authenticated to send messages to the administrative team.</p>
                 <button 
                   onClick={() => setIsAuthOpen(true)}
                   className="bg-primary hover:bg-red-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center mx-auto active:scale-95"
                 >
                    <LogIn size={20} className="mr-2"/> Start Authentication
                 </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/30 animate-shake">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-sm font-bold">{errorMessage}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                   <img src={currentUser.avatar} alt="User" className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover" />
                   <div className="min-w-0">
                      <p className="text-[10px] text-blue-600 dark:text-blue-300 font-black uppercase tracking-widest">Verified Sender</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                   </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Message</label>
                  <textarea 
                    required
                    rows={6}
                    placeholder="Tell us what's on your mind..."
                    className="w-full p-5 border border-gray-200 dark:border-gray-700 rounded-3xl dark:bg-gray-900 focus:ring-4 focus:ring-primary/10 outline-none text-gray-900 dark:text-white resize-none text-lg transition-all"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'sending' || !message.trim()}
                  className="w-full bg-primary hover:bg-red-800 disabled:bg-gray-300 text-white font-black py-5 rounded-2xl transition-all transform hover:-translate-y-1 shadow-2xl shadow-primary/20 flex justify-center items-center text-xl active:scale-95"
                >
                  {status === 'sending' ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin h-6 w-6 mr-3" />
                      Dispatching...
                    </span>
                  ) : (
                      <>
                        <Send size={24} className="mr-3" /> Send to Roza News
                      </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center text-gray-400 text-sm font-medium">
         <p>Average response time: 24-48 hours.</p>
         <p className="mt-1">Official Address: rozanewsofficial@gmail.com</p>
      </div>
    </div>
  );
};

export default Contacts;
