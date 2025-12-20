
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Eye, FileText, Users, Reply } from 'lucide-react';
import { Article, UserProfile, VideoPost } from '../../../types';
import { CATEGORIES } from '../../../constants';
import { StorageService } from '../../../services/storageService';

const DashboardTab: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    setArticles(StorageService.getArticles());
    setVideos(StorageService.getVideos());
    setUsers(StorageService.getAllUsers());
  }, []);

  const totalViews = articles.reduce((acc, curr) => acc + curr.views, 0) + videos.reduce((acc, curr) => acc + curr.views, 0);
  const totalComments = articles.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0) + videos.reduce((acc, curr) => acc + (curr.comments.length || 0), 0);
  
  const categoryData = CATEGORIES.map(cat => ({
     name: cat,
     articles: articles.filter(a => a.category === cat).length,
     views: articles.filter(a => a.category === cat).reduce((acc, curr) => acc + curr.views, 0)
  }));

  return (
    <div className="space-y-8 animate-fade-in">
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
               <span className="text-gray-500 text-xs uppercase font-bold">Published Articles</span>
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
               <span className="text-gray-500 text-xs uppercase font-bold">Total Comments</span>
               <Reply size={20} className="text-orange-500"/>
            </div>
            <h3 className="text-3xl font-black dark:text-white">{totalComments}</h3>
         </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-6 dark:text-white">Category Popularity</h3>
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
            <h3 className="font-bold text-lg mb-6 dark:text-white">Article Distribution</h3>
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
