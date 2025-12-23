
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { JobPosition } from '../../../types';
import { PlusCircle, Edit, Trash2, Briefcase, MapPin, Clock } from 'lucide-react';

const JobsTab: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJob, setCurrentJob] = useState<Partial<JobPosition>>({});

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    setJobs(StorageService.getJobs());
  };

  const handleSave = () => {
    if (!currentJob.title || !currentJob.department || !currentJob.location) {
      alert("Please fill in Title, Department, and Location.");
      return;
    }

    const jobToSave: JobPosition = {
      id: currentJob.id || 'job_' + Date.now(),
      title: currentJob.title,
      department: currentJob.department,
      location: currentJob.location,
      type: currentJob.type || 'Full-time',
      description: currentJob.description || '',
      postedAt: currentJob.postedAt || new Date().toISOString()
    };

    StorageService.saveJob(jobToSave);
    setJobs(StorageService.getJobs());
    setIsEditing(false);
    setCurrentJob({});
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      StorageService.deleteJob(id);
      loadJobs();
    }
  };

  const handleEdit = (job: JobPosition) => {
    setCurrentJob(job);
    setIsEditing(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Briefcase className="text-primary" /> Career Opportunities
          </h3>
          <p className="text-gray-500 text-sm mt-1">Manage open positions displayed on the Careers page.</p>
        </div>
        <button 
          onClick={() => { setCurrentJob({}); setIsEditing(true); }}
          className="mt-4 md:mt-0 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center shadow-lg"
        >
          <PlusCircle size={18} className="mr-2"/> Post New Job
        </button>
      </div>

      {/* Editor Form */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
          <h3 className="text-lg font-bold mb-6 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            {currentJob.id ? 'Edit Position' : 'Create New Position'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
              <input 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={currentJob.title || ''}
                onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
                placeholder="e.g. Senior Editor"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <select 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={currentJob.department || ''}
                onChange={(e) => setCurrentJob({ ...currentJob, department: e.target.value })}
              >
                <option value="">Select Department</option>
                <option value="Editorial">Editorial</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
              <input 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={currentJob.location || ''}
                onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
                placeholder="e.g. London, Remote"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={currentJob.type || 'Full-time'}
                onChange={(e) => setCurrentJob({ ...currentJob, type: e.target.value as any })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all min-h-[150px]"
                value={currentJob.description || ''}
                onChange={(e) => setCurrentJob({ ...currentJob, description: e.target.value })}
                placeholder="Job requirements and responsibilities..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleSave} 
              className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition-colors shadow-md"
            >
              Save Position
            </button>
            <button 
              onClick={() => { setIsEditing(false); setCurrentJob({}); }} 
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="grid gap-4">
        {jobs.length === 0 && <p className="text-center text-gray-500 py-10">No active job listings.</p>}
        {jobs.map(job => (
          <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-lg dark:text-white group-hover:text-primary transition-colors">{job.title}</h4>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{job.department}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center"><MapPin size={14} className="mr-1"/> {job.location}</span>
                <span className="flex items-center"><Clock size={14} className="mr-1"/> {job.type}</span>
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => handleEdit(job)}
                className="flex-1 md:flex-none p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(job.id)}
                className="flex-1 md:flex-none p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsTab;
