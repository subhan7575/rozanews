
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
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input');
  const [showPermissionStep, setShowPermissionStep] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      AuthService.clearRecaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = (user: UserProfile) => {
     setLoggedInUser(user);
     StorageService.externalLogin(user);
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
      if (user) handleSuccess(user);
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/email-already-in-use') setError("Email already registered.");
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError("Incorrect email or password.");
      else if (err.code === 'auth/user-not-found') setError("Account not found.");
      else setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await AuthService.signInWithGoogle();
      if (user) handleSuccess(user);
    } catch (err: any) {
      setError(err.message || "Google Sign In Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (phoneNumber.length < 8) {
       setError("Enter a valid phone number.");
       setIsLoading(false);
       return;
    }

    try {
      const verifier = AuthService.setupRecaptcha('recaptcha-container');
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await AuthService.signInWithPhone(formattedNumber, verifier);
      setConfirmationResult(confirmation);
      setPhoneStep('verify');
    } catch (err: any) {
      console.error("Phone Auth Error:", err);
      AuthService.clearRecaptcha();
      setError(err.message || "Failed to send SMS code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!confirmationResult) {
       setError("Session expired. Start over.");
       setPhoneStep('input');
       setIsLoading(false);
       return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const user = AuthService.mapFirebaseUserToProfile(result.user);
      handleSuccess(user);
    } catch (err: any) {
      setError("Incorrect code. Please check the SMS.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-white/20 flex flex-col max-h-[90vh]">
        {!showPermissionStep && (
          <div className="h-28 bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center relative shrink-0">
             <div className="text-white text-center z-10">
                <h2 className="text-2xl font-black font-display tracking-tight uppercase">Roza News</h2>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Secure Access</p>
             </div>
             <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                <X size={18} />
             </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto">
            {showPermissionStep ? (
               <div className="text-center py-6 animate-fade-in">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Bell size={40} className="animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">Welcome Back!</h2>
                  <p className="text-gray-500 mb-8 px-4">Enable notifications for breaking news?</p>
                  <div className="space-y-3">
                     <button onClick={handleAllowNotifications} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg">Allow Notifications</button>
                     <button onClick={handleSkipNotifications} className="w-full text-gray-400 font-bold py-3">Skip</button>
                  </div>
               </div>
            ) : (
                <>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
                      <button onClick={() => setAuthMethod('email')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${authMethod === 'email' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}><Mail size={16} /> Email</button>
                      <button onClick={() => setAuthMethod('phone')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${authMethod === 'phone' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}><Smartphone size={16} /> Phone</button>
                  </div>

                  {authMethod === 'email' && (
                     <div className="animate-fade-in space-y-4">
                        <div className="flex justify-center mb-2">
                           <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-bold text-primary hover:underline">{isSignUp ? "Already have an account? Login" : "New? Create Account"}</button>
                        </div>
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                           {isSignUp && (
                              <div className="relative">
                                 <User className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                                 <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-primary" required={isSignUp} />
                              </div>
                           )}
                           <div className="relative">
                              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-primary" required />
                           </div>
                           <div className="relative">
                              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-primary" required minLength={6} />
                           </div>
                           <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg flex justify-center">{isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : (isSignUp ? 'Sign Up' : 'Login')}</button>
                        </form>
                        <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div><span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold">OR</span><div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div></div>
                        <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-bold dark:text-white"><img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" /> Continue with Google</button>
                     </div>
                  )}

                  {authMethod === 'phone' && (
                     <div className="animate-fade-in space-y-6">
                        {phoneStep === 'input' ? (
                           <form onSubmit={handleSendOtp} className="space-y-4">
                              <div className="relative">
                                 <Smartphone className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                                 <input type="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-primary" placeholder="+92 300 1234567" />
                              </div>
                              <div id="recaptcha-container" className="flex justify-center min-h-[1px]"></div>
                              <button type="submit" disabled={isLoading} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl flex justify-center items-center">{isLoading ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span> : 'Send OTP Code'}</button>
                           </form>
                        ) : (
                           <form onSubmit={handleVerifyOtp} className="space-y-6">
                              <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} className="w-full text-center text-3xl font-mono tracking-[0.5em] p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white outline-none" placeholder="......" />
                              <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg flex justify-center items-center">{isLoading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> : 'Verify & Login'}</button>
                              <button type="button" onClick={() => setPhoneStep('input')} className="w-full text-xs text-gray-400">Back</button>
                           </form>
                        )}
                     </div>
                  )}

                  {error && (
                     <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-start gap-3 animate-fade-in"><AlertTriangle className="text-red-500 shrink-0" size={18} /><p className="text-red-600 dark:text-red-300 text-xs font-medium">{error}</p></div>
                  )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
