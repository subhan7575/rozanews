
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/firebase';
import { StorageService } from '../services/storageService';
import { Lock, Mail, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Authenticate with Firebase
      const user = await AuthService.loginWithEmail(email, password);
      
      if (user) {
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
       setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-deep flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-lighter p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 transition-all">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-rose-700 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 rotate-3 transform">
            <Lock size={36} />
          </div>
          <h1 className="text-3xl font-black font-display text-slate-950 dark:text-white uppercase tracking-tighter text-center">
             Admin Login
          </h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Roza News Portal</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
               <Mail className="absolute left-4 top-4 text-gray-400" size={18}/>
               <input 
                 type="email" 
                 className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-deep border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-slate-950 dark:text-white transition-all text-sm font-bold"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Admin Email"
                 required
               />
            </div>
            <div className="relative">
               <Lock className="absolute left-4 top-4 text-gray-400" size={18}/>
               <input 
                 type="password" 
                 className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-deep border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-slate-950 dark:text-white transition-all text-sm font-bold"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Password"
                 required
               />
            </div>
          </div>

          {error && (
             <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-2xl text-xs font-black flex items-center gap-3 border border-red-100 dark:border-red-900/40">
                <ShieldAlert size={18} /> {error}
             </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary/30 transform active:scale-95 flex items-center justify-center disabled:opacity-70 text-lg"
          >
            {isLoading ? (
               <Loader2 size={24} className="animate-spin" />
            ) : (
               <>Enter Dashboard <ArrowRight size={20} className="ml-3"/></>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
           <a href="/" className="text-xs font-black text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">← Back to Website</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
