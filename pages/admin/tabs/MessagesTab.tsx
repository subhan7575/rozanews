
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { getFirebaseDb } from '../../../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Message } from '../../../types';
import { Mail, Reply, Loader2, Trash2 } from 'lucide-react';

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
        const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as Message);
        setMessages(data);
    } catch (e) {
        setMessages(StorageService.getMessages());
    } finally {
        setLoading(false);
    }
  };

  const handleReply = (msg: Message) => {
    if (!msg.email) return alert("This message has no return email.");
    const subject = encodeURIComponent(`Re: Your message to Roza News`);
    const body = encodeURIComponent(`Hi ${msg.name},\n\nThank you for reaching out to us.\n\nRegarding your message:\n"${msg.content}"\n\n[Write your reply here]\n\nBest regards,\nRoza News Team`);
    window.open(`mailto:${msg.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this message?")) {
        await StorageService.deleteMessage(id);
        loadMessages();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
           <div>
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2"><Mail size={20} className="text-primary"/> Messages</h3>
              <p className="text-sm text-gray-500">Recent inquiries from users.</p>
           </div>
           <button onClick={loadMessages} className="p-2 text-gray-400 hover:text-primary transition-colors"><Loader2 size={18} className={loading ? 'animate-spin' : ''}/></button>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-primary opacity-50"/></div>
        ) : messages.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Mail size={48} className="text-gray-300 mx-auto mb-4"/>
                <p className="text-gray-500 font-bold">No messages received yet.</p>
            </div>
        ) : (
            messages.map(msg => (
                <div key={msg.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {msg.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold dark:text-white text-lg">{msg.name}</h4>
                            <p className="text-sm text-gray-500 font-mono">{msg.email}</p>
                        </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-black/30 px-3 py-1 rounded-full">
                            {new Date(msg.timestamp).toLocaleString()}
                            </span>
                            <button onClick={() => handleDelete(msg.id)} className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-xl border border-gray-100 dark:border-white/5 mb-4">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.content}
                        </p>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-white/5">
                        <button onClick={() => handleReply(msg)} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors shadow-md">
                        <Reply size={16}/> Reply via Email
                        </button>
                    </div>
                </div>
            ))
        )}
    </div>
  );
};

export default MessagesTab;
