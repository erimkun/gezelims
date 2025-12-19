import { useState, useEffect, type ReactNode } from 'react';
import type { LanguageKey } from './types';
import { I18nContext } from './context';
import { initI18n } from './translations';

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageKey>('tr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize translations
    initI18n();
    setIsLoading(false);

    // Load saved language preference
    const savedLang = localStorage.getItem('language') as LanguageKey;
    if (savedLang && ['tr', 'en', 'de', 'fr', 'es', 'it'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: LanguageKey) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        isLoading,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
