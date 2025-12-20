
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { UserProfile, Article, JobApplication } from '../types';
import { 
  LogOut, User, Phone, Mail, Calendar, 
  ShieldCheck, Bell, ChevronRight, Settings, 
  Cloud, Bookmark, Edit, Camera, Zap, Trash2, ArrowRight, Briefcase, CheckCircle, Clock, XCircle
} from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import Image from '../components/Image';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) {
      navigate('/');
    } else {
      setUser(currentUser);
      loadSavedArticles();
      loadApplications(currentUser.id);
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
      StorageService.externalLogin(updatedUser);
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
           return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={12}/> You are Selected</span>;
        case 'rejected': 
           return <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><XCircle size={12}/> Not Selected</span>;
        default: 
           return <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Clock size={12}/> Waiting / Pending</span>;
     }
  };

  if (!user) return null;

  const isPhoneUser = !!user.phoneNumber;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24 pt-4 md:pt-10 px-4 md:px-8 animate-fade-in transition-colors duration-500">
      
      <EditProfileModal 
         isOpen={isEditProfileOpen}
         onClose={() => setIsEditProfileOpen(false)}
         currentUser={user}
         onSave={handleProfileUpdate}
      />

      <div className="max-w-5xl mx-auto bg-white dark:bg-dark-lighter rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative group">
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary via-rose-600 to-purple-800 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 animate-pulse-slow"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
           <button 
             onClick={() => setIsEditProfileOpen(true)}
             className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"
           >
              <Camera size={20} />
           </button>
        </div>
        
        <div className="px-6 md:px-10 pb-10 relative">
           <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-24 mb-8 gap-6">
              <div className="relative">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white dark:border-dark-lighter shadow-2xl overflow-hidden bg-gray-200 relative z-10 group-hover:scale-105 transition-transform duration-500">
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-2 right-2 z-20 bg-green-500 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white dark:border-dark-lighter" title="Online"></div>
              </div>
              
              <div className="text-center md:text-left mb-2 flex-1 min-w-0">
                 <h1 className="text-3xl md:text-5xl font-black font-display text-gray-900 dark:text-white truncate drop-shadow-sm flex items-center justify-center md:justify-start gap-3">
                    {isPhoneUser ? (user.name === 'Mobile User' ? 'Roza Member' : user.name) : user.name}
                 </h1>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-200 dark:border-blue-700">
                       {user.role}
                    </span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200 dark:border-emerald-700 flex items-center">
                       <Cloud size={14} className="mr-1.5" /> Synced
                    </span>
                 </div>
              </div>

              <button 
                 onClick={() => setIsEditProfileOpen(true)}
                 className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-full font-bold text-gray-700 dark:text-white transition-all"
              >
                 <Edit size={18} /> Edit Profile
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group bg-gray-50 dark:bg-black/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-colors">
                 <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest flex items-center">
                    <User size={14} className="mr-2" /> Contact Information
                 </h3>
                 
                 {isPhoneUser ? (
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shadow-inner">
                          <Phone size={24} />
                       </div>
                       <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Phone Number</p>
                          <p className="font-mono text-gray-900 dark:text-white text-lg tracking-wide">{user.phoneNumber}</p>
                       </div>
                    </div>
                 ) : (
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                          <Mail size={24} />
                       </div>
                       <div className="min-w-0">
                          <p className="text-xs text-gray-500 font-bold uppercase">Email Address</p>
                          <p className="font-bold text-gray-900 dark:text-white text-lg truncate">{user.email}</p>
                       </div>
                    </div>
                 )}
              </div>

              <div className="group bg-gray-50 dark:bg-black/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-purple-500/30 transition-colors">
                 <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest flex items-center">
                    <ShieldCheck size={14} className="mr-2" /> Account Details
                 </h3>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                       <Calendar size={24} />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 font-bold uppercase">Member Since</p>
                       <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {new Date(user.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-dark-lighter rounded-[2rem] p-8 shadow-lg border border-gray-100 dark:border-gray-800">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center font-display">
                     <Briefcase className="mr-3 text-purple-500" /> My Job Applications
                  </h3>
                  <span className="bg-gray-100 dark:bg-gray-800 text-xs font-bold px-3 py-1 rounded-full text-gray-500">{myApplications.length} Active</span>
               </div>

               {myApplications.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-black/20">
                     <p className="text-gray-500 font-bold text-sm mb-4">You haven't applied for any jobs yet.</p>
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
                                 <p className="text-xs text-gray-500">Applied on {new Date(app.submittedAt).toLocaleDateString()}</p>
                              </div>
                              {getStatusBadge(app.status)}
                           </div>
                           
                           {app.status === 'hired' && (
                              <div className="mt-4 bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
                                 <p className="text-lg text-green-800 dark:text-green-200 font-bold mb-4">
                                    Congratulations! You have been selected.
                                 </p>
                                 <p className="text-sm text-green-700 dark:text-green-300 mb-6">
                                    Please send an email to our HR team to proceed with the onboarding process.
                                 </p>
                                 <a 
                                    href={`mailto:rozanewscareers@gmail.com?subject=Job Acceptance: ${encodeURIComponent(app.jobTitle)} - ${user.name}&body=Hi Roza News Team,%0D%0A%0D%0AI am excited to accept the offer for the ${app.jobTitle} position.%0D%0A%0D%0AName: ${user.name}%0D%0APhone: ${user.phoneNumber || 'N/A'}%0D%0A%0D%0ALooking forward to joining the team.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"
                                 >
                                    <Mail size={18} className="mr-2"/> Contact Roza News Careers
                                 </a>
                              </div>
                           )}
                           
                           {app.status === 'pending' && (
                              <p className="text-xs text-gray-500 italic mt-2">Your application is currently under review by our HR team. Please wait for an update.</p>
                           )}
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
                     <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <Bookmark size={40} />
                     </div>
                     <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No saved stories yet</h4>
                     <p className="text-gray-500 max-w-xs mx-auto mb-6">Tap the bookmark icon on any article to read it later.</p>
                     <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all">
                        Start Reading
                     </button>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {savedArticles.map(article => (
                        <div 
                           key={article.id} 
                           className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group border border-gray-100 dark:border-gray-800"
                           onClick={() => navigate(`/article/${article.slug}`)}
                        >
                           <Image src={article.imageUrl} alt={article.title} className="w-20 h-20 rounded-lg object-cover shadow-sm shrink-0"/>
                           <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{article.category}</span>
                              <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-blue-500 transition-colors line-clamp-2">{article.title}</h4>
                              <p className="text-xs text-gray-500 truncate">{article.summary}</p>
                           </div>
                           <button 
                              onClick={(e) => removeBookmark(e, article.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                              title="Remove from Saved"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="bg-white dark:bg-dark-lighter rounded-[2rem] p-8 shadow-lg border border-gray-100 dark:border-gray-800">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center font-display">
                  <Settings className="mr-3 text-primary" /> Settings & Preferences
               </h3>

               <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer group" onClick={toggleNotifications}>
                     <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${user.notificationsEnabled ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                           <Bell size={24} />
                        </div>
                        <div>
                           <p className="font-bold text-gray-900 dark:text-white text-lg">Push Notifications</p>
                           <p className="text-sm text-gray-500 group-hover:text-primary transition-colors">Get instant alerts for breaking news</p>
                        </div>
                     </div>
                     <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${user.notificationsEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${user.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer group" onClick={() => navigate('/privacy')}>
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                           <ShieldCheck size={24} />
                        </div>
                        <div>
                           <p className="font-bold text-gray-900 dark:text-white text-lg">Privacy & Security</p>
                           <p className="text-sm text-gray-500 group-hover:text-orange-500 transition-colors">Manage your data and visibility</p>
                        </div>
                     </div>
                     <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <button 
               onClick={handleLogout}
               className="w-full bg-white dark:bg-dark-lighter hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 font-bold py-5 rounded-[2rem] flex items-center justify-center transition-all border border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/30 shadow-sm hover:shadow-md group"
            >
               <LogOut size={22} className="mr-3 group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
            
            <div className="text-center text-xs text-gray-400">
               Member ID: <span className="font-mono">{user.id.substring(0, 8)}...</span>
            </div>
         </div>

      </div>
    </div>
  );
};

export default Profile;