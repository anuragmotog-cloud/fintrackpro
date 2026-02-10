
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone. Are you sure you want to proceed?" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 lg:p-10 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onConfirm}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98]"
            >
              Proceed
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-4 rounded-2xl transition-all active:scale-[0.98]"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
