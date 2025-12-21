
import React from 'react';
import { Layout, FileText, Archive, Film, Megaphone, DollarSign, Users, Mail, Briefcase, Code, Cloud, Key, LogOut, X, ClipboardList, Globe } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  draftsCount: number;
  handleSystemReset: () => void;
  handleLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setSidebarOpen, 
  draftsCount, 
  handleSystemReset, 
  handleLogout 
}) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
         <h2 className="text-xl font-black tracking-tighter flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">R</div>
           ADMIN
         </h2>
         <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3">
         <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Layout size={18} /> Dashboard
         </button>

         <div className="text-xs font-bold text-gray-500 uppercase px-3 mb-2 mt-4">Content</div>
         <button onClick={() => setActiveTab('articles')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'articles' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <FileText size={18} /> Articles
         </button>
         <button onClick={() => setActiveTab('drafts')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'drafts' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Archive size={18} /> Drafts ({draftsCount})
         </button>
         <button onClick={() => setActiveTab('videos')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'videos' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Film size={18} /> Videos
         </button>
         <button onClick={() => setActiveTab('jobs')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'jobs' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Briefcase size={18} /> Careers / Jobs
         </button>
         <button onClick={() => setActiveTab('applications')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'applications' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <ClipboardList size={18} /> Applications
         </button>
         <button onClick={() => setActiveTab('ticker')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'ticker' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Megaphone size={18} /> Breaking News
         </button>

         <div className="text-xs font-bold text-gray-500 uppercase px-3 mb-2 mt-6">Monetization & SEO</div>
         <button onClick={() => setActiveTab('seo')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'seo' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Globe size={18} /> SEO Manager
         </button>
         <button onClick={() => setActiveTab('ads')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'ads' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <DollarSign size={18} /> Ad Manager
         </button>

         <div className="text-xs font-bold text-gray-500 uppercase px-3 mb-2 mt-6">System</div>
         <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Users size={18} /> Users
         </button>
         <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'messages' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Mail size={18} /> Messages
         </button>
         <button onClick={() => setActiveTab('code_editor')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'code_editor' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Code size={18} /> File Editor
         </button>
         <button onClick={() => setActiveTab('sync')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'sync' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Cloud size={18} /> Cloud Sync
         </button>
         <button onClick={() => setActiveTab('api')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'api' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Key size={18} /> API Keys
         </button>
      </nav>

      <div className="p-4 border-t border-white/10">
         <button onClick={handleSystemReset} className="w-full mb-3 flex items-center justify-center gap-2 text-red-500 text-xs font-bold hover:text-red-400">
             Reset System
         </button>
         <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg transition-colors text-sm font-bold">
            <LogOut size={16} /> Sign Out
         </button>
      </div>
    </div>
  );
};

export default AdminSidebar;