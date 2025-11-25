
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { translations } from './translations';

type Language = 'ar' | 'en';

// Define a single source of truth for the translation type, assuming 'en' and 'ar' are structurally identical.
type TranslationSet = typeof translations['en'];

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: TranslationSet;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'ar' ? 'en' : 'ar'));
  };
  
  // Cast the selected translation to the canonical type to resolve the union type issue at the provider level.
  const t = useMemo(() => translations[language] as TranslationSet, [language]);

  const value: LanguageContextType = {
    language,
    toggleLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
