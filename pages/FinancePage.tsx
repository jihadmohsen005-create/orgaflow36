import React from 'react';
import { useTranslation } from '../LanguageContext';
import { FinanceIcon } from '../components/icons';

const FinancePage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-slate-50 p-0 sm:p-0 -m-4 md:-m-6">
             <style>{`
                .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #ffffff; color: #0f172a; transition: background-color .15s, border-color .15s; }
                .form-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 1px #4f46e5; }
                .form-input:read-only, .form-input:disabled { background-color: #f1f5f9; cursor: not-allowed; }
                .btn-primary { padding: 0.625rem 1.25rem; background-color: #4f46e5; color: white; border-radius: 0.5rem; font-weight: 600; transition: background-color .15s; }
                .btn-primary:hover { background-color: #4338ca; }
                .btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; }
                .btn-secondary { padding: 0.625rem 1.25rem; background-color: #e2e8f0; color: #1e293b; border-radius: 0.5rem; font-weight: 600; transition: background-color .15s; }
                .btn-secondary:hover { background-color: #cbd5e1; }
            `}</style>
            <div className="flex items-center gap-4 mb-6 pb-4 border-b bg-white p-6 rounded-t-xl">
                <div className="p-3 bg-green-100 rounded-lg"><FinanceIcon className="w-8 h-8 text-green-700"/></div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t.nav.finance}</h1>
            </div>

            {/* This component is currently empty */}
        </div>
    );
};

export default FinancePage;