import React, { useEffect, useState } from 'react';
import { Briefcase, Globe, Zap, Coffee, Heart, ArrowRight, MapPin, Clock, X, CheckCircle, GraduationCap, PenTool, FileText, Loader2, Send } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { JobPosition, UserProfile, JobApplication } from '../types';
import AuthModal from '../components/AuthModal';

const Careers: React.FC = () => {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userApplications, setUserApplications] = useState<JobApplication[]>([]);
  
  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);

  // Form States
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const CAREER_EMAIL = "rozanewscareers@gmail.com";

  const generalInquiryJob: JobPosition = {
    id: 'general_application',
    title: "General Inquiry / Open Application",
    department: "Human Resources",
    location: "Global / Remote",
    type: "Full-time",
    description: "Submit your profile and portfolio for future opportunities at Roza News.",
    postedAt: new Date().toISOString()
  };

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
    const user = StorageService.getCurrentUser();
    
    if (user) {
      setCurrentUser(user);
      const existingApp = StorageService.getUserApplications(user.id).find(app => app.jobId === job.id);
      if (existingApp) {
         setStatus('success'); 
         setIsApplyModalOpen(true);
      } else {
         setStatus('idle');
         setIsApplyModalOpen(true);
      }
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setUserApplications(StorageService.getUserApplications(user.id));
    setIsAuthModalOpen(false);
    if (selectedJob) {
      setIsApplyModalOpen(true);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedJob) return;

    setStatus('sending');

    // 1. Create Application Object
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

    // 2. Save Locally (Primary Source of Truth for Admin)
    StorageService.saveJobApplication(application);
    
    // Refresh local state to show "Applied" immediately
    setUserApplications(prev => [application, ...prev]);

    // 3. Send Email Notification (Best Effort)
    try {
      await fetch(`https://formsubmit.co/ajax/${CAREER_EMAIL}`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Application: ${selectedJob.title} - ${currentUser.name}`,
          position: selectedJob.title,
          applicant_name: currentUser.name,
          applicant_email: currentUser.email,
          education: education,
          skills: skills,
          details: details,
          _template: "table",
          _captcha: "false"
        })
      });
    } catch (error) {
      console.warn("Email dispatch failed, but application is saved in system.", error);
    }

    // 4. Always Success from UI perspective since data is saved
    setStatus('success');
    setEducation('');
    setSkills('');
    setDetails('');
  };

  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
    setStatus('idle');
    setEducation('');
    setSkills('');
    setDetails('');
  };

  const isApplied = (jobId: string) => {
     return userApplications.some(app => app.jobId === jobId);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in space-y-20">
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={closeApplyModal} />
          
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-white/20 flex flex-col max-h-[90vh]">
            
            <div className="h-20 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center px-6 relative shrink-0">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase size={20} /> {selectedJob.id === 'general_application' ? 'Contact / Apply' : `Apply: ${selectedJob.title}`}
               </h3>
               <button onClick={closeApplyModal} className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                  <X size={18} />
               </button>
            </div>

            <div className="p-6 overflow-y-auto">
               {status === 'success' ? (
                  <div className="text-center py-8 animate-fade-in">
                     <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Received</h2>
                     <p className="text-gray-500 dark:text-gray-400 mb-8 px-4 text-lg">
                        We have received your application. You can track the status in your <strong>Profile</strong> under <strong>"My Job Applications"</strong>.
                     </p>
                     <div className="space-y-3">
                        <button onClick={closeApplyModal} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-colors">
                           Close
                        </button>
                     </div>
                  </div>
               ) : (
                  <form onSubmit={handleSubmitApplication} className="space-y-5">
                     <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Applying As</p>
                        <div className="flex items-center gap-3">
                           <img src={currentUser?.avatar} className="w-8 h-8 rounded-full" alt="User" />
                           <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{currentUser?.name}</p>
                              <p className="text-xs text-gray-500">{currentUser?.email}</p>
                           </div>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1 flex items-center gap-1">
                           <GraduationCap size={14} /> Education
                        </label>
                        <input 
                           required
                           className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                           placeholder="e.g. BS Computer Science, University of Lahore"
                           value={education}
                           onChange={(e) => setEducation(e.target.value)}
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1 flex items-center gap-1">
                           <PenTool size={14} /> Key Skills
                        </label>
                        <input 
                           required
                           className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                           placeholder="e.g. React, Writing, Video Editing"
                           value={skills}
                           onChange={(e) => setSkills(e.target.value)}
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1 flex items-center gap-1">
                           <FileText size={14} /> Detailed Information
                        </label>
                        <textarea 
                           required
                           rows={5}
                           className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all resize-none"
                           placeholder="Why are you a good fit? Tell us about your experience..."
                           value={details}
                           onChange={(e) => setDetails(e.target.value)}
                        />
                     </div>

                     <button 
                        type="submit" 
                        disabled={status === 'sending'}
                        className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                     >
                        {status === 'sending' ? (
                           <><Loader2 size={20} className="animate-spin" /> Saving Application...</>
                        ) : (
                           <><Send size={20} /> Submit Application</>
                        )}
                     </button>
                  </form>
               )}
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-6 py-12">
        <div className="inline-block p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full mb-4">
          <Briefcase size={32} />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-gray-900 dark:text-white tracking-tight">
          Join the <span className="text-primary">Roza News</span> Team
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-light">
          We are building the future of digital journalism. If you are passionate about truth, technology, and storytelling, we want to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Globe className="text-blue-500 mb-4" size={40} />
          <h3 className="text-xl font-bold mb-2 dark:text-white">Global Impact</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your work will reach millions of readers across 120+ countries. We cover stories that matter on a global scale.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Zap className="text-yellow-500 mb-4" size={40} />
          <h3 className="text-xl font-bold mb-2 dark:text-white">Innovation First</h3>
          <p className="text-gray-600 dark:text-gray-400">
            We operate at the intersection of media and tech. We use AI and modern tools to enhance reporting, not replace it.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Heart className="text-red-500 mb-4" size={40} />
          <h3 className="text-xl font-bold mb-2 dark:text-white">Health & Wellness</h3>
          <p className="text-gray-600 dark:text-gray-400">
            We offer comprehensive health benefits, flexible remote work policies, and unlimited PTO to prevent burnout.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-10 dark:text-white border-l-4 border-primary pl-4">Open Positions</h2>
        {positions.length === 0 ? (
           <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-gray-500">No open positions at the moment. Please check back later.</p>
           </div>
        ) : (
          <div className="grid gap-6">
            {positions.map(job => {
              const applied = isApplied(job.id);
              return (
                <div key={job.id} className={`group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border transition-all hover:shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${applied ? 'border-green-200 dark:border-green-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{job.title}</h3>
                       <span className="bg-gray-100 dark:bg-gray-700 text-xs font-bold px-2 py-1 rounded text-gray-600 dark:text-gray-300 uppercase">{job.department}</span>
                       {applied && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center"><CheckCircle size={12} className="mr-1"/> Applied</span>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                       <span className="flex items-center"><MapPin size={14} className="mr-1"/> {job.location}</span>
                       <span className="flex items-center"><Clock size={14} className="mr-1"/> {job.type}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                       {job.description}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleApplyClick(job)}
                    className={`${applied ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-red-700'} text-white font-bold py-3 px-8 rounded-full transition-colors flex items-center whitespace-nowrap shadow-md`}
                  >
                    {applied ? 'Check Status' : 'Apply Now'} <ArrowRight size={18} className="ml-2" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gray-900 text-white rounded-3xl p-12 text-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary blur-[100px] opacity-20"></div>
         <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Don't see a perfect fit?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
               We are always looking for talented individuals. Send your resume and portfolio to our HR team, and we'll keep you on file.
            </p>
            <button 
               onClick={() => handleApplyClick(generalInquiryJob)}
               className="inline-flex items-center bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors"
            >
               <Coffee size={20} className="mr-2" /> Email Us
            </button>
         </div>
      </div>
    </div>
  );
};

export default Careers;