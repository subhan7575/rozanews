
import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = {
    success: { icon: <CheckCircle className="text-green-500" size={18}/>, bg: 'bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900/50' },
    error: { icon: <AlertCircle className="text-red-500" size={18}/>, bg: 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50' },
    info: { icon: <Info className="text-blue-500" size={18}/>, bg: 'bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50' }
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-slide-up ${config[type].bg}`}>
      {config[type].icon}
      <span className="text-sm font-bold dark:text-white whitespace-nowrap">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-black/5 rounded-full"><X size={14} className="text-gray-400"/></button>
    </div>
  );
};

export default Toast;
