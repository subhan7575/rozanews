
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { getFirebaseDb } from '../../../services/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { UserProfile, DirectMessage } from '../../../types';
import { Mail, Trash2, Loader2, RefreshCw, MessageSquare, Send, X } from 'lucide-react';

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
        const db = getFirebaseDb();
        const snapshot = await getDocs(collection(db, "users"));
        const data = snapshot.docs.map(doc => doc.data() as UserProfile);
        setUsers(data);
    } catch (e) {
        setUsers(StorageService.getAllUsers());
    } finally {
        setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm('Delete user? This cannot be undone.')) {
        await StorageService.deleteUser(id);
        loadUsers();
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

  const handleBroadcastEmail = () => {
    const allEmails = users.map(u => u.email).filter(e => e && e.includes('@')).join(',');
    if(!allEmails) return alert("No users with valid emails found.");
    window.open(`mailto:?bcc=${allEmails}&subject=Update from Roza News`, '_blank');
  };

  return (
    <div className="relative animate-fade-in">
        {/* MESSAGE MODAL */}
        {selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-white/20">
                    <div className="bg-primary p-6 flex justify-between items-center text-white">
                        <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare size={20}/> Message to {selectedUser.name}</h3>
                        <button onClick={() => setSelectedUser(null)}><X size={24}/></button>
                    </div>
                    <form onSubmit={handleSendMessage} className="p-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
                            <img src={selectedUser.avatar} className="w-10 h-10 rounded-full border border-blue-200" alt="user"/>
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase">Target User</p>
                                <p className="text-sm font-bold dark:text-white">{selectedUser.email || selectedUser.phoneNumber}</p>
                            </div>
                        </div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Message Content</label>
                        <textarea 
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white outline-none focus:ring-4 focus:ring-primary/20 min-h-[150px] resize-none"
                            placeholder="Type your official message here..."
                            required
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isSending}
                            className="w-full bg-primary hover:bg-rose-700 text-white font-black py-4 rounded-2xl shadow-xl mt-6 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {isSending ? <Loader2 size={20} className="animate-spin" /> : <><Send size={20}/> Send Direct Message</>}
                        </button>
                    </form>
                </div>
            </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                <div>
                    <h3 className="text-xl font-bold dark:text-white">Registered Users ({users.length})</h3>
                    <p className="text-sm text-gray-500">Manage community and communications</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadUsers} className="p-2 text-gray-400 hover:text-primary transition-colors"><RefreshCw size={18} className={loading ? 'animate-spin' : ''}/></button>
                    <button onClick={handleBroadcastEmail} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg hover:bg-rose-700 transition-colors">
                        <Mail size={16} className="mr-2" /> Global Email
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-primary opacity-50"/></div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-900/50">
                            <tr>
                            <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">User</th>
                            <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Role</th>
                            <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Joined</th>
                            <th className="p-4 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-10 h-10 rounded-full object-cover" alt="avatar"/>
                                        <div>
                                        <div className="font-bold dark:text-white">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email || user.phoneNumber}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(user.joinedAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setSelectedUser(user)} className="text-primary hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded transition-colors" title="Send In-App Message">
                                            <MessageSquare size={18}/>
                                        </button>
                                        <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-colors" title="Delete User">
                                            <Trash2 size={18}/>
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
