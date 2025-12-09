import React, { useState } from 'react';
import { MOCK_ADMIN_EMAIL } from '../constants';
import { Mail, Send, AlertTriangle, CheckCircle, WifiOff } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    // REAL SECURE SENDING via FormSubmit API
    // This connects directly to the email service without exposing backend credentials.
    try {
      const response = await fetch("https://formsubmit.co/ajax/jobsofficial786@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email, // This sets the Reply-To automatically
          message: formData.message,
          _subject: `New Contact from Roza News: ${formData.name}`,
          _template: "table",
          _captcha: "false" // Attempts to disable captcha for smoother UX
        })
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' }); // Clear form
      } else {
        throw new Error("Service returned an error.");
      }
    } catch (error) {
      console.error("Email send failed:", error);
      setStatus('error');
      setErrorMessage("Could not connect to the email server. Please check your internet connection.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary mb-4">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Roza News</h2>
          <p className="text-gray-500 mt-2">Have a story tip or a technical issue? Securely message our team.</p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-8 rounded-xl text-center animate-fade-in">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-2xl mb-2">Message Sent!</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Thank you for contacting us. We have received your message at <span className="font-mono bg-white dark:bg-black/20 px-1 rounded">jobsofficial786@gmail.com</span> and will reply shortly.
            </p>
            <button 
              onClick={() => setStatus('idle')} 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg flex items-center">
                <WifiOff size={20} className="mr-2" />
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="Subhan Ahmad"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input 
                required
                type="email" 
                placeholder="you@example.com"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea 
                required
                rows={5}
                placeholder="Write your message here..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800/30 p-3 rounded flex items-start text-xs text-yellow-800 dark:text-yellow-200/70">
               <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
               <p>Your data is processed securely. We do not share your email with third parties. IP addresses are logged for spam prevention.</p>
            </div>

            <button 
              type="submit" 
              disabled={status === 'sending'}
              className="w-full bg-primary hover:bg-red-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-all transform hover:-translate-y-1 shadow-md flex justify-center items-center"
            >
              {status === 'sending' ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Sending Securely...
                </span>
              ) : (
                  <>
                    <Send size={18} className="mr-2" /> Send Message
                  </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;