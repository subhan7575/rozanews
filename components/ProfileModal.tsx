import React from 'react';
import { X, User, Mail, Calendar, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onLogout }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-white/20">
         <div className="h-24 bg-gradient-to-r from-primary to-purple-600 relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
               <X size={18} />
            </button>
         </div>

         <div className="px-6 pb-8 relative text-center">
            <div className="w-24 h-24 mx-auto -mt-12 rounded-full border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden bg-white">
               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            
            <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 text-sm mb-6">{user.role.toUpperCase()}</p>

            <div className="space-y-4 text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6">
               <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400"/>
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                     <p className="text-sm dark:text-gray-300 font-medium truncate">{user.email}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400"/>
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Joined</p>
                     <p className="text-sm dark:text-gray-300 font-medium">{new Date(user.joinedAt).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>

            <button 
               onClick={onLogout}
               className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center transition-colors"
            >
               <LogOut size={18} className="mr-2"/> Sign Out
            </button>
         </div>
      </div>
    </div>
  );
};

export default ProfileModal;