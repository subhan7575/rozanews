import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Smartphone, AlertTriangle, Bell, CheckCircle } from 'lucide-react';
import { AuthService } from '../services/firebase';
import { StorageService } from '../services/storageService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<'method' | 'phone_input' | 'otp_verify' | 'permission'>('method');
  
  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setStep('method');
      setError('');
      setIsLoading(false);
      setLoggedInUser(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = (user: UserProfile) => {
     setLoggedInUser(user);
     // If browser supports notifications and not yet granted/denied, ask.
     if ('Notification' in window && Notification.permission === 'default') {
        setStep('permission');
     } else {
        // Skip permission step if already handled or not supported
        onLoginSuccess(user);
        onClose();
     }
  };

  const handleAllowNotifications = async () => {
     try {
       const permission = await Notification.requestPermission();
       if (permission === 'granted') {
          StorageService.updateUserNotifications(true);
          new Notification("Notifications Enabled", {
             body: "You will now receive updates for new stories!",
             icon: "/logo.png"
          });
       } else {
          StorageService.updateUserNotifications(false);
       }
     } catch (e) {
       console.error(e);
     } finally {
       if (loggedInUser) onLoginSuccess(loggedInUser);
       onClose();
     }
  };

  const handleSkipNotifications = () => {
     StorageService.updateUserNotifications(false);
     if (loggedInUser) onLoginSuccess(loggedInUser);
     onClose();
  };

  // --- GOOGLE LOGIN (REAL) ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await AuthService.signInWithGoogle();
      if (user) {
        StorageService.externalLogin(user);
        handleSuccess(user);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/api-key-not-valid') {
        setError("Config Error: Invalid API Key in firebase.ts");
      } else if (err.code === 'auth/internal-error') {
        setError("System Error: Please check Firebase Console. Ensure you are using 'Web App' config, not Android.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Login cancelled.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Domain not authorized. Add this domain in Firebase Console > Auth > Settings.");
      } else {
        setError(err.message || "Google Sign In Failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- PHONE LOGIN (REAL) ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const verifier = AuthService.setupRecaptcha('recaptcha-container');
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await AuthService.signInWithPhone(formattedNumber, verifier);
      setConfirmationResult(confirmation);
      setStep('otp_verify');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-phone-number') {
        setError("Invalid Phone Number. Format: +1234567890");
      } else if (err.code === 'auth/api-key-not-valid') {
        setError("Configuration Error: Please update services/firebase.ts");
      } else {
        setError(err.message || "Failed to send SMS.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!confirmationResult) return;

    try {
      const result = await confirmationResult.confirm(otp);
      const user = AuthService.mapFirebaseUserToProfile(result.user);
      
      StorageService.externalLogin(user);
      handleSuccess(user);
    } catch (err: any) {
      setError("Invalid Code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-white/20">
        
        {/* Header (Hidden on Permission Step for Clean Look) */}
        {step !== 'permission' && (
          <div className="h-32 bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="text-white text-center z-10">
                <h2 className="text-2xl font-black font-display tracking-tight">ROZA ACCESS</h2>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Real-time Secure Login</p>
             </div>
             <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                <X size={18} />
             </button>
          </div>
        )}

        <div className="p-8">
            {/* --- NOTIFICATION PERMISSION STEP --- */}
            {step === 'permission' && (
               <div className="text-center py-6 animate-fade-in">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                     <Bell size={40} className="animate-pulse-slow" />
                     <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                  </div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">Stay Updated?</h2>
                  <p className="text-gray-500 mb-8 px-4 leading-relaxed">
                     Enable notifications to receive instant alerts when we publish new stories, videos, or breaking news.
                  </p>
                  
                  <div className="space-y-3">
                     <button 
                        onClick={handleAllowNotifications}
                        className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center"
                     >
                        <CheckCircle size={20} className="mr-2"/> Allow Notifications
                     </button>
                     <button 
                        onClick={handleSkipNotifications}
                        className="w-full bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold py-3 rounded-xl transition-colors"
                     >
                        Not Now
                     </button>
                  </div>
               </div>
            )}

            {step === 'method' && (
                <div className="space-y-4">
                    {/* Google Button */}
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group shadow-sm"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                        <span className="font-bold text-gray-700 dark:text-white">Continue with Google</span>
                        {isLoading && <span className="animate-spin ml-auto border-2 border-gray-400 border-t-transparent rounded-full h-4 w-4"></span>}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">Or use phone</span>
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    </div>

                    {/* Phone Button */}
                    <button 
                        onClick={() => setStep('phone_input')}
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold p-4 rounded-xl hover:opacity-90 transition-colors flex justify-center items-center"
                    >
                        <Smartphone size={20} className="mr-2" /> Sign In with Number
                    </button>
                </div>
            )}

            {/* Phone Input Step */}
            {step === 'phone_input' && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="text-center">
                        <h3 className="text-xl font-bold dark:text-white">Enter Phone Number</h3>
                        <p className="text-sm text-gray-500">We will send you a text with a verification code.</p>
                    </div>
                    
                    <div>
                        <input 
                            type="tel" 
                            required
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            className="w-full p-4 text-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white placeholder-gray-400"
                            placeholder="+92 300 1234567"
                        />
                        <p className="text-xs text-gray-400 mt-2">Format: +[CountryCode][Number] (e.g. +92...)</p>
                    </div>

                    {/* Required for Firebase Phone Auth */}
                    <div id="recaptcha-container"></div>

                    <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold p-4 rounded-xl hover:bg-rose-700 transition-colors flex justify-center items-center disabled:opacity-70">
                        {isLoading ? 'Sending SMS...' : <><ArrowRight size={20} className="mr-2"/> Send Code</>}
                    </button>
                    
                    <button type="button" onClick={() => setStep('method')} className="w-full text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">Back</button>
                </form>
            )}

            {/* OTP Verify Step */}
            {step === 'otp_verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Smartphone size={32} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Verify Code</h3>
                        <p className="text-sm text-gray-500">Enter the 6-digit code sent to your phone.</p>
                    </div>
                    
                    <div>
                        <input 
                            type="text" 
                            required
                            maxLength={6}
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            className="w-full text-center text-3xl font-mono tracking-[0.5em] p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            placeholder="000000"
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold p-4 rounded-xl hover:bg-rose-700 transition-colors flex justify-center items-center disabled:opacity-70">
                        {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                    </button>
                    
                    <button type="button" onClick={() => setStep('phone_input')} className="w-full text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">Change Number</button>
                </form>
            )}

            {error && (
               <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" size={18} />
                  <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;