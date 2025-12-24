
import React from 'react';
import { X, Loader2, MessageCircle } from 'lucide-react';

// --- WhatsApp Button (New) ---
interface WhatsAppButtonProps {
  phone: string;
  label?: string;
  compact?: boolean;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phone, label, compact, className = '' }) => {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const waUrl = `https://wa.me/${cleanPhone}`;
  
  if (!phone) return null;

  return (
    <a 
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 border
        bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800
        ${compact ? 'p-1.5' : 'px-3 py-2 text-sm'}
        ${className}
      `}
      title="مراسلة عبر واتساب"
    >
      <MessageCircle size={compact ? 16 : 18} />
      {!compact && <span dir="ltr" className="font-bold font-mono">{label || phone}</span>}
    </a>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-all duration-200 hover:shadow-md ${className}`} style={style}>
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 focus:ring-blue-500 border border-transparent",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 focus:ring-slate-400 border border-transparent",
    danger: "bg-white border border-red-200 text-red-600 hover:bg-red-50 focus:ring-red-500 shadow-sm",
    outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-400 shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin ml-2" size={16} />}
      {children}
    </button>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple' }> = ({ children, color = 'gray' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    green: 'bg-green-50 text-green-700 border border-green-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
    gray: 'bg-slate-50 text-slate-700 border border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-right shadow-2xl transition-all w-full ${maxWidth} border border-slate-100 dark:border-slate-800`}>
          <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold leading-6 text-slate-900 dark:text-white" id="modal-title">{title}</h3>
            <button 
              onClick={onClose} 
              className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-500 transition-colors focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-6 py-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Form Components ---
// Refined inputs for professional look: White bg, subtle border, clear text
const inputBaseStyles = "w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="mb-4 group">
    {label && <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
    <input 
      className={`${inputBaseStyles} ${className}`}
      {...props}
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
    <div className="relative">
      <select 
        className={`${inputBaseStyles} appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-slate-500">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
    <textarea 
      className={`${inputBaseStyles} ${className}`}
      rows={3}
      {...props}
    />
  </div>
);
