
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { getFirebaseDb } from '../../../services/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Message } from '../../../types';
import { Mail, Reply, Loader2, Trash2, RefreshCw, Calendar, User } from 'lucide-react';

const MessagesTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
        const db = getFirebaseDb();
        // Priority: Get directly from Firebase 'messages'
        const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(docSnap => ({
            ...docSnap.data(),
            id: docSnap.id
        } as Message));
        
        setMessages(data);
    } catch (e) {
        console.warn("Firestore fetch failed, checking local storage.", e);
        setMessages(StorageService.getMessages());
    } finally {
        setLoading(false);
    }
  };

  const handleReply = (msg: Message) => {
    if (!msg.email) return alert("Error: User email record missing.");
    const subject = encodeURIComponent(`Re: Roza News Inquiry - ${msg.name}`);
    const body = encodeURIComponent(`Hi ${msg.name},\n\nWe received your message on Roza News: "${msg.content.substring(0, 50)}..."\n\n[Response here]\n\nBest Regards,\nRoza News Administration`);
    window.open(`mailto:${msg.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this message permanently?")) {
        try {
            const db = getFirebaseDb();
            // Delete from Firestore
            await deleteDoc(doc(db, "messages", id));
            // Also update UI
            setMessages(prev => prev.filter(m => m.id !== id));
            // Also local
            await StorageService.deleteMessage(id);
        } catch (e) {
            alert("Delete operation failed on cloud.");
        }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
           <div>
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-3"><Mail size={24} className="text-primary"/> Inbox</h3>
              <p className="text-sm text-gray-500">Live feed of user inquiries from the Contact page.</p>
           </div>
           <button 
             onClick={loadMessages} 
             disabled={loading}
             className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-200 transition-all"
           >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Sync Inbox
           </button>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={48} className="animate-spin text-primary opacity-50"/>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Opening Secure Channel...</p>
            </div>
        ) : messages.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail size={40} className="text-gray-300"/>
                </div>
                <h3 className="text-xl font-bold dark:text-white">Your inbox is clear</h3>
                <p className="text-gray-500 mt-1">New user messages will appear here in real-time.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 group hover:border-primary/30 transition-all">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black text-xl">
                                    {msg.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold dark:text-white text-lg flex items-center gap-2">
                                        {msg.name} 
                                        {!msg.read && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                                    </h4>
                                    <p className="text-xs text-gray-500 font-mono flex items-center gap-1"><Mail size={10}/> {msg.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 dark:bg-black/30 px-3 py-1.5 rounded-full">
                                    <Calendar size={12}/> {new Date(msg.timestamp).toLocaleString()}
                                </div>
                                <button 
                                    onClick={() => handleDelete(msg.id)} 
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-white/5 mb-4 relative">
                            <div className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-2 text-[10px] font-bold text-gray-400 uppercase">Message Body</div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                {msg.content}
                            </p>
                        </div>
                        
                        <div className="flex justify-end">
                            <button 
                                onClick={() => handleReply(msg)} 
                                className="flex items-center gap-2 bg-primary hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-black text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
                            >
                                <Reply size={18}/> Compose Reply
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default MessagesTab;
