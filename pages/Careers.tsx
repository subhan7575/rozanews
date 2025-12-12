import React from 'react';
import { Briefcase, Globe, Zap, Coffee, Heart, ArrowRight, MapPin, Clock } from 'lucide-react';

const Careers: React.FC = () => {
  const positions = [
    {
      id: 1,
      title: "Senior International Correspondent",
      department: "Editorial",
      location: "London, UK (Remote Friendly)",
      type: "Full-time",
      description: "We are looking for a seasoned journalist to cover geopolitical shifts in Europe and the Middle East. Must have 5+ years of experience."
    },
    {
      id: 2,
      title: "Tech & AI Editor",
      department: "Technology",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Lead our coverage on Artificial Intelligence, Silicon Valley trends, and the future of computing. Deep technical understanding required."
    },
    {
      id: 3,
      title: "Frontend Engineer (React)",
      department: "Engineering",
      location: "Remote",
      type: "Contract",
      description: "Help build the next generation of our CMS and reader experience using React, TypeScript, and Tailwind CSS."
    },
    {
      id: 4,
      title: "Data Visualization Specialist",
      department: "Design",
      location: "New York, NY",
      type: "Full-time",
      description: "Turn complex datasets into compelling visual stories. Proficiency in D3.js or similar libraries is a plus."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in space-y-20">
      
      {/* Hero */}
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

      {/* Culture / Benefits */}
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

      {/* Open Positions */}
      <div>
        <h2 className="text-3xl font-bold mb-10 dark:text-white border-l-4 border-primary pl-4">Open Positions</h2>
        <div className="grid gap-6">
          {positions.map(job => (
            <div key={job.id} className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all hover:shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{job.title}</h3>
                   <span className="bg-gray-100 dark:bg-gray-700 text-xs font-bold px-2 py-1 rounded text-gray-600 dark:text-gray-300 uppercase">{job.department}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                   <span className="flex items-center"><MapPin size={14} className="mr-1"/> {job.location}</span>
                   <span className="flex items-center"><Clock size={14} className="mr-1"/> {job.type}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                   {job.description}
                </p>
              </div>
              <button className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors flex items-center whitespace-nowrap shadow-md">
                Apply Now <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-900 text-white rounded-3xl p-12 text-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary blur-[100px] opacity-20"></div>
         <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Don't see a perfect fit?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
               We are always looking for talented individuals. Send your resume and portfolio to our HR team, and we'll keep you on file.
            </p>
            <a href="mailto:careers@rozanews.com" className="inline-flex items-center bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors">
               <Coffee size={20} className="mr-2" /> Email Us
            </a>
         </div>
      </div>
    </div>
  );
};

export default Careers;