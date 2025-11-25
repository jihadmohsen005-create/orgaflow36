
import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const SuccessIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);


const toastConfig = {
  success: {
    icon: <SuccessIcon />,
    bg: 'bg-green-500',
    text: 'text-white'
  },
  error: {
    icon: <ErrorIcon />,
    bg: 'bg-red-500',
    text: 'text-white'
  },
  info: {
    icon: <InfoIcon />,
    bg: 'bg-blue-500',
    text: 'text-white'
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true); // Trigger fade-in
  }, []);

  const config = toastConfig[type];

  return (
    <div
      className={`flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform min-w-[300px] max-w-md ${config.bg} ${config.text} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
      role="alert"
    >
      <div className="flex-shrink-0">{React.cloneElement(config.icon, { className: 'w-6 h-6' })}</div>
      <div className="mx-3 text-sm font-medium">{message}</div>
      <button
        onClick={onClose}
        className="p-1.5 -mx-1.5 -my-1.5 ml-auto rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};

export default Toast;
