import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/firebase';
import { StorageService } from '../services/storageService';
import { Lock, Mail, ArrowRight, ShieldAlert, Loader2, Key } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP State for Super Admin
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);

  const navigate = useNavigate();

  // The hidden super admin email
  const SUPER_ADMIN_EMAIL = "saifujafar895@gmail.com";
  // The OTP/PIN for this admin (In a real app, this would be sent via SMS)
  const SUPER_ADMIN_PIN = "78692"; 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Authenticate with Firebase
      const user = await AuthService.loginWithEmail(email, password);
      
      if (user) {
        // Special Security Check for Super Admin
        if (user.email === SUPER_ADMIN_EMAIL) {
           setPendingUser(user);
           setShowOtp(true); // TRIGGER OTP SCREEN
           setIsLoading(false);
           return; // STOP HERE
        }

        // Standard Admin Logic
        StorageService.externalLogin(user);
        if (StorageService.isAuthenticated()) {
           navigate('/admin');
        } else {
           setError('Access Denied: You do not have administrator privileges.');
           StorageService.logoutUser();
        }
      } else {
         setError('Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
       console.error(err);
       if (err.code === 'auth/invalid-email') setError("Invalid email address.");
       else if (err.code === 'auth/user-not-found') setError("No admin account found with this email.");
       else if (err.code === 'auth/wrong-password') setError("Incorrect password.");
       else setError(err.message || 'Login failed.');
    } finally {
       if (!showOtp) setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
     e.preventDefault();
     if (otp === SUPER_ADMIN_PIN) {
        // Success!
        StorageService.externalLogin(pendingUser);
        navigate('/admin');
     } else {
        setError("Invalid OTP Code. Access Denied.");
     }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-rose-700 text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            {showOtp ? <Key size={32} /> : <Lock size={32} />}
          </div>
          <h1 className="text-2xl font-black font-display dark:text-white uppercase tracking-tight">
             {showOtp ? "Security Verification" : "Admin Secure Login"}
          </h1>
          <p className="text-gray-500 text-sm">Restricted Access Area</p>
        </div>
        
        {!showOtp ? (
           // --- STEP 1: PASSWORD LOGIN ---
           <form onSubmit={handleLogin} className="space-y-6">
             <div className="space-y-4">
               <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                  <input 
                    type="email" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Admin Email"
                    required
                  />
               </div>
               <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                  <input 
                    type="password" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
               </div>
             </div>

             {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                   <ShieldAlert size={16} /> {error}
                </div>
             )}

             <button 
               type="submit" 
               disabled={isLoading}
               className="w-full bg-primary hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-primary/40 flex items-center justify-center disabled:opacity-70"
             >
               {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
               ) : (
                  <>Authenticate <ArrowRight size={18} className="ml-2"/></>
               )}
             </button>
           </form>
        ) : (
           // --- STEP 2: SECURE OTP ---
           <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
              <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4 border border-blue-100 dark:border-blue-800">
                 <p className="text-sm text-gray-600 dark:text-gray-300">
                    Enter the secure PIN sent to your device to verify identity for <strong>{email}</strong>.
                 </p>
              </div>

              <div className="relative">
                 <input 
                   type="password" 
                   className="w-full text-center text-3xl font-mono tracking-[0.5em] p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
                   value={otp}
                   onChange={(e) => setOtp(e.target.value)}
                   placeholder="•••••"
                   maxLength={6}
                   required
                   autoFocus
                 />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                   <ShieldAlert size={16} /> {error}
                </div>
              )}

              <button 
               type="submit" 
               className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center"
              >
                 Verify & Enter Dashboard
              </button>
              
              <button 
                 type="button" 
                 onClick={() => { setShowOtp(false); setOtp(''); setPendingUser(null); setError(''); }}
                 className="w-full text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 mt-2"
              >
                 Cancel Verification
              </button>
           </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
           <a href="/" className="text-xs font-bold text-gray-400 hover:text-primary transition-colors">← Return to Website</a>
        </div>
      </div>
    </div>
  );
};

export default Login;