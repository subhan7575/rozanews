
import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { 
  Loader2, Mail, MessageSquare, RefreshCw, 
  Send, Trash2, User as UserIcon, X 
} from 'lucide-react';
import { StorageService } from '../../../services/storageService';
import { DirectMessage, UserProfile } from '../../../types';
import { getFirebaseDb } from '../../../services/firebase';

const UsersTab: React.FC = () => {
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const db = getFirebaseDb();
        const q = query(collection(db, "users"), orderBy("joinedAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            setUserList(StorageService.getAllUsers());
        } else {
            const data = snapshot.docs.map(docSnap => ({
                ...docSnap.data(),
                id: docSnap.id
            } as UserProfile));
            setUserList(data);
        }
    } catch (e: any) {
        console.error("Firebase Fetch Error:", e.message);
        setUserList(StorageService.getAllUsers());
    } finally {
        setIsLoading(false);
    }
  };

  const deleteUserRecord = async (id: string) => {
    if (window.confirm('Permanently delete this user from the global database?')) {
        try {
            const db = getFirebaseDb();
            await deleteDoc(doc(db, "users", id));
            await StorageService.deleteUser(id);
            fetchUsers();
        } catch (e) {
            alert("Delete failed. Check your Firebase Security Rules.");
        }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !messageText.trim()) return;

    setIsSending(true);
    const admin = StorageService.getCurrentUser();
    
    const dm: DirectMessage = {
      id: 'dm_' + Date.now(),
      senderId: admin?.id || 'admin',
      senderName: 'Roza Admin Team',
      receiverId: selectedUser.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      await StorageService.sendDirectMessage(dm);
      alert(`Message sent to ${selectedUser.name}!`);
      setMessageText('');
      setSelectedUser(null);
    } catch (e) {
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleBulkEmail = () => {
    const allEmails = userList.map(u => u.email).filter(e => e && e.includes('@')).join(',');
    if(!allEmails) return alert("No valid emails found.");
    window.open(`mailto:?bcc=${allEmails}&subject=Official Update: Roza News`, '_blank');
  };

  return (
    <div className="relative animate-fade-in">
        {/* DM Modal Overlay */}
        {selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-white/20">
                    <div className="bg-primary p-6 flex justify-between items-center text-white">
                        <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare size={20}/> Send DM to {selectedUser.name}</h3>
                        <button onClick={() => setSelectedUser(null)}><X size={24}/></button>
                    </div>
                    <form onSubmit={handleSendMessage} className="p-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
                            <img src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}`} className="w-10 h-10 rounded-full border border-blue-200 object-cover" alt="user"/>
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase">Receiver</p>
                                <p className="text-sm font-bold dark:text-white truncate max-w-[250px]">{selectedUser.email || selectedUser.phoneNumber}</p>
                            </div>
                        </div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Message Content</label>
                        <textarea 
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white outline-none focus:ring-4 focus:ring-primary/20 min-h-[150px] resize-none font-medium"
                            placeholder="Write your message here..."
                            required
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isSending}
                            className="w-full bg-primary hover:bg-rose-700 text-white font-black py-4 rounded-2xl shadow-xl mt-6 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {isSending ? <Loader2 size={20} className="animate-spin" /> : <><Send size={20}/> Send Message</>}
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* User Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                <div>
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        Global User Directory <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm">{userList.length}</span>
                    </h3>
                    <p className="text-sm text-gray-500">Synchronized via Google Cloud Firestore</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchUsers} 
                        className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-white shadow-sm border border-gray-100 dark:border-gray-600 hover:bg-gray-50"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/> Sync Cloud
                    </button>
                    <button onClick={handleBulkEmail} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg hover:bg-rose-700">
                        <Mail size={16} className="mr-2" /> Broadcast
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 size={48} className="animate-spin text-primary opacity-50"/>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Accessing Encrypted Records...</p>
                    </div>
                ) : userList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-40">
                        <UserIcon size={64} className="text-gray-300" />
                        <p className="font-bold text-gray-500">No users identified in cloud.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-900/50">
                            <tr>
                            <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Member</th>
                            <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Permission</th>
                            <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Onboarding</th>
                            <th className="p-4 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {userList.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt="avatar"/>
                                        <div>
                                            <div className="font-bold dark:text-white group-hover:text-primary transition-colors">{u.name}</div>
                                            <div className="text-xs text-gray-500 font-mono truncate max-w-[180px]">{u.email || u.phoneNumber}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="text-xs font-bold dark:text-gray-300">
                                        {new Date(u.joinedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Registration</div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setSelectedUser(u)} className="bg-primary text-white p-2 rounded-lg hover:bg-rose-700" title="Send Direct Message">
                                            <MessageSquare size={16}/>
                                        </button>
                                        <button onClick={() => deleteUserRecord(u.id)} className="bg-gray-100 dark:bg-gray-700 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white" title="Delete Account">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    </div>
  );
};

export default UsersTab;
