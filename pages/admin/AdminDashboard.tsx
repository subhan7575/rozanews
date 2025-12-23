
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { Article } from '../../types';
import { Menu, ArrowRight, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Toast, { ToastType } from '../../components/Toast';

// Tabs
import AdminSidebar from '../../components/admin/AdminSidebar';
import DashboardTab from './tabs/DashboardTab';
import JobsTab from './tabs/JobsTab';
import ApplicationsTab from './tabs/ApplicationsTab';
import ArticlesTab from './tabs/ArticlesTab';
import ArticleEditorTab from './tabs/ArticleEditorTab';
import DraftsTab from './tabs/DraftsTab';
import VideosTab from './tabs/VideosTab';
import AdsTab from './tabs/AdsTab';
import TickerTab from './tabs/TickerTab';
import UsersTab from './tabs/UsersTab';
import MessagesTab from './tabs/MessagesTab';
import CodeEditorTab from './tabs/CodeEditorTab';
import SyncTab from './tabs/SyncTab';
import SEOTab from './tabs/SEOTab';

const DRAFT_KEY = 'roza_drafts_v1';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Fix: Removed 'api' from allowed tabs list to comply with GenAI guidelines (preventing user-managed API keys)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'drafts' | 'ads' | 'article_editor' | 'code_editor' | 'videos' | 'sync' | 'users' | 'messages' | 'ticker' | 'jobs' | 'applications' | 'seo'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const [draftsCount, setDraftsCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<{state: 'idle' | 'syncing' | 'success' | 'error', time: string}>({ state: 'idle', time: 'Connect Once' });
  const [editingArticle, setEditingArticle] = useState<Partial<Article>>({});
  
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

  useEffect(() => {
    if (!StorageService.isAuthenticated()) { navigate('/login'); return; }
    updateDraftsCount();

    const handleSync = (e: any) => {
        setSyncStatus(e.detail);
        if (e.detail.state === 'success') showToast("Cloud Backup Successful!", "success");
        if (e.detail.state === 'error') showToast("Cloud Backup Failed", "error");
    };
    window.addEventListener('roza_sync_status', handleSync);
    return () => window.removeEventListener('roza_sync_status', handleSync);
  }, [navigate]);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const updateDraftsCount = () => {
    try {
        const savedDrafts = localStorage.getItem(DRAFT_KEY);
        if(savedDrafts) setDraftsCount(JSON.parse(savedDrafts).length);
        else setDraftsCount(0);
    } catch(e) { setDraftsCount(0); }
  };

  const handleLogout = () => { StorageService.logout(); navigate('/login'); };
  const handleSystemReset = () => { if (window.confirm("DANGER: This will delete ALL data. Are you sure?")) StorageService.factoryReset(); };
  const handleCreateNewArticle = () => { setEditingArticle({}); setActiveTab('article_editor'); };
  const handleEditArticle = (article: Article) => { setEditingArticle(article); setActiveTab('article_editor'); };
  const handleLoadDraft = (draft: Article) => { setEditingArticle(draft); setActiveTab('article_editor'); };
  
  const handleSaveDraft = (draft: Article) => {
    try {
        const savedDraftsStr = localStorage.getItem(DRAFT_KEY);
        let drafts: Article[] = savedDraftsStr ? JSON.parse(savedDraftsStr) : [];
        const index = drafts.findIndex(d => d.id === draft.id);
        if (index >= 0) drafts[index] = draft as Article; else drafts.unshift(draft as Article);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
        updateDraftsCount();
        showToast("Draft Stored locally.", "success");
        setActiveTab('drafts');
    } catch(e) { console.error(e); }
  };

  const handleTabChange = (tab: any) => {
     setActiveTab(tab);
     setSidebarOpen(false); // Auto-close sidebar on mobile
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black font-sans overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} draftsCount={draftsCount} handleSystemReset={handleSystemReset} handleLogout={handleLogout} />
      
      {!isSidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="md:hidden fixed top-4 left-4 z-40 p-2 bg-dark text-white rounded-lg shadow-lg">
          <Menu size={20} />
        </button>
      )}

      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 pl-12 md:pl-0 gap-4">
             <div>
                <h1 className="text-3xl font-black dark:text-white capitalize flex items-center gap-3">
                  {activeTab.replace('_', ' ')}
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Roza News Official Terminal</p>
             </div>

             <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                    syncStatus.state === 'syncing' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20' : 
                    syncStatus.state === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20' :
                    syncStatus.state === 'error' ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20' :
                    'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800'
                }`}>
                   {syncStatus.state === 'syncing' && <Loader2 size={12} className="animate-spin" />}
                   {syncStatus.state === 'success' && <CheckCircle size={12} />}
                   {syncStatus.state === 'error' && <AlertCircle size={12} />}
                   {syncStatus.state === 'idle' && <RefreshCw size={12} />}
                   <span>Sync: {syncStatus.time}</span>
                </div>

                <button onClick={() => window.open('/', '_blank')} className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-500 hover:text-primary transition-colors bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                    Live <ArrowRight size={14} />
                </button>
             </div>
          </header>

          <div className="min-h-screen">
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'articles' && <ArticlesTab onEdit={handleEditArticle} onCreate={handleCreateNewArticle} />}
              {activeTab === 'article_editor' && <ArticleEditorTab initialArticle={editingArticle} onSaveComplete={() => { showToast("Article Published!", "success"); setActiveTab('articles'); }} onCancel={() => setActiveTab('articles')} onSaveDraft={handleSaveDraft} />}
              {activeTab === 'drafts' && <DraftsTab onLoadDraft={handleLoadDraft} />}
              {activeTab === 'videos' && <VideosTab />}
              {activeTab === 'jobs' && <JobsTab />}
              {activeTab === 'applications' && <ApplicationsTab />}
              {activeTab === 'ads' && <AdsTab />}
              {activeTab === 'ticker' && <TickerTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'messages' && <MessagesTab />}
              {activeTab === 'code_editor' && <CodeEditorTab />}
              {activeTab === 'sync' && <SyncTab />}
              {activeTab === 'seo' && <SEOTab />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
