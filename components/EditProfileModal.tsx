
import React, { useState, useRef } from 'react';
import { X, Save, Camera, Upload, User, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { MediaService } from '../services/firebase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser, onSave }) => {
  const [name, setName] = useState(currentUser.name);
  const [previewUrl, setPreviewUrl] = useState(currentUser.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalAvatarUrl = previewUrl;

      // Upload if new file selected
      if (avatarFile) {
         finalAvatarUrl = await MediaService.uploadFile(avatarFile, 'profiles');
      }

      const updatedUser: UserProfile = {
        ...currentUser,
        name: name,
        avatar: finalAvatarUrl
      };

      onSave(updatedUser);
      onClose();
    } catch (err) {
      console.error("Profile Update Failed", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-white/20">
         <div className="h-24 bg-gradient-to-r from-primary to-purple-600 relative">
            <h2 className="absolute bottom-4 left-6 text-2xl font-bold text-white drop-shadow-md">Edit Profile</h2>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
               <X size={18} />
            </button>
         </div>

         <form onSubmit={handleSave} className="p-6">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-8 -mt-16">
               <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden bg-gray-200">
                     <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Camera className="text-white" size={32} />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-primary p-2 rounded-full border-2 border-white dark:border-gray-900 shadow-sm text-white">
                     <Upload size={14} />
                  </div>
               </div>
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*"
                  onChange={handleFileChange} 
               />
               <p className="text-xs text-gray-500 mt-3">Click to change photo</p>
            </div>

            {/* Name Input */}
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name</label>
                  <div className="relative">
                     <User className="absolute left-3 top-3 text-gray-400" size={18}/>
                     <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        required
                     />
                  </div>
               </div>
            </div>

            <div className="mt-8 flex gap-3">
               <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
               >
                  Cancel
               </button>
               <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
               >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
               </button>
            </div>
         </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
