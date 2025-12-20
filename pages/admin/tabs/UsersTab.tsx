
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { UserProfile } from '../../../types';
import { Mail, Trash2 } from 'lucide-react';

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    setUsers(StorageService.getAllUsers());
  };

  const deleteUser = (id: string) => {
    if (window.confirm('Delete user? This cannot be undone.')) {
        StorageService.deleteUser(id);
        refreshUsers();
    }
  };

  const handleBroadcastEmail = () => {
    const allEmails = users.map(u => u.email).filter(e => e && e.includes('@')).join(',');
    if(!allEmails) return alert("No users with valid emails found.");
    window.open(`mailto:?bcc=${allEmails}&subject=Update from Roza News`, '_blank');
  };

  const handleEmailUser = (email: string, name: string) => {
    window.open(`mailto:${email}?subject=Message for ${name}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-black/20">
            <div>
                <h3 className="text-xl font-bold dark:text-white">Registered Users ({users.length})</h3>
                <p className="text-sm text-gray-500">Manage community and communications</p>
            </div>
            <button onClick={handleBroadcastEmail} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg hover:bg-rose-700 transition-colors">
                <Mail size={16} className="mr-2" /> Broadcast to All
            </button>
        </div>
        <div className="overflow-x-auto">
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
                                {user.avatar && <img src={user.avatar} className="w-10 h-10 rounded-full" alt="avatar"/>}
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
                                {user.email && (
                                <button onClick={() => handleEmailUser(user.email, user.name)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded transition-colors" title="Send Email">
                                    <Mail size={18}/>
                                </button>
                                )}
                                <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-colors" title="Delete User">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default UsersTab;