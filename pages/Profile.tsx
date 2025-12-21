
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { UserProfile, Article, JobApplication, DirectMessage } from '../types';
import { 
  LogOut, User, Phone, Mail, Calendar, 
  ShieldCheck, Bell, ChevronRight, Settings, 
  Cloud, Bookmark, Edit, Camera, Trash2, Briefcase, CheckCircle, Clock, XCircle, MessageSquare, ShieldAlert
} from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import Image from '../components/Image';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [adminMessages, setAdminMessages] = useState<DirectMessage[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) {
      navigate('/');
    } else {
      setUser(currentUser);
      loadSavedArticles();
      loadApplications(currentUser.id);
      loadAdminMessages(currentUser.id);
    }

    const handleBookmarkUpdate = () => loadSavedArticles();
    window.addEventListener('bookmarks_updated', handleBookmarkUpdate);
    
    return () => window.removeEventListener('bookmarks_updated', handleBookmarkUpdate);
  }, [navigate]);

  const loadSavedArticles = () => {
     const ids = StorageService.getBookmarkedIds();
     const allArticles = StorageService.getArticles();
     const found = allArticles.filter(a => ids.includes(a.id));
     setSavedArticles(found);
  };

  const loadApplications = (userId: string) => {
     const apps = StorageService.getUserApplications(userId);
     setMyApplications(apps);
  };

  const loadAdminMessages = async (userId: string) => {
     setLoadingMessages(true);
     const msgs = await StorageService.getUserMessages(userId);
     setAdminMessages(msgs);
     setLoadingMessages(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      StorageService.logout();
      navigate('/');
      window.location.reload();
    }
  };

  const toggleNotifications = () => {
    if (user) {
      const newState = !user.notificationsEnabled;
      const updatedUser = { ...user, notificationsEnabled: newState };
      StorageService.updateUserProfile(updatedUser);
      setUser(updatedUser);
    }
  };

  const removeBookmark = (e: React.MouseEvent, id: string) => {
     e.stopPropagation();
     StorageService.toggleBookmark(id);
  };

  const handleProfileUpdate = (updatedUser: UserProfile) => {
     StorageService.updateUserProfile(updatedUser);
     setUser(updatedUser);
  };

  const getStatusBadge = (status: string) => {
     switch(status) {
        case 'hired': 
           return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={12}/> Selected</span>;
        case 'rejected': 
           return <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><XCircle size={12}/> Closed</span>;
        default: 
           return <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Clock size={12}/> Reviewing</span>;
     }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24 pt-4 md:pt-10 px-4 md:px-8 animate-fade-in transition-colors duration-500">
      
      <EditProfileModal 
         isOpen={isEditProfileOpen}
         onClose={() => setIsEditProfileOpen(false)}
         currentUser={user}
         onSave={handleProfileUpdate}
      />

      <div className="max-w-5xl mx-auto bg-white dark:bg-dark-lighter rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary via-rose-600 to-purple-800 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <div className="px-6 md:px-10 pb-10 relative">
           <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-24 mb-8 gap-6">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white dark:border-dark-lighter shadow-2xl overflow-hidden bg-gray-200">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              
              <div className="text-center md:text-left flex-1">
                 <h1 className="text-3xl md:text-5xl font-black font-display text-gray-900 dark:text-white truncate">
                    {user.name}
                 </h1>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-200 dark:border-blue-700">
                       {user.role}
                    </span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200 dark:border-emerald-700 flex items-center">
                       <Cloud size={14} className="mr-1.5" /> Identity Verified
                    </span>
                 </div>
              </div>

              <button 
                 onClick={() => setIsEditProfileOpen(true)}
                 className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-full font-bold text-gray-700 dark:text-white transition-all"
              >
                 <Edit size={18} /> Edit Profile
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="lg:col-span-2 space-y-8">
            {/* ADMIN MESSAGES / INBOX */}
            <div className="bg-white dark:bg-dark-lighter rounded-[2rem] p-8 shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center font-display">
                        <MessageSquare className="mr-3 text-rose-500" /> Admin Inbox
                    </h3>
                    <span className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Official Channel</span>
                </div>

                {loadingMessages ? (
                    <div className="py-10 flex flex-col items-center justify-center opacity-50">
                        <Clock className="animate-spin mb-2" size={24}/>
                        <p className="text-xs font-bold uppercase tracking-widest">Syncing Inbox...</p>
                    </div>
                ) : adminMessages.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-black/20 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <ShieldAlert className="mx-auto mb-4 text-gray-300" size={48} />
                        <p className="text-gray-500 font-bold">No administrative messages yet.</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">You will see official updates here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {adminMessages.map(msg => (
                            <div key={msg.id} className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-black text-xs">R</div>
                                        <div>
                                            <p className="font-black text-sm text-gray-900 dark:text-white">{msg.senderName}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{new Date(msg.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">New</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">
                                    {msg.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-dark-lighter rounded-[2rem] p-8 shadow-lg border border-gray-100 dark:border-gray-800">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center font-display">
                     <Briefcase className="mr-3 text-purple-500" /> My Job Applications
                  </h3>
                  <span className="bg-gray-100 dark:bg-gray-800 text-xs font-bold px-3 py-1 rounded-full text-gray-500">{myApplications.length} Active</span>
               </div>

               {myApplications.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-black/20">
                     <p className="text-gray-500 font-bold text-sm mb-4">No active applications.</p>
                     <button onClick={() => navigate('/careers')} className="px-6 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full font-bold text-xs hover:bg-purple-200 transition-all">
                        Browse Careers
                     </button>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {myApplications.map(app => (
                        <div key={app.id} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <h4 className="font-bold text-gray-900 dark:text-white text-lg">{app.jobTitle}</h4>
                                 <p className="text-xs text-gray-500">Submitted {new Date(app.submittedAt).toLocaleDateString()}</p>
                              </div>
                              {getStatusBadge(app.status)}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="bg-white dark:bg-dark-lighter rounded-[2rem] p-8 shadow-lg border border-gray-100 dark:border-gray-800">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center font-display">
                     <Bookmark className="mr-3 text-blue-500" /> Saved Stories
                  </h3>
                  <span className="bg-gray-100 dark:bg-gray-800 text-xs font-bold px-3 py-1 rounded-full text-gray-500">{savedArticles.length} Items</span>
               </div>
               
               {savedArticles.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-black/20">
                     <Bookmark size={40} className="mx-auto mb-4 text-gray-300" />
                     <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No saved stories</h4>
                     <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg transition-all">Start Reading</button>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {savedArticles.map(article => (
                        <div key={article.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group border border-gray-100 dark:border-gray-800" onClick={() => navigate(`/article/${article.slug}`)}>
                           <Image src={article.imageUrl} alt={article.title} className="w-20 h-20 rounded-lg object-cover shrink-0"/>
                           <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{article.category}</span>
                              <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">{article.title}</h4>
                              <p className="text-xs text-gray-500 truncate">{article.summary}</p>
                           </div>
                           <button onClick={(e) => removeBookmark(e, article.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white dark:bg-dark-lighter rounded-[2rem] p-8 shadow-lg border border-gray-100 dark:border-gray-800">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center font-display">
                  <Settings className="mr-3 text-primary" /> Preferences
               </h3>

               <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 cursor-pointer group" onClick={toggleNotifications}>
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${user.notificationsEnabled ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                           <Bell size={20} />
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Alerts</p>
                     </div>
                     <div className={`w-12 h-7 rounded-full p-1 ${user.notificationsEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${user.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                     </div>
                  </div>
               </div>
            </div>

            <button onClick={handleLogout} className="w-full bg-white dark:bg-dark-lighter hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 font-bold py-5 rounded-[2rem] flex items-center justify-center transition-all border border-gray-200 dark:border-gray-800">
               <LogOut size={22} className="mr-3" /> Sign Out
            </button>
         </div>

      </div>
    </div>
  );
};

export default Profile;
