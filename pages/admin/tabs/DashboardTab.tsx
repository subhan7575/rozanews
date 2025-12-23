
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Eye, FileText, Users, Reply, RefreshCw, Cloud, CheckCircle, AlertCircle } from 'lucide-react';
import { Article, UserProfile, VideoPost } from '../../../types';
import { CATEGORIES } from '../../../constants';
import { StorageService } from '../../../services/storageService';

const DashboardTab: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setArticles(StorageService.getArticles());
    setVideos(StorageService.getVideos());
    setUsers(StorageService.getAllUsers());
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await StorageService.triggerSync();
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const totalViews = articles.reduce((acc, curr) => acc + curr.views, 0) + videos.reduce((acc, curr) => acc + curr.views, 0);
  const totalComments = articles.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0) + videos.reduce((acc, curr) => acc + (curr.comments.length || 0), 0);
  
  const categoryData = CATEGORIES.map(cat => ({
     name: cat,
     articles: articles.filter(a => a.category === cat).length,
     views: articles.filter(a => a.category === cat).reduce((acc, curr) => acc + curr.views, 0)
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner with Sync Action */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Cloud className="text-primary" size={20} /> System Connectivity
              </h3>
              <p className="text-gray-400 text-sm">Ensure your Ads and Articles are backed up to GitHub.</p>
          </div>
          <button 
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg ${isSyncing ? 'bg-gray-700 text-gray-400' : 'bg-primary text-white hover:bg-rose-700 active:scale-95'}`}
          >
              {isSyncing ? <RefreshCw className="animate-spin" size={18}/> : <RefreshCw size={18}/>}
              {isSyncing ? 'Pushing to GitHub...' : 'Force Cloud Sync'}
          </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <span className="text-gray-500 text-xs uppercase font-bold">Total Views</span>
               <Eye size={20} className="text-blue-500"/>
            </div>
            <h3 className="text-3xl font-black dark:text-white">{totalViews.toLocaleString()}</h3>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <span className="text-gray-500 text-xs uppercase font-bold">Articles</span>
               <FileText size={20} className="text-green-500"/>
            </div>
            <h3 className="text-3xl font-black dark:text-white">{articles.length}</h3>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <span className="text-gray-500 text-xs uppercase font-bold">Users</span>
               <Users size={20} className="text-purple-500"/>
            </div>
            <h3 className="text-3xl font-black dark:text-white">{users.length}</h3>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <span className="text-gray-500 text-xs uppercase font-bold">Comments</span>
               <Reply size={20} className="text-orange-500"/>
            </div>
            <h3 className="text-3xl font-black dark:text-white">{totalComments}</h3>
         </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-6 dark:text-white">Category Views</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1}/>
                     <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                     <YAxis stroke="#9CA3AF" fontSize={12}/>
                     <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                     <Bar dataKey="views" fill="#E11D48" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-6 dark:text-white">Article Spread</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={categoryData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1}/>
                     <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                     <YAxis stroke="#9CA3AF" fontSize={12}/>
                     <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                     <Area type="monotone" dataKey="articles" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DashboardTab;
