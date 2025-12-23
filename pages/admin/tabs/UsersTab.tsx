
import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  Loader2, Mail, MessageSquare, RefreshCw, 
  Send, Trash2, User as UserIcon, X, Shield, Clock, Search
} from 'lucide-react';
import { StorageService } from '../../../services/storageService';
import { DirectMessage, UserProfile } from '../../../types';
import { getFirebaseDb } from '../../../services/firebase';

const UsersTab: React.FC = () => {
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(userList);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredUsers(userList.filter(u => 
        u.name.toLowerCase().includes(lower) || 
        u.email.toLowerCase().includes(lower) ||
        u.phoneNumber?.includes(lower)
      ));
    }
  }, [searchTerm, userList]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const db = getFirebaseDb();
        // Force live fetch from Firestore 'users' collection
        const q = query(collection(db, "users"), orderBy("joinedAt", "desc"));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(docSnap => ({
            ...docSnap.data(),
            id: docSnap.id
        } as UserProfile));
        
        setUserList(data);
        console.log(`Fetched ${data.length} users from Firestore.`);
    } catch (e: any) {
        console.error("Firestore Users Fetch Error:", e);
        // Minimal fallback to local storage
        setUserList(StorageService.getAllUsers());
    } finally {
        setIsLoading(false);
    }
  };

  const deleteUserRecord = async (id: string) => {
    if (window.confirm('DANGER: This will permanently delete the user from Firebase and the website. Continue?')) {
        try {
            const db = getFirebaseDb();
            await deleteDoc(doc(db, "users", id));
            // Update UI
            setUserList(prev => prev.filter(u => u.id !== id));
            alert("User deleted successfully.");
        } catch (e) {
            alert("Delete failed. You may not have administrative permissions for this operation.");
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
      senderName: 'Roza Official Team',
      receiverId: selectedUser.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      await StorageService.sendDirectMessage(dm);
      alert(`Message dispatched to ${selectedUser.name}!`);
      setMessageText('');
      setSelectedUser(null);
    } catch (e) {
      alert("Cloud delivery failed.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        {/* DM Modal Overlay */}
        {selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-white/20">
                    <div className="bg-primary p-6 flex justify-between items-center text-white">
                        <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare size={20}/> Message: {selectedUser.name}</h3>
                        <button onClick={() => setSelectedUser(null)}><X size={24}/></button>
                    </div>
                    <form onSubmit={handleSendMessage} className="p-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
                            <img src={selectedUser.avatar} className="w-12 h-12 rounded-full border-2 border-white object-cover" alt="user"/>
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase">Target Address</p>
                                <p className="text-sm font-bold dark:text-white truncate">{selectedUser.email || selectedUser.phoneNumber}</p>
                            </div>
                        </div>
                        <textarea 
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white outline-none focus:ring-4 focus:ring-primary/20 min-h-[150px] resize-none"
                            placeholder="Type your official response..."
                            required
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isSending}
                            className="w-full bg-primary hover:bg-rose-700 text-white font-black py-4 rounded-2xl shadow-xl mt-6 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {isSending ? <Loader2 size={20} className="animate-spin" /> : <><Send size={20}/> Dispatch Message</>}
                        </button>
                    </form>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Stats Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h4 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">Database Health</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm dark:text-gray-400">Total Users</span>
                            <span className="font-black text-primary">{userList.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm dark:text-gray-400">Sync Status</span>
                            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded font-bold">LIVE</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={fetchUsers}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-2xl font-bold text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all"
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /> Refresh Data
                </button>
            </div>

            {/* Main Table Area */}
            <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name, email or phone..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 size={40} className="animate-spin text-primary opacity-50"/>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Synchronizing Firebase...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="py-20 text-center opacity-40">
                                <UserIcon size={64} className="mx-auto mb-4" />
                                <p className="font-bold text-gray-500">No users found.</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="p-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">User Details</th>
                                        <th className="p-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Permissions</th>
                                        <th className="p-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Joined</th>
                                        <th className="p-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt="u"/>
                                                    <div>
                                                        <p className="font-bold dark:text-white leading-none mb-1">{u.name}</p>
                                                        <p className="text-xs text-gray-500 font-mono">{u.email || u.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${u.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                        {u.role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs font-bold dark:text-gray-300 flex items-center gap-2">
                                                    <Clock size={12} className="text-gray-400" />
                                                    {new Date(u.joinedAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setSelectedUser(u)} className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-primary hover:text-white transition-all">
                                                        <MessageSquare size={16}/>
                                                    </button>
                                                    <button onClick={() => deleteUserRecord(u.id)} className="p-2 bg-gray-100 dark:bg-gray-700 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
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
        </div>
    </div>
  );
};

export default UsersTab;
