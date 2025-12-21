
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { getFirebaseDb } from '../../../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { JobApplication } from '../../../types';
import { Mail, Briefcase, GraduationCap, PenTool, FileText, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';

const ApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
        const db = getFirebaseDb();
        const q = query(collection(db, "applications"), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as JobApplication);
        setApplications(data);
    } catch (e) {
        console.error("Firestore applications fetch failed", e);
        // Fallback to local
        setApplications(StorageService.getJobApplications());
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      await StorageService.deleteJobApplication(id);
      loadApplications();
    }
  };

  const handleStatusChange = async (id: string, newStatus: JobApplication['status']) => {
    await StorageService.updateJobApplicationStatus(id, newStatus);
    loadApplications();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'hired': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Briefcase className="text-primary" /> Job Applications
          </h3>
          <p className="text-gray-500 text-sm mt-1">Review candidates and manage hiring process.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={loadApplications} className="p-2 text-gray-400 hover:text-primary transition-colors"><Loader2 size={18} className={loading ? 'animate-spin' : ''}/></button>
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">{applications.length}</span> <span className="text-sm text-gray-500">Candidates</span>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-primary opacity-50"/></div>
        ) : applications.length === 0 ? (
           <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <Briefcase size={48} className="text-gray-300 mx-auto mb-4"/>
              <p className="text-gray-500 font-bold">No applications received yet.</p>
           </div>
        ) : (
            applications.map(app => (
                <div key={app.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 gap-4">
                        <div className="flex items-center gap-4">
                        <img src={app.applicantAvatar || `https://ui-avatars.com/api/?name=${app.applicantName}`} className="w-12 h-12 rounded-full" alt="Applicant"/>
                        <div>
                            <h4 className="font-bold text-lg dark:text-white">{app.applicantName}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail size={12}/> {app.applicantEmail}
                            </div>
                        </div>
                        </div>
                        <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                            {app.status === 'hired' ? 'Selected' : app.status}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(app.submittedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Applying For</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Briefcase size={16} className="text-primary"/> {app.jobTitle}
                        </p>
                        </div>
                        <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Education</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <GraduationCap size={16} className="text-blue-500"/> {app.education}
                        </p>
                        </div>
                        <div className="md:col-span-2">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Key Skills</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <PenTool size={16} className="text-purple-500"/> {app.skills}
                        </p>
                        </div>
                        <div className="md:col-span-2 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                            <FileText size={14}/> Detailed Cover Letter / Info
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                            {app.details}
                        </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <button onClick={() => handleStatusChange(app.id, 'hired')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm">
                            <CheckCircle size={16}/> Select Candidate
                        </button>
                        <button onClick={() => handleStatusChange(app.id, 'rejected')} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                            <XCircle size={16}/> Reject
                        </button>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                        <button onClick={() => handleDelete(app.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 size={18}/>
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ApplicationsTab;
