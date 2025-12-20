
import React, { useEffect, useState } from 'react';
import { Article } from '../../../types';

interface DraftsTabProps {
  onLoadDraft: (draft: Article) => void;
}

const DRAFT_KEY = 'roza_drafts_v1';

const DraftsTab: React.FC<DraftsTabProps> = ({ onLoadDraft }) => {
  const [drafts, setDrafts] = useState<Article[]>([]);

  useEffect(() => {
    try {
       const savedDrafts = localStorage.getItem(DRAFT_KEY);
       if(savedDrafts) setDrafts(JSON.parse(savedDrafts));
    } catch(e) { console.error("Draft load error", e); }
  }, []);

  const deleteDraft = (id: string) => {
     if(window.confirm("Delete this draft?")) {
        const newDrafts = drafts.filter(d => d.id !== id);
        setDrafts(newDrafts);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(newDrafts));
     }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold dark:text-white">Drafts ({drafts.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.length === 0 && <p className="text-gray-500 italic col-span-full">No drafts saved.</p>}
            {drafts.map(draft => (
                <div key={draft.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-600 relative group">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded absolute top-4 right-4">DRAFT</span>
                    <h3 className="font-bold dark:text-white text-lg mb-2 line-clamp-1">{draft.title || 'Untitled Draft'}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{draft.summary || 'No summary...'}</p>
                    <div className="flex gap-3">
                    <button onClick={() => onLoadDraft(draft)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Edit</button>
                    <button onClick={() => deleteDraft(draft.id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors">Discard</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default DraftsTab;
