
import React from 'react';
import { useTranslation } from '../LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl' | 'max-w-5xl' | 'max-w-7xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'max-w-lg' }) => {
  if (!isOpen) return null;
  const { language } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-lg border border-slate-200 w-full ${size} p-6 relative mx-4 flex flex-col`} style={{maxHeight: '90vh'}} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b mb-4">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
           <button onClick={onClose} className={`p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
