import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { UserProfile } from '../types';
import { 
  LogOut, User, Phone, Mail, Calendar, 
  ShieldCheck, Bell, ChevronRight, Settings, 
  Cloud, Bookmark 
} from 'lucide-react';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) {
      navigate('/');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      StorageService.logoutUser();
      navigate('/');
      window.location.reload();
    }
  };

  const toggleNotifications = () => {
    if (user) {
      const newState = !user.notificationsEnabled;
      const updatedUser = { ...user, notificationsEnabled: newState };
      StorageService.externalLogin(updatedUser); // This saves and triggers Sync
      setUser(updatedUser);
    }
  };

  if (!user) return null;

  const isPhoneUser = !!user.phoneNumber;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20 pt-10 px-4 animate-fade-in">
      
      {/* 1. Header Card */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-dark-lighter rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-primary to-rose-900 relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
           {/* Avatar */}
           <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6 gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-lighter shadow-2xl overflow-hidden bg-gray-200">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left mb-2">
                 <h1 className="text-3xl font-black font-display text-gray-900 dark:text-white">
                    {isPhoneUser ? (user.name === 'Mobile User' ? 'Roza Member' : user.name) : user.name}
                 </h1>
                 <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                       {user.role}
                    </span>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center">
                       <Cloud size={12} className="mr-1" /> Synced
                    </span>
                 </div>
              </div>
           </div>

           {/* Info Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {/* Contact Info */}
              <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                 <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">Contact Details</h3>
                 
                 {isPhoneUser ? (
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                          <Phone size={20} />
                       </div>
                       <div>
                          <p className="text-xs text-gray-500">Phone Number</p>
                          <p className="font-bold font-mono text-gray-900 dark:text-white text-lg">{user.phoneNumber}</p>
                       </div>
                    </div>
                 ) : (
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                          <Mail size={20} />
                       </div>
                       <div>
                          <p className="text-xs text-gray-500">Email Address</p>
                          <p className="font-bold text-gray-900 dark:text-white text-lg truncate max-w-[200px] md:max-w-full">{user.email}</p>
                       </div>
                    </div>
                 )}
              </div>

              {/* Account Info */}
              <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                 <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">Account Status</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                       <Calendar size={20} />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500">Member Since</p>
                       <p className="font-bold text-gray-900 dark:text-white">{new Date(user.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Settings & Actions */}
      <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
         
         {/* Main Settings Column */}
         <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-dark-lighter rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Settings className="mr-2 text-primary" /> Preferences
               </h3>

               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={toggleNotifications}>
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${user.notificationsEnabled ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                           <Bell size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-gray-900 dark:text-white">Push Notifications</p>
                           <p className="text-xs text-gray-500">Get alerts for breaking news</p>
                        </div>
                     </div>
                     <div className={`w-12 h-6 rounded-full p-1 transition-colors ${user.notificationsEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${user.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                           <ShieldCheck size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-gray-900 dark:text-white">Privacy & Security</p>
                           <p className="text-xs text-gray-500">Manage data sharing</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-gray-400" />
                  </div>
               </div>
            </div>

            {/* Saved Items (Mock) */}
            <div className="bg-white dark:bg-dark-lighter rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Bookmark className="mr-2 text-blue-500" /> Saved Stories
               </h3>
               <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                     <Bookmark size={32} />
                  </div>
                  <p className="text-gray-500">You haven't saved any stories yet.</p>
                  <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold text-sm hover:underline">Browse Headlines</button>
               </div>
            </div>
         </div>

         {/* Sidebar Actions */}
         <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 text-white text-center shadow-xl">
               <h3 className="font-bold text-xl mb-2">Roza Premium</h3>
               <p className="text-gray-400 text-sm mb-6">Experience ad-free news and exclusive reports.</p>
               <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">Upgrade Plan</button>
            </div>

            <button 
               onClick={handleLogout}
               className="w-full bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center transition-all border border-red-100 dark:border-red-900/30"
            >
               <LogOut size={20} className="mr-2" /> Sign Out
            </button>
         </div>

      </div>
    </div>
  );
};

export default Profile;