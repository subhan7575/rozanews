
import React, { useEffect, useState } from 'react';
import { Briefcase, Globe, Zap, Heart, ArrowRight, MapPin, Clock, X, CheckCircle, GraduationCap, PenTool, FileText, Loader2, Send, Search } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { JobPosition, UserProfile, JobApplication } from '../types';
import AuthModal from '../components/AuthModal';
import SEO from '../components/SEO';

const Careers: React.FC = () => {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userApplications, setUserApplications] = useState<JobApplication[]>([]);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);

  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  useEffect(() => {
    setPositions(StorageService.getJobs());
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
       setUserApplications(StorageService.getUserApplications(user.id));
    }
  }, []);

  const handleApplyClick = (job: JobPosition) => {
    setSelectedJob(job);
    if (currentUser) {
      const existingApp = StorageService.getUserApplications(currentUser.id).find(app => app.jobId === job.id);
      if (existingApp) { setStatus('success'); } else { setStatus('idle'); }
      setIsApplyModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setUserApplications(StorageService.getUserApplications(user.id));
    setIsAuthModalOpen(false);
    if (selectedJob) setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedJob) return;

    setStatus('sending');

    const application: JobApplication = {
      id: 'app_' + Date.now(),
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantEmail: currentUser.email,
      applicantAvatar: currentUser.avatar,
      education: education,
      skills: skills,
      details: details,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    StorageService.saveJobApplication(application);
    setUserApplications(prev => [application, ...prev]);

    // Small delay for realism
    setTimeout(() => {
       setStatus('success');
       setEducation('');
       setSkills('');
       setDetails('');
    }, 1500);
  };

  const isApplied = (jobId: string) => userApplications.some(app => app.jobId === jobId);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in space-y-20">
      <SEO title="Careers - Join Roza News" description="Apply for open positions and join the future of journalism." />
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={handleLoginSuccess} />

      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsApplyModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-white/20 flex flex-col max-h-[90vh]">
            <div className="h-20 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center px-8 relative shrink-0">
               <h3 className="text-xl font-black text-white">Apply: {selectedJob.title}</h3>
               <button onClick={() => setIsApplyModalOpen(false)} className="absolute top-1/2 -translate-y-1/2 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"><X size={18} /></button>
            </div>

            <div className="p-8 overflow-y-auto">
               {status === 'success' ? (
                  <div className="text-center py-10">
                     <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
                     <h2 className="text-2xl font-black dark:text-white mb-2">Application Sent!</h2>
                     <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Track your status in your <strong>Profile</strong>.</p>
                     <button onClick={() => setIsApplyModalOpen(false)} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-4 rounded-2xl transition-colors">Close</button>
                  </div>
               ) : (
                  <form onSubmit={handleSubmitApplication} className="space-y-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Education</label>
                        <input required className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="Highest Degree & Institution" value={education} onChange={(e) => setEducation(e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Skills</label>
                        <input required className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="Key relevant skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">About You</label>
                        <textarea required rows={4} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none" placeholder="Tell us why you are a good fit..." value={details} onChange={(e) => setDetails(e.target.value)} />
                     </div>
                     <button type="submit" disabled={status === 'sending'} className="w-full bg-primary hover:bg-rose-700 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2">
                        {status === 'sending' ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} /> Submit Application</>}
                     </button>
                  </form>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="text-center py-20 bg-gradient-to-b from-gray-50 to-white dark:from-dark-lighter dark:to-dark rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-inner">
         <div className="inline-block p-4 bg-primary/10 text-primary rounded-3xl mb-6"><Briefcase size={48} /></div>
         <h1 className="text-5xl md:text-7xl font-black font-display text-gray-900 dark:text-white tracking-tight mb-6">Build the Future of <br/><span className="text-primary">Journalism</span></h1>
         <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">Join Roza News and help us bring clarity to a complex world.</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
           { icon: Globe, color: 'text-blue-500', title: 'Global Reach', desc: 'Work on stories that impact millions of readers across 120 countries.' },
           { icon: Zap, color: 'text-yellow-500', title: 'Tech-Driven', desc: 'Use AI and modern workflows to redefine how news is delivered.' },
           { icon: Heart, color: 'text-red-500', title: 'Culture First', desc: 'Flexible remote work, competitive benefits, and a focus on wellness.' }
        ].map((item, i) => (
           <div key={i} className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
              <item.icon className={`${item.color} mb-6 group-hover:scale-110 transition-transform`} size={40} />
              <h3 className="text-2xl font-bold mb-3 dark:text-white">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
           </div>
        ))}
      </div>

      {/* Job List */}
      <div>
        <div className="flex items-center justify-between mb-12">
           <h2 className="text-4xl font-black dark:text-white font-display">Open Positions</h2>
           <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm font-bold text-gray-500"><Search size={16}/> Search Careers</div>
        </div>
        
        {positions.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-400 font-bold">No active positions. Check back soon!</p>
           </div>
        ) : (
          <div className="space-y-6">
            {positions.map(job => {
              const applied = isApplied(job.id);
              return (
                <div key={job.id} className={`bg-white dark:bg-gray-800 p-8 rounded-[2rem] border transition-all hover:shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 ${applied ? 'border-green-500/30' : 'border-gray-100 dark:border-gray-700'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                       <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h3>
                       <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">{job.department}</span>
                       {applied && <span className="text-green-500 flex items-center gap-1 text-xs font-bold uppercase"><CheckCircle size={14}/> Applied</span>}
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-4">
                       <span className="flex items-center"><MapPin size={16} className="mr-2 text-primary"/> {job.location}</span>
                       <span className="flex items-center"><Clock size={16} className="mr-2 text-blue-400"/> {job.type}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 line-clamp-2 text-lg font-light leading-relaxed">{job.description}</p>
                  </div>
                  <button 
                    onClick={() => handleApplyClick(job)}
                    className={`${applied ? 'bg-green-600' : 'bg-black dark:bg-white text-white dark:text-black'} font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95 whitespace-nowrap`}
                  >
                    {applied ? 'View Status' : 'Apply Now'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Careers;
