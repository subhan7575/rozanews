
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { Article } from '../../types';
import { Menu, ArrowRight } from 'lucide-react';

// New Components
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
import ApiTab from './tabs/ApiTab';

const DRAFT_KEY = 'roza_drafts_v1';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'drafts' | 'ads' | 'article_editor' | 'code_editor' | 'api' | 'videos' | 'sync' | 'users' | 'messages' | 'ticker' | 'jobs' | 'applications'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const [draftsCount, setDraftsCount] = useState(0);
  
  // Editor State maintained here to allow switching between list and editor
  const [editingArticle, setEditingArticle] = useState<Partial<Article>>({});

  useEffect(() => {
    if (!StorageService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    updateDraftsCount();
  }, [navigate]);

  const updateDraftsCount = () => {
    try {
        const savedDrafts = localStorage.getItem(DRAFT_KEY);
        if(savedDrafts) setDraftsCount(JSON.parse(savedDrafts).length);
        else setDraftsCount(0);
    } catch(e) { setDraftsCount(0); }
  };

  const handleLogout = () => {
    StorageService.logout();
    navigate('/login');
  };

  const handleSystemReset = () => {
    if (window.confirm("DANGER: This will delete ALL data. Are you sure?")) {
      StorageService.factoryReset();
    }
  };

  // --- ACTIONS FOR SUB-COMPONENTS ---

  const handleCreateNewArticle = () => {
    setEditingArticle({});
    setActiveTab('article_editor');
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setActiveTab('article_editor');
  };

  const handleLoadDraft = (draft: Article) => {
    setEditingArticle(draft);
    setActiveTab('article_editor');
  };

  const handleSaveDraft = (draft: Article) => {
    try {
        const savedDraftsStr = localStorage.getItem(DRAFT_KEY);
        let drafts: Article[] = savedDraftsStr ? JSON.parse(savedDraftsStr) : [];
        // Update existing or add new
        const index = drafts.findIndex(d => d.id === draft.id);
        if (index >= 0) drafts[index] = draft as Article;
        else drafts.unshift(draft as Article);
        
        localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
        updateDraftsCount();
        alert("Draft Saved!");
        setActiveTab('drafts');
    } catch(e) { console.error(e); }
  };

  const handleEditorComplete = () => {
    setActiveTab('articles');
  };

  const handleEditorCancel = () => {
    setActiveTab('articles');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black font-sans overflow-hidden">
      
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        draftsCount={draftsCount}
        handleSystemReset={handleSystemReset}
        handleLogout={handleLogout}
      />
      
      {/* Mobile Toggle */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-dark text-white rounded-lg shadow-lg"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
          
          <header className="flex justify-between items-center mb-8 pl-12 md:pl-0">
             <h1 className="text-2xl md:text-3xl font-bold dark:text-white capitalize flex items-center gap-3">
               {activeTab.replace('_', ' ')}
             </h1>
             <button onClick={() => window.open('/', '_blank')} className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                View Site <ArrowRight size={16} />
             </button>
          </header>

          {/* --- TAB CONTENT SWITCHER --- */}
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'articles' && <ArticlesTab onEdit={handleEditArticle} onCreate={handleCreateNewArticle} />}
          {activeTab === 'article_editor' && <ArticleEditorTab initialArticle={editingArticle} onSaveComplete={handleEditorComplete} onCancel={handleEditorCancel} onSaveDraft={handleSaveDraft} />}
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
          {activeTab === 'api' && <ApiTab />}
          
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
