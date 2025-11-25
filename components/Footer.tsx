import React from 'react';
import { useTranslation } from '../LanguageContext';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="w-full text-center p-4 text-xs text-slate-500 shrink-0">
            <div className="flex justify-center items-center gap-x-4 gap-y-1 flex-wrap">
                <span>{t.footer.credit}</span>
                <span className="hidden sm:inline text-slate-400">|</span>
                <span>{t.footer.phone}</span>
                <span className="hidden sm:inline text-slate-400">|</span>
                <a href="mailto:s.m.s2007@hotmail.com" className="text-indigo-600 hover:underline">
                    {t.footer.email}
                </a>
            </div>
        </footer>
    );
};

export default Footer;
