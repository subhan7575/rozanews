import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API Call
    setTimeout(() => {
       setIsLoading(false);
       setStep(2);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-slide-up">
         
         <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors z-10">
            <X size={20} />
         </button>

         {step === 1 ? (
            <div className="p-8">
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                     <ShieldCheck size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black font-display dark:text-white">Roza Premium</h2>
                  <p className="text-gray-500 text-sm mt-1">Unlimited Access. Ad-Free. Exclusive Content.</p>
                  <div className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                     $4.99<span className="text-sm text-gray-500 font-normal">/mo</span>
                  </div>
               </div>

               <form onSubmit={handlePay} className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                     <div className="relative">
                        <CreditCard className="absolute left-3 top-3 text-gray-400" size={18}/>
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:text-white font-mono" required />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:text-white font-mono" required />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC</label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-3 text-gray-400" size={16}/>
                           <input type="text" placeholder="123" className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:text-white font-mono" required />
                        </div>
                     </div>
                  </div>

                  <button 
                     type="submit" 
                     disabled={isLoading}
                     className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-xl mt-4 hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg"
                  >
                     {isLoading ? <span className="animate-spin mr-2">⟳</span> : 'Confirm Payment'}
                  </button>
               </form>
               <div className="mt-4 text-center">
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                     <Lock size={10} /> Secure SSL Encrypted Payment
                  </p>
               </div>
            </div>
         ) : (
            <div className="p-12 text-center">
               <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle size={40} />
               </div>
               <h2 className="text-2xl font-bold dark:text-white mb-2">Welcome to Premium!</h2>
               <p className="text-gray-500 mb-8">Your subscription is active. Enjoy ad-free reading.</p>
               <button onClick={onSuccess} className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg">
                  Continue
               </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default PaymentModal;
