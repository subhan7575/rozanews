import React from 'react';
import { Newspaper, Globe, ShieldCheck, Users, Target, TrendingUp, Award, Quote } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-20">
      
      {/* 1. Hero Section */}
      <div className="text-center space-y-6 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-serif font-black text-gray-900 dark:text-white tracking-tight">
          Redefining <span className="text-primary">Journalism</span> <br /> for the Digital Age
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
          We are <strong>Roza News</strong>. Unbiased. Unfiltered. Unstoppable. 
          Your definitive source for global perspectives in a complex world.
        </p>
      </div>

      {/* 2. Founder's Message - Subhan Ahmad */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="grid md:grid-cols-12 gap-0">
          <div className="md:col-span-5 bg-gradient-to-br from-gray-900 to-gray-800 relative min-h-[300px] flex items-center justify-center">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="text-center p-8 relative z-10">
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full border-4 border-primary overflow-hidden mb-4 shadow-lg">
                  {/* Placeholder for Founder Image */}
                  <Users size={80} className="w-full h-full p-4 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Subhan Ahmad</h3>
                <p className="text-primary font-bold uppercase tracking-widest text-sm">Founder & CEO</p>
             </div>
          </div>
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
             <Quote size={48} className="text-primary/20 mb-4" />
             <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-6">A Vision for Truth</h2>
             <div className="prose dark:prose-invert text-gray-600 dark:text-gray-300">
               <p className="text-lg leading-relaxed mb-4">
                 "When I established <strong>Roza News</strong>, the goal was never to just build another news website. The internet is already flooded with information. My vision was to build a sanctuary for <em>clarity</em>."
               </p>
               <p className="leading-relaxed mb-4">
                 We live in an era where misinformation spreads faster than truth. I wanted to create a platform that respects the reader's intelligence—a place where technology serves journalism, not the other way around. At Roza News, we don't just report what happened; we explain <em>why</em> it matters.
               </p>
               <p className="font-bold text-gray-900 dark:text-white">
                 — Subhan Ahmad
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* 3. Who We Are (Detailed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white border-l-4 border-primary pl-4">
            Who We Are
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            Roza News is a premier digital news organization headquartered with a global mindset. Since our inception, we have rapidly grown into a trusted voice for millions of readers across the globe. We cover the stories that shape our world—from the bustling stock markets of New York and London to the political corridors of power, the stadiums of champions, and the laboratories of future technology.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            Our team is comprised of seasoned journalists, data analysts, and industry experts who are dedicated to the highest standards of reporting. We believe that a well-informed society is the foundation of progress.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl text-center">
              <TrendingUp size={32} className="mx-auto text-blue-600 mb-2"/>
              <span className="block text-3xl font-bold text-gray-900 dark:text-white">10M+</span>
              <span className="text-sm text-gray-500">Monthly Readers</span>
           </div>
           <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl text-center">
              <Globe size={32} className="mx-auto text-red-600 mb-2"/>
              <span className="block text-3xl font-bold text-gray-900 dark:text-white">120+</span>
              <span className="text-sm text-gray-500">Countries Reached</span>
           </div>
           <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center">
              <Newspaper size={32} className="mx-auto text-green-600 mb-2"/>
              <span className="block text-3xl font-bold text-gray-900 dark:text-white">24/7</span>
              <span className="text-sm text-gray-500">Live Coverage</span>
           </div>
           <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl text-center">
              <Award size={32} className="mx-auto text-purple-600 mb-2"/>
              <span className="block text-3xl font-bold text-gray-900 dark:text-white">#1</span>
              <span className="text-sm text-gray-500">Trusted Source</span>
           </div>
        </div>
      </div>

      {/* 4. Our Core Values */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-10 md:p-16 rounded-3xl">
         <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Our Core Pillars</h2>
            <p className="text-gray-500 mt-2">The foundation upon which Roza News stands.</p>
         </div>
         <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
               <ShieldCheck size={40} className="text-primary mb-4" />
               <h3 className="text-xl font-bold mb-3 dark:text-white">Uncompromising Integrity</h3>
               <p className="text-gray-600 dark:text-gray-400">
                 Truth is our currency. We verify every fact, cross-reference every source, and refuse to bow to external pressures. Our loyalty is to the reader alone.
               </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
               <Target size={40} className="text-blue-600 mb-4" />
               <h3 className="text-xl font-bold mb-3 dark:text-white">Objective Analysis</h3>
               <p className="text-gray-600 dark:text-gray-400">
                 We distinguish clearly between news and opinion. Our news reporting is strictly factual, providing you with the raw data you need to form your own worldview.
               </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
               <Users size={40} className="text-green-600 mb-4" />
               <h3 className="text-xl font-bold mb-3 dark:text-white">Human-Centric</h3>
               <p className="text-gray-600 dark:text-gray-400">
                 Behind every headline is a human story. We strive to cover issues that impact real lives, giving a voice to the voiceless and holding power to account.
               </p>
            </div>
         </div>
      </div>

      {/* 5. Editorial Standards & Technology */}
      <div className="space-y-8">
         <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-6">Innovation & Excellence</h2>
         <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
           <p>
             At Roza News, we combine traditional journalistic rigor with state-of-the-art technology. Under the guidance of <strong>Subhan Ahmad</strong>, we have integrated advanced data analytics and real-time reporting tools to ensure that our news is not just accurate, but also faster than the competition.
           </p>
           <p>
             Our <strong>Editorial Standards</strong> are rigorous. Every article goes through a multi-tier review process. We correct errors transparently and swiftly. We protect our sources. We believe that in the digital age, trust is hard to gain and easy to lose, which is why we treat every story with the gravity it deserves.
           </p>
           <p>
             Whether you are reading us on your desktop in an office in New York, or on your mobile device in a cafe in Lahore, our responsive technology ensures you get a seamless reading experience, optimized for speed and accessibility.
           </p>
         </div>
      </div>

      {/* 6. Contact / CTA */}
      <div className="bg-primary text-white p-12 rounded-2xl text-center">
        <h2 className="text-3xl font-bold mb-4">Join the Conversation</h2>
        <p className="text-red-100 max-w-2xl mx-auto mb-8 text-lg">
          Roza News is more than a website; it's a community. Follow us, share our stories, and be a part of the global dialogue.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
           <a href="#/contact" className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
             Contact Our Team
           </a>
           <a href="#/" className="bg-red-800 text-white border border-red-700 px-8 py-3 rounded-full font-bold hover:bg-red-900 transition-colors">
             Start Reading
           </a>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm pt-8 border-t border-gray-200 dark:border-gray-800">
        <p>© {new Date().getFullYear()} Roza News Media Group. All rights reserved.</p>
        <p>Leadership: Subhan Ahmad (CEO & Founder)</p>
      </div>

    </div>
  );
};

export default About;