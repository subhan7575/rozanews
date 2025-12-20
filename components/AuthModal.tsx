import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Smartphone, AlertTriangle, Bell, CheckCircle, Key, User, Lock, LogIn } from 'lucide-react';
import { AuthService } from '../services/firebase';
import { StorageService } from '../services/storageService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  // Main Tabs: 'email' or 'phone'
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  // Sub Mode for Email: 'login' or 'signup'
  const [isSignUp, setIsSignUp] = useState(false);

  // Phone Specific Steps: 'input' -> 'verify'
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input');
  
  // Notification Step (Post-Auth)
  const [showPermissionStep, setShowPermissionStep] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setAuthMethod('email');
      setIsSignUp(false);
      setPhoneStep('input');
      setShowPermissionStep(false);
      setError('');
      setIsLoading(false);
      setLoggedInUser(null);
      setPhoneNumber('');
      setOtp('');
      setName('');
      setEmail('');
      setPassword('');
      // Clean up recaptcha
      AuthService.clearRecaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = (user: UserProfile) => {
     setLoggedInUser(user);
     // Persist user data immediately to app storage
     StorageService.externalLogin(user);
     
     // If browser supports notifications and not yet granted/denied, ask.
     if ('Notification' in window && Notification.permission === 'default') {
        setShowPermissionStep(true);
     } else {
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

  // --- EMAIL LOGIN / REGISTER ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let user: UserProfile | null = null;
      
      if (isSignUp) {
        if (!name.trim()) throw new Error("Name is required");
        user = await AuthService.registerWithEmail(name, email, password);
      } else {
        user = await AuthService.loginWithEmail(email, password);
      }

      if (user) {
        handleSuccess(user);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/email-already-in-use') setError("Email is already registered. Try logging in.");
      else if (err.code === 'auth/wrong-password') setError("Incorrect password.");
      else if (err.code === 'auth/user-not-found') setError("No account found with this email.");
      else if (err.code === 'auth/weak-password') setError("Password should be at least 6 characters.");
      else setError(err.message || "Authentication Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // --- GOOGLE LOGIN (REAL) ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await AuthService.signInWithGoogle();
      if (user) {
        handleSuccess(user);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/api-key-not-valid') {
        setError("Config Error: Invalid API Key in firebase.ts");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Login cancelled.");
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

    // Basic Validation
    if (phoneNumber.length < 10) {
       setError("Please enter a valid phone number.");
       setIsLoading(false);
       return;
    }

    try {
      // 1. Initialize Recaptcha (Invisible)
      // Ensure the ID matches the DIV below
      const verifier = AuthService.setupRecaptcha('recaptcha-container');
      
      // 2. Format Number (Ensure + symbol)
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // 3. Send SMS
      const confirmation = await AuthService.signInWithPhone(formattedNumber, verifier);
      
      setConfirmationResult(confirmation);
      setPhoneStep('verify');
    } catch (err: any) {
      console.error("Phone Auth Error:", err);
      AuthService.clearRecaptcha(); // Clear on error to allow retry
      if (err.code === 'auth/invalid-phone-number') {
        setError("Invalid Phone Number. Use format: +923001234567");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please try again later.");
      } else if (err.message && err.message.includes('reCAPTCHA')) {
        setError("Captcha check failed. Please refresh and try again.");
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
    setError('');
    
    if (!confirmationResult) {
       setError("Session expired. Please start again.");
       setPhoneStep('input');
       setIsLoading(false);
       return;
    }

    try {
      // 1. Verify Code
      const result = await confirmationResult.confirm(otp);
      
      // 2. Map to Profile
      const user = AuthService.mapFirebaseUserToProfile(result.user);
      
      // 3. Success Flow
      handleSuccess(user);
    } catch (err: any) {
      console.error("OTP Error:", err);
      if (err.code === 'auth/invalid-verification-code') {
        setError("Incorrect code. Please check the SMS.");
      } else {
        setError("Verification failed. Please try again.");
      }
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
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-white/20 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        {!showPermissionStep && (
          <div className="h-28 bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center relative overflow-hidden shrink-0">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="text-white text-center z-10">
                <h2 className="text-2xl font-black font-display tracking-tight">ROZA ACCESS</h2>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">
                   Join the Community
                </p>
             </div>
             <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                <X size={18} />
             </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto">
            {/* --- PERMISSION STEP (SUCCESS) --- */}
            {showPermissionStep ? (
               <div className="text-center py-6 animate-fade-in">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                     <Bell size={40} className="animate-pulse-slow" />
                     <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                  </div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">Login Successful!</h2>
                  <p className="text-gray-500 mb-8 px-4 leading-relaxed">
                     Enable notifications to never miss breaking news?
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
                        Skip
                     </button>
                  </div>
               </div>
            ) : (
                <>
                  {/* MAIN METHOD TABS */}
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
                      <button 
                        onClick={() => { setAuthMethod('email'); setError(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${authMethod === 'email' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                         <Mail size={16} /> Email
                      </button>
                      <button 
                        onClick={() => { setAuthMethod('phone'); setError(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${authMethod === 'phone' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                         <Smartphone size={16} /> Phone
                      </button>
                  </div>

                  {/* --- EMAIL METHOD --- */}
                  {authMethod === 'email' && (
                     <div className="animate-fade-in space-y-4">
                        {/* Login/Signup Toggle */}
                        <div className="flex justify-center mb-2">
                           <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                              {isSignUp ? "Already have an account?" : "New to Roza News?"}
                           </span>
                           <button 
                              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                              className="text-sm font-bold text-primary hover:underline"
                           >
                              {isSignUp ? "Login Here" : "Create Account"}
                           </button>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                           {isSignUp && (
                              <div className="relative">
                                 <User className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                                 <input 
                                   type="text" 
                                   placeholder="Full Name" 
                                   value={name}
                                   onChange={(e) => setName(e.target.value)}
                                   className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                   required={isSignUp}
                                 />
                              </div>
                           )}
                           
                           <div className="relative">
                              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                              <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                required
                              />
                           </div>

                           <div className="relative">
                              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                              <input 
                                type="password" 
                                placeholder={isSignUp ? "Create Password (6+ chars)" : "Password"} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                required
                                minLength={6}
                              />
                           </div>

                           <button 
                              type="submit" 
                              disabled={isLoading}
                              className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center"
                           >
                              {isLoading ? (
                                 <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                              ) : (
                                 isSignUp ? 'Create Account' : 'Sign In with Email'
                              )}
                           </button>
                        </form>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">Or</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>

                        <button 
                           onClick={handleGoogleLogin}
                           type="button"
                           disabled={isLoading}
                           className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-bold text-gray-700 dark:text-gray-300"
                        >
                           <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                           Continue with Google
                        </button>
                     </div>
                  )}

                  {/* --- PHONE METHOD --- */}
                  {authMethod === 'phone' && (
                     <div className="animate-fade-in space-y-6">
                        {phoneStep === 'input' ? (
                           <form onSubmit={handleSendOtp} className="space-y-4">
                              <div className="text-center mb-4">
                                 <p className="text-sm text-gray-500">We will send a One Time Password (OTP) to your number.</p>
                              </div>
                              
                              <div className="relative">
                                 <Smartphone className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                                 <input 
                                    type="tel" 
                                    required
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white placeholder-gray-400 tracking-wide"
                                    placeholder="+92 300 1234567"
                                 />
                              </div>
                              <p className="text-xs text-gray-400 ml-1">Include Country Code (e.g., +92, +1)</p>

                              {/* RECAPTCHA CONTAINER */}
                              <div id="recaptcha-container" className="flex justify-center min-h-[20px]"></div>

                              <button type="submit" disabled={isLoading} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:opacity-90 transition-colors flex justify-center items-center disabled:opacity-70 shadow-lg">
                                 {isLoading ? (
                                    <span className="flex items-center"><span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>Sending...</span>
                                 ) : (
                                    <><ArrowRight size={20} className="mr-2"/> Send OTP Code</>
                                 )}
                              </button>
                           </form>
                        ) : (
                           <form onSubmit={handleVerifyOtp} className="space-y-6">
                              <div className="text-center">
                                 <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Key size={28} />
                                 </div>
                                 <h3 className="text-lg font-bold dark:text-white">Enter OTP Code</h3>
                                 <p className="text-xs text-gray-500">Sent to {phoneNumber}</p>
                              </div>
                              
                              <div>
                                 <input 
                                    type="text" 
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    className="w-full text-center text-3xl font-mono tracking-[0.5em] p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                    placeholder="......"
                                 />
                              </div>

                              <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition-colors flex justify-center items-center disabled:opacity-70 shadow-lg">
                                 {isLoading ? (
                                    <span className="flex items-center"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>Verifying...</span>
                                 ) : (
                                    'Verify & Login'
                                 )}
                              </button>
                              
                              <button type="button" onClick={() => setPhoneStep('input')} className="w-full text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">Change Phone Number</button>
                           </form>
                        )}
                     </div>
                  )}

                  {error && (
                     <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-start gap-3 animate-fade-in">
                        <AlertTriangle className="text-red-500 shrink-0" size={18} />
                        <p className="text-red-600 dark:text-red-300 text-xs font-medium">{error}</p>
                     </div>
                  )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;